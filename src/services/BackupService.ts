/**
 * BackupService - exports TickTick data to a CSV file inside the vault.
 *
 * Design notes:
 * - The export is a full dump of every task, so it is opt-in on startup
 *   (`backupOnStartup`, default off) rather than automatic.
 * - Files are overwritten when a name already exists and old exports are
 *   pruned to `backupRetentionCount`, so the vault cannot accumulate an
 *   unbounded pile of backup files.
 * - The export endpoint is rate limited by TickTick, so failures are logged
 *   quietly on startup instead of raising a Notice every launch.
 */

import { App, Notice, TFile, normalizePath } from 'obsidian';
import type TickTickSync from '@/main';
import { getSettings } from '@/settings';
import log from '@/utils/logger';
import { t } from '@/i18n';

/** Filename prefix shared by every backup this plugin writes. */
export const BACKUP_FILE_PREFIX = 'ticktick-backup-';
export const BACKUP_FILE_EXTENSION = 'csv';

/**
 * Build a sortable, collision-free timestamp: `YYYYMMDD-HHmmss` in local time.
 * Zero padded so that lexicographic order matches chronological order, which
 * is what the pruning logic relies on.
 */
export function formatBackupTimestamp(date: Date = new Date()): string {
	const pad = (value: number): string => String(value).padStart(2, '0');
	return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
		+ `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

/** Normalize the configured backup folder to a vault-relative path ('' = root). */
export function normalizeBackupFolder(folder: string | undefined): string {
	if (!folder) return '';
	const trimmed = folder.replace(/^\/+/, '').replace(/\/+$/, '');
	return trimmed;
}

/** Build the full vault path of a backup file created at `date`. */
export function buildBackupPath(folder: string | undefined, date: Date = new Date()): string {
	const safeFolder = normalizeBackupFolder(folder);
	const fileName = `${BACKUP_FILE_PREFIX}${formatBackupTimestamp(date)}.${BACKUP_FILE_EXTENSION}`;
	return normalizePath(safeFolder ? `${safeFolder}/${fileName}` : fileName);
}

/** True when `file` is one of our backup files (not some unrelated user CSV). */
export function isBackupFileName(name: string): boolean {
	return name.startsWith(BACKUP_FILE_PREFIX) && name.endsWith(`.${BACKUP_FILE_EXTENSION}`);
}

export class BackupService {
	private app: App;
	private plugin: TickTickSync;

	constructor(app: App, plugin: TickTickSync) {
		this.app = app;
		this.plugin = plugin;
	}

	/**
	 * Export TickTick data and write it into the vault, then prune old exports.
	 *
	 * Resolves after the file is on disk so callers can await completion; it
	 * never throws, so a startup call cannot abort plugin initialization.
	 */
	async backupTickTickData(options: { quiet?: boolean } = {}): Promise<string | null> {
		const quiet = options.quiet ?? false;
		const folder = normalizeBackupFolder(getSettings().bkupFolder);

		try {
			const bkupData = await this.plugin.tickTickRestAPI?.exportData();
			if (!bkupData) {
				log.warn('TickTick backup: export returned no data; nothing written.');
				if (!quiet) {
					new Notice(t('backup.empty'), 5000);
				}
				return null;
			}

			const path = await this.writeBackupFile(folder, bkupData);
			await this.pruneOldBackups(folder, getSettings().backupRetentionCount);

			if (!quiet) {
				new Notice(t('backup.saved', { path }));
			}
			return path;
		} catch (error) {
			log.error('An error occurred while creating TickTick backup:', error);
			if (!quiet) {
				new Notice(
					t('backup.error', { message: error instanceof Error ? error.message : String(error) }),
					5000
				);
			}
			return null;
		}
	}

	/**
	 * Write the export, reusing the target path when a file already exists so a
	 * retry inside the same second overwrites instead of failing.
	 */
	private async writeBackupFile(folder: string, data: string): Promise<string> {
		await this.ensureFolderExists(folder);

		const path = buildBackupPath(folder);
		const existing = this.app.vault.getAbstractFileByPath(path);
		if (existing instanceof TFile) {
			// Same-second retry: overwrite rather than throwing "File already exists".
			await this.app.vault.modify(existing, data);
			return path;
		}

		try {
			await this.app.vault.create(path, data);
			return path;
		} catch (error) {
			// Race with another writer: fall back to overwriting the existing file.
			if (!(error instanceof Error) || !error.message.includes('File already exists')) {
				throw error;
			}
			const racedFile = this.app.vault.getAbstractFileByPath(path);
			if (racedFile instanceof TFile) {
				await this.app.vault.modify(racedFile, data);
				return path;
			}
			throw error;
		}
	}

	private async ensureFolderExists(folder: string): Promise<void> {
		if (!folder) return;
		const parts = folder.split('/').filter(Boolean);
		let current = '';
		for (const part of parts) {
			current = current ? `${current}/${part}` : part;
			if (!this.app.vault.getAbstractFileByPath(current)) {
				try {
					await this.app.vault.createFolder(current);
				} catch (error) {
					if (!(error instanceof Error) || !error.message.includes('Folder already exists')) {
						throw error;
					}
				}
			}
		}
	}

	/**
	 * Keep the newest `retention` backup files in `folder` and trash the rest.
	 * Only files this plugin created (matching the prefix) are considered, so a
	 * user's own CSVs in the same folder are never touched.
	 */
	async pruneOldBackups(folder: string, retention: number): Promise<number> {
		const keep = Number.isFinite(retention) ? Math.max(1, Math.floor(retention)) : 3;

		const candidates = this.app.vault.getFiles()
			.filter(file => isBackupFileName(file.name))
			.filter(file => (file.parent?.path ?? '') === (folder || '/'))
			.sort((a, b) => b.name.localeCompare(a.name)); // newest first

		const stale = candidates.slice(keep);
		let removed = 0;
		for (const file of stale) {
			try {
				await this.app.fileManager.trashFile(file);
				removed++;
			} catch (trashError) {
				// Trashing can fail (e.g. no trash folder configured on this
				// platform). Leaving one extra backup behind is preferable to
				// failing the whole backup run, so just warn.
				log.warn(`TickTick backup: could not remove old backup ${file.path}`, trashError);
			}
		}

		if (removed > 0) {
			log.info(`TickTick backup: pruned ${removed} old backup file(s), keeping ${keep}.`);
		}
		return removed;
	}
}
