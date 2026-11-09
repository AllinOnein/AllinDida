import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
	exportData: vi.fn(),
	create: vi.fn(),
	modify: vi.fn(),
	createFolder: vi.fn(),
	getAbstractFileByPath: vi.fn(),
	getFiles: vi.fn(),
	trashFile: vi.fn(),
	deleteFile: vi.fn(),
	notice: vi.fn(),
	settings: {
		bkupFolder: '/',
		backupRetentionCount: 3,
		backupOnStartup: false,
	},
}));

vi.mock('obsidian', () => {
	const TFile = class {};
	const TFolder = class {};
	return {
		App: class {},
		TFile,
		TFolder,
		Notice: class {
			constructor(message: string) {
				mocks.notice(message);
			}
		},
		normalizePath: (p: string) => p.replace(/^\/+/, '').replace(/\/+$/, ''),
	};
});

vi.mock('@/settings', () => ({
	getSettings: () => mocks.settings,
}));

vi.mock('@/utils/logger', () => ({
	default: { debug: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

import { TFile } from 'obsidian';
import {
	BackupService,
	BACKUP_FILE_PREFIX,
	buildBackupPath,
	formatBackupTimestamp,
	isBackupFileName,
	normalizeBackupFolder,
} from '@/services/BackupService';

/**
 * Minimal fake TFile: `BackupService` only relies on `name`, `parent.path`
 * and `instanceof TFile`, so this mixes the mocked prototype with those fields.
 */
function fakeFile(name: string, folderPath = '/'): TFile {
	const file = Object.create(TFile.prototype) as TFile;
	Object.assign(file, { name, parent: { path: folderPath } });
	return file;
}

function makeApp() {
	return {
		vault: {
			getAbstractFileByPath: mocks.getAbstractFileByPath,
			create: mocks.create,
			modify: mocks.modify,
			createFolder: mocks.createFolder,
			getFiles: mocks.getFiles,
			delete: mocks.deleteFile,
		},
		fileManager: { trashFile: mocks.trashFile },
	} as never;
}

function makePlugin(exported: string | null) {
	mocks.exportData.mockResolvedValue(exported);
	return { tickTickRestAPI: { exportData: mocks.exportData } } as never;
}

describe('BackupService helpers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.settings.bkupFolder = '/';
		mocks.settings.backupRetentionCount = 3;
	});

	it('formats a zero padded sortable timestamp', () => {
		const stamp = formatBackupTimestamp(new Date(2026, 0, 5, 7, 8, 9));
		expect(stamp).toBe('20260105-070809');
	});

	it('keeps lexicographic order equal to chronological order', () => {
		const early = formatBackupTimestamp(new Date(2026, 0, 5, 7, 8, 9));
		const late = formatBackupTimestamp(new Date(2026, 10, 20, 17, 18, 19));
		expect(early < late).toBe(true);
	});

	it('normalizes the configured folder to a vault relative path', () => {
		expect(normalizeBackupFolder('/')).toBe('');
		expect(normalizeBackupFolder('/backups/')).toBe('backups');
		expect(normalizeBackupFolder('backups')).toBe('backups');
		expect(normalizeBackupFolder(undefined)).toBe('');
	});

	it('builds a path in the vault root when no folder is configured', () => {
		const path = buildBackupPath('/', new Date(2026, 0, 5, 7, 8, 9));
		expect(path).toBe(`${BACKUP_FILE_PREFIX}20260105-070809.csv`);
	});

	it('builds a path inside the configured folder', () => {
		const path = buildBackupPath('/backups/', new Date(2026, 0, 5, 7, 8, 9));
		expect(path).toBe(`backups/${BACKUP_FILE_PREFIX}20260105-070809.csv`);
	});

	it('recognises only its own backup files', () => {
		expect(isBackupFileName('ticktick-backup-20260105-070809.csv')).toBe(true);
		expect(isBackupFileName('my-own-export.csv')).toBe(false);
		expect(isBackupFileName('ticktick-backup-20260105-070809.md')).toBe(false);
	});
});

describe('BackupService backupTickTickData', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.settings.bkupFolder = '/';
		mocks.settings.backupRetentionCount = 3;
		mocks.getAbstractFileByPath.mockReturnValue(undefined);
		mocks.create.mockResolvedValue(undefined);
		mocks.createFolder.mockResolvedValue(undefined);
		mocks.getFiles.mockReturnValue([]);
		mocks.trashFile.mockResolvedValue(undefined);
	});

	it('writes the export into the vault and returns its path', async () => {
		const service = new BackupService(makeApp(), makePlugin('a,b\n1,2'));
		const path = await service.backupTickTickData();

		expect(mocks.create).toHaveBeenCalledOnce();
		expect(mocks.create.mock.calls[0][0]).toBe(path);
		expect(mocks.create.mock.calls[0][1]).toBe('a,b\n1,2');
		expect(path).toMatch(/^ticktick-backup-\d{8}-\d{6}\.csv$/);
	});

	it('overwrites an existing file instead of failing', async () => {
		mocks.getAbstractFileByPath.mockReturnValue(fakeFile('existing'));
		const service = new BackupService(makeApp(), makePlugin('data'));

		await service.backupTickTickData();

		expect(mocks.modify).toHaveBeenCalledOnce();
		expect(mocks.create).not.toHaveBeenCalled();
	});

	it('does not write anything when the export returns no data', async () => {
		const service = new BackupService(makeApp(), makePlugin(null));
		const path = await service.backupTickTickData({ quiet: true });

		expect(path).toBeNull();
		expect(mocks.create).not.toHaveBeenCalled();
	});

	it('logs quietly and shows no Notice when quiet', async () => {
		const service = new BackupService(makeApp(), makePlugin(null));
		await service.backupTickTickData({ quiet: true });
		expect(mocks.notice).not.toHaveBeenCalled();
	});

	it('shows a Notice on manual backup failure', async () => {
		const service = new BackupService(makeApp(), makePlugin(null));
		await service.backupTickTickData();
		expect(mocks.notice).toHaveBeenCalledOnce();
	});

	it('creates the configured backup folder before writing', async () => {
		mocks.settings.bkupFolder = 'backups/nested';
		mocks.getAbstractFileByPath.mockReturnValue(undefined);
		const service = new BackupService(makeApp(), makePlugin('data'));

		await service.backupTickTickData();

		expect(mocks.createFolder.mock.calls.map(c => c[0])).toEqual(['backups', 'backups/nested']);
		expect(mocks.create.mock.calls[0][0]).toMatch(/^backups\/nested\/ticktick-backup-/);
	});
});

describe('BackupService pruning', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.settings.bkupFolder = '/';
		mocks.settings.backupRetentionCount = 2;
		mocks.getAbstractFileByPath.mockReturnValue(undefined);
		mocks.create.mockResolvedValue(undefined);
		mocks.trashFile.mockResolvedValue(undefined);
	});

	it('keeps only the newest N backup files and trashes the rest', async () => {
		mocks.getFiles.mockReturnValue([
			fakeFile('ticktick-backup-20260101-000000.csv'),
			fakeFile('ticktick-backup-20260103-000000.csv'),
			fakeFile('ticktick-backup-20260102-000000.csv'),
		]);
		const service = new BackupService(makeApp(), makePlugin('data'));

		await service.backupTickTickData();

		// newest two are 0103 and 0102; 0101 must be removed.
		expect(mocks.trashFile).toHaveBeenCalledOnce();
		expect(mocks.trashFile.mock.calls[0][0].name).toBe('ticktick-backup-20260101-000000.csv');
	});

	it('never touches files that are not plugin backups', async () => {
		mocks.getFiles.mockReturnValue([
			fakeFile('ticktick-backup-20260101-000000.csv'),
			fakeFile('ticktick-backup-20260102-000000.csv'),
			fakeFile('ticktick-backup-20260103-000000.csv'),
			fakeFile('my-notes-export.csv'),
		]);
		const service = new BackupService(makeApp(), makePlugin('data'));

		await service.backupTickTickData();

		const removed = mocks.trashFile.mock.calls.map(c => c[0].name);
		expect(removed).toEqual(['ticktick-backup-20260101-000000.csv']);
	});

	it('ignores backups that live in a different folder', async () => {
		mocks.settings.bkupFolder = 'backups';
		mocks.getAbstractFileByPath.mockReturnValue(undefined);
		mocks.getFiles.mockReturnValue([
			fakeFile('ticktick-backup-20260101-000000.csv', '/'),
			fakeFile('ticktick-backup-20260102-000000.csv', 'other'),
		]);
		const service = new BackupService(makeApp(), makePlugin('data'));

		await service.backupTickTickData();

		expect(mocks.trashFile).not.toHaveBeenCalled();
	});

	it('always keeps at least one file even with a nonsensical retention', async () => {
		mocks.settings.backupRetentionCount = 0;
		mocks.getFiles.mockReturnValue([
			fakeFile('ticktick-backup-20260101-000000.csv'),
			fakeFile('ticktick-backup-20260102-000000.csv'),
		]);
		const service = new BackupService(makeApp(), makePlugin('data'));

		await service.backupTickTickData();

		// retention clamps to 1 -> only the older file is removed
		expect(mocks.trashFile).toHaveBeenCalledOnce();
		expect(mocks.trashFile.mock.calls[0][0].name).toBe('ticktick-backup-20260101-000000.csv');
	});
});
