<script lang="ts">
	import { getSettings, updateSettings } from '@/settings';
	import { settingsStore } from '@/ui/settings/settingsstore';
	import type TickTickSync from '@/main';
	import { Notice, Setting } from 'obsidian';
	import { FolderSuggest } from '@/utils/FolderSuggester';
	import { onMount } from 'svelte';
	import { validateNewFolder } from '@/utils/FolderUtils';
	import { t } from '@/i18n';

	export let plugin: TickTickSync;

	let folderOptions: Record<string, string> = {};
	let isCheckingDatabase = false;

	async function handleManualSync() {
		if (!getSettings().token) {
			new Notice(t('startup.pleaseLogin'));
			return;
		}
		try {
			await plugin.scheduledSynchronization();
			new Notice(t('sync.completed'));
		} catch (error) {
			new Notice(t('sync.error', { message: String(error) }));
		}
	}

	let debounceTimeout: ReturnType<typeof setTimeout>;

	function searchFolder(element: HTMLElement) {
		const setting = new Setting(element)
			.addSearch((search) => {
				search.setPlaceholder(t('settings.manual.selectFolder'))
					.setValue(getSettings().bkupFolder);
				search.setValue(folderOptions[getSettings().bkupFolder]);
				new FolderSuggest(search.inputEl, plugin.app);
				search.onChange((value) => {
					if (debounceTimeout) clearTimeout(debounceTimeout);

					debounceTimeout = setTimeout(async () => {
						const newFolder = await validateNewFolder(plugin.app, value, t('folder.typeBackup'));
						if (newFolder) {
							updateSettings({ bkupFolder: newFolder });
							await plugin.saveSettings();
						}
					}, 700);

				});
			});
	}



	function getFolderOptions() {
		const folders = plugin.app.vault.getAllFolders(true);
		const folderOptions: Record<string, string> = {};
		for (const folder of folders) {
			folderOptions[folder.path] = folder.name;
		}
		return folderOptions;
	}

	async function handleCheckDatabase() {
		isCheckingDatabase = true;
		document.body.style.cursor = 'wait';
		try {
			await plugin.service.checkDataBase();
		} finally {
			isCheckingDatabase = false;
			document.body.style.cursor = '';
		}
	}

	onMount(async () => {
		folderOptions = getFolderOptions();
	});

</script>

<div class="manual-operations">
	{#if getSettings().token}
		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.manual.syncName')}</div>
				<div class="setting-item-description">{t('settings.manual.syncDesc')}</div>
			</div>
			<div class="setting-item-control">
				<button class="mod-cta" on:click={handleManualSync} disabled={isCheckingDatabase}>
					{t('settings.manual.syncButton')}
				</button>
			</div>
		</div>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.manual.checkDbName')}</div>
				<div class="setting-item-description">
					{t('settings.manual.checkDbDesc')}
				</div>
			</div>
			<div class="setting-item-control">
				<button
					class="mod-cta"
					on:click={handleCheckDatabase}
					disabled={isCheckingDatabase}>
					{isCheckingDatabase ? t('settings.manual.checking') : t('settings.manual.checkDbButton')}
				</button>
			</div>
		</div>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.manual.backupName')}</div>
				<div class="setting-item-description">
					{t('settings.manual.backupDesc')}
				</div>
			</div>
			<div class="setting-item-control">
				<button
					class="mod-cta"
					on:click={async () => { await plugin.service.backup(); }}
					disabled={isCheckingDatabase}>
					{t('settings.manual.backupButton')}
				</button>
			</div>
		</div>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.manual.backupOnStartupName')}</div>
				<div class="setting-item-description">
					{t('settings.manual.backupOnStartupDesc')}
				</div>
			</div>
			<div class="setting-item-control">
				<label class="checkbox-container" class:is-enabled={$settingsStore.backupOnStartup}>
					<input
						type="checkbox"
						checked={$settingsStore.backupOnStartup}
						on:change={async (e) => {
							updateSettings({ backupOnStartup: (e.target as HTMLInputElement).checked });
							await plugin.saveSettings();
						}}
					/>
				</label>
			</div>
		</div>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.manual.retentionName')}</div>
				<div class="setting-item-description">
					{t('settings.manual.retentionDesc')}
				</div>
			</div>
			<div class="TTS-setting-item-control">
				<input
					type="number"
					min="1"
					max="20"
					value={getSettings().backupRetentionCount}
					on:change={async (e) => {
						const val = Math.min(20, Math.max(1, parseInt((e.target as HTMLInputElement).value, 10) || 3));
						updateSettings({ backupRetentionCount: val });
						await plugin.saveSettings();
					}}
				/>
			</div>
		</div>
		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.manual.backupFolderName')}</div>
				<div class="setting-item-description">{t('settings.manual.backupFolderDesc')}</div>
			</div>
			<div class="setting-item-control flex-container">
				<div
					class="modal-form remove-padding remove-border fix-suggest"
					use:searchFolder
				>
				</div>
			</div>

		</div>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.manual.purgeName')}</div>
				<div class="setting-item-description">{t('settings.manual.purgeDesc')}</div>
			</div>
			<div class="setting-item-control">
				<button class="mod-cta" on:click={async () => {
					const { CleanupDeletedTasksModal } = await import('@/modals/CleanupDeletedTasksModal');
					const deletedTasks = await plugin.taskRepository.getDeletedTasks();
					if (deletedTasks.length === 0) {
						new Notice(t('task.noDeletedFound'));
						return;
					}
					const modal = new CleanupDeletedTasksModal(plugin.app, deletedTasks);
					const selected = await modal.showModal();
					if (selected.length > 0) {
						await plugin.taskRepository.hardDeleteTasks(selected);
						new Notice(t('task.permanentlyDeleted', { count: selected.length }));
					}
				}} disabled={isCheckingDatabase}>
					{t('settings.manual.purgeButton')}
				</button>
			</div>
		</div>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.manual.recoverName')}</div>
				<div class="setting-item-description">{t('settings.manual.recoverDesc')}</div>
			</div>
			<div class="setting-item-control">
				<button class="mod-cta" on:click={async () => {
					const { RecoverDeletedTasksModal } = await import('@/modals/RecoverDeletedTasksModal');
					const deletedTasks = await plugin.taskRepository.getDeletedTasks();
					if (deletedTasks.length === 0) {
						new Notice(t('task.noDeletedFound'));
						return;
					}
					const modal = new RecoverDeletedTasksModal(plugin.app, plugin, deletedTasks);
					await modal.showModal();
				}} disabled={isCheckingDatabase}>
					{t('settings.manual.recoverButton')}
				</button>
			</div>
		</div>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.manual.retentionDaysName')}</div>
				<div class="setting-item-description">{t('settings.manual.retentionDaysDesc')}</div>
			</div>
			<div class="TTS-setting-item-control">
				<input
					type="number"
					min="1"
					max="31"
					value={getSettings().deletedTaskRetentionDays}
					on:change={async (e) => {
						const val = Math.min(31, Math.max(1, parseInt((e.target as HTMLInputElement).value, 10) || 7));
						updateSettings({ deletedTaskRetentionDays: val });
						await plugin.saveSettings();
					}}
				/>
			</div>
		</div>
	{/if}
</div>
