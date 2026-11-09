<script lang="ts">
	import { settingsStore } from '@/ui/settings/settingsstore';
	import { updateSettings } from '@/settings';
	import type TickTickSync from '@/main';
	import { LINK_BEHAVIOR, LINK_VISIBILITY } from '@/ui/settings/svelte/constants.svelte.js';
	import './SettingsStyles.css';
	import ResetTasksControl from '@/ui/settings/svelte/ResetTasksControl.svelte';

	import { resetTasks } from '@/ui/settings/utils/ResetSynchronization'
	import { t } from '@/i18n';

	export let plugin: TickTickSync;

	let isWorking: boolean = false;
	let fileLinksInTickTick: string;
	let taskLinksInObsidian: string;
	let syncNotes: boolean;
	let keepProjectFolders: boolean;
	let linkBehaviorOptions: Record<string, string> = LINK_BEHAVIOR;
	let showKeepFoldersModal = false;
	let modalWorking = false;

	// Task display settings
	let readingLink: string;
	let readingId: boolean;
	let readingTag: boolean;
	let editingLink: string;
	let editingId: boolean;
	let editingTag: boolean;
	let stopInjectingTickTickTag: boolean;
	let stripTickTickTagOnReset: boolean;

	let linkVisibilityOptions: Record<string, string> = LINK_VISIBILITY;

	function setIsWorking(value: boolean) {
		isWorking = value;
	}

	let resetTasksText: string = '';
	$: resetTasksText = t('settings.reset.updateTasks');

	async function confirmKeepFoldersChange() {
		modalWorking = true;
		try {
			await plugin.service.reorganizeFilesToFolders();
			await  resetTasks(plugin, setIsWorking)
		} catch (error) {
			console.error('Error reorganizing files:', error);
		} finally {
			showKeepFoldersModal = false;
			modalWorking = false;
		}
	}

	function closeKeepFoldersModal() {
		if (!modalWorking) showKeepFoldersModal = false;
	}

	// Use store subscription for values, and mirror them for form controls
	$: fileLinksInTickTick = $settingsStore.fileLinksInTickTick;
	$: taskLinksInObsidian = $settingsStore.taskLinksInObsidian;
	$: syncNotes = $settingsStore.syncNotes;
	$: keepProjectFolders = $settingsStore.keepProjectFolders;
	$: readingLink = $settingsStore.taskDisplay?.reading?.link ?? 'show';
	$: readingId = $settingsStore.taskDisplay?.reading?.id ?? false;
	$: readingTag = $settingsStore.taskDisplay?.reading?.tag ?? true;
	$: editingLink = $settingsStore.taskDisplay?.editing?.link ?? 'show';
	$: editingId = $settingsStore.taskDisplay?.editing?.id ?? true;
	$: editingTag = $settingsStore.taskDisplay?.editing?.tag ?? true;
	$: stopInjectingTickTickTag = $settingsStore.stopInjectingTickTickTag ?? false;
	$: stripTickTickTagOnReset = $settingsStore.stripTickTickTagOnReset ?? false;

	// Remove noteLink from options if needed
	$: if (!syncNotes) {
		const opt: Record<string, string> = { ...LINK_BEHAVIOR };
		delete opt['noteLink'];
		linkBehaviorOptions = opt;
	} else {
		linkBehaviorOptions = LINK_BEHAVIOR;
	}

	async function handleObsidianTaskLinkChange(value: string) {
		settingsStore.update((s) => ({ ...s, taskLinksInObsidian: value }));
		await plugin.saveSettings();
	}

	async function handleTickTickTaskLinkChange(value: string) {
		settingsStore.update((s) => ({ ...s, fileLinksInTickTick: value }));
		await plugin.saveSettings();
	}

	async function handleKeepProjectFoldersChange(event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		updateSettings({ keepProjectFolders: checked });
		await plugin.saveSettings();

		if (checked) {
			showKeepFoldersModal = true;
		}
	}

	async function handleTaskDisplayChange(field: string, value: any) {
		settingsStore.update((s) => {
			const taskDisplay = s.taskDisplay ?? { reading: { link: 'show', id: false, tag: true }, editing: { link: 'show', id: true, tag: true } };
			const parts = field.split('.');
			return {
				...s,
				taskDisplay: {
					...taskDisplay,
					[parts[0]]: {
						...taskDisplay[parts[0] as 'reading' | 'editing'],
						[parts[1]]: value
					}
				}
			};
		});
		await plugin.saveSettings();
	}

	async function handleStopInjectingTickTickTagChange(event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		updateSettings({ stopInjectingTickTickTag: checked });
		await plugin.saveSettings();
	}

	async function handleStripTickTickTagOnResetChange(event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		updateSettings({ stripTickTickTagOnReset: checked });
		await plugin.saveSettings();
	}
</script>
<div class="{isWorking ? 'wait-cursor' : 'default-cursor'}">
	{#if showKeepFoldersModal}
	<div
		class="local-modal-backdrop"
		role="button"
		tabindex="0"
		on:click={modalWorking ? undefined : closeKeepFoldersModal}
		on:keydown={(e) => { if (!modalWorking && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); closeKeepFoldersModal(); } }}
		aria-label="Close"
		style={modalWorking ? 'cursor: wait;' : ''}
	></div>
	<div
		class="local-modal-dialog"
		role="dialog"
		aria-modal="true"
		style={modalWorking ? 'cursor: wait;' : ''}
	>
		<div class="local-modal-content">
			<h2>{t('settings.tasks.reorganizeTitle')}</h2>
			<p>{t('settings.tasks.reorganizeQuestion')}</p>
			<p>{t('settings.tasks.reorganizeExplain')}</p>
			<p style="color:var(--text-warning);"><em>{t('settings.tasks.reorganizeWarning')}</em></p>
			<div class="local-modal-actions">
				<button class="mod-cta"
					on:click={confirmKeepFoldersChange}
					disabled={modalWorking}>
					{modalWorking ? t('settings.tasks.reorganizing') : t('settings.tasks.yesReorganize')}
				</button>
				<button
					style="margin-left:1em;"
					on:click={closeKeepFoldersModal}
					disabled={modalWorking}
				>
					{t('settings.defaults.noCancel')}
				</button>
			</div>
		</div>
	</div>
{/if}

{#if !syncNotes}
		<div class="setting-item-info">
			<hr>
			<div class="setting-item-name">{t('settings.tasks.notesDisabledTitle')}</div>
			<p>{t('settings.tasks.notesDisabledBody')}</p>
			<hr>
		</div>
	{/if}

	<div class="task-settings ">
		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.tasks.keepFoldersName')}</div>
				<div class="setting-item-description">
					{t('settings.tasks.keepFoldersDesc')}
				</div>
			</div>
			<div class="setting-item-control">
				<input
					type="checkbox"
					checked={keepProjectFolders}
					on:change={handleKeepProjectFoldersChange}
				/>
			</div>
		</div>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.tasks.obsidianLinkName')}</div>
				<div class="setting-item-description">{t('settings.tasks.obsidianLinkDesc')}
				</div>
			</div>
			<div class="setting-item-control">
				<select
					class="dropdown"
					id="sync-project"
					bind:value={taskLinksInObsidian}
					on:change={(e: Event) => handleObsidianTaskLinkChange((e.target as HTMLSelectElement).value)}
				>
					{#each Object.entries(linkBehaviorOptions) as [id, name]}
						<option value={id}>{name}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<div class="task-settings ">
		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.tasks.tickTickLinkName')}</div>
				<div class="setting-item-description">{t('settings.tasks.tickTickLinkDesc')}
				</div>
			</div>
			<div class="setting-item-control">
				<select
					class="dropdown"
					id="sync-project"
					bind:value={fileLinksInTickTick}
					on:change={(e: Event) => handleTickTickTaskLinkChange((e.target as HTMLSelectElement).value)}
				>
					{#each Object.entries(linkBehaviorOptions) as [id, name]}
						<option value={id}>{name}</option>
					{/each}
				</select>
			</div>
		</div>

	</div>

	<hr>

	<div class="task-settings ">
		<h3 class="setting-item-name" style="margin-bottom: 8px;">{t('settings.tasks.displayTitle')}</h3>
		<p class="setting-item-description" style="margin-bottom: 12px;">
			{t('settings.tasks.displayDesc')}
		</p>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.tasks.tickTickLink')}</div>
			</div>
			<div class="setting-item-control" style="gap: 8px; flex-wrap: wrap;">
				<label style="font-size: var(--font-small);">{t('settings.tasks.reading')}:
					<select
						class="dropdown"
						bind:value={readingLink}
						on:change={(e: Event) => handleTaskDisplayChange('reading.link', (e.target as HTMLSelectElement).value)}
					>
						{#each Object.entries(linkVisibilityOptions) as [id, name]}
							<option value={id}>{name}</option>
						{/each}
					</select>
				</label>
				<label style="font-size: var(--font-small);">{t('settings.tasks.edit')}:
					<select
						class="dropdown"
						bind:value={editingLink}
						on:change={(e: Event) => handleTaskDisplayChange('editing.link', (e.target as HTMLSelectElement).value)}
					>
						{#each Object.entries(linkVisibilityOptions) as [id, name]}
							<option value={id}>{name}</option>
						{/each}
					</select>
				</label>
			</div>
		</div>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.tasks.tickTickId')}</div>
			</div>
			<div class="setting-item-control" style="gap: 8px; flex-wrap: wrap;">
				<label style="font-size: var(--font-small);">{t('settings.tasks.reading')}:
					<input
						type="checkbox"
						bind:checked={readingId}
						on:change={(e: Event) => handleTaskDisplayChange('reading.id', (e.target as HTMLInputElement).checked)}
					/>
				</label>
				<label style="font-size: var(--font-small);">{t('settings.tasks.edit')}:
					<input
						type="checkbox"
						bind:checked={editingId}
						on:change={(e: Event) => handleTaskDisplayChange('editing.id', (e.target as HTMLInputElement).checked)}
					/>
				</label>
			</div>
		</div>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.tasks.tickTickTag')}</div>
			</div>
			<div class="setting-item-control" style="gap: 8px; flex-wrap: wrap;">
				<label style="font-size: var(--font-small);">{t('settings.tasks.reading')}:
					<input
						type="checkbox"
						bind:checked={readingTag}
						on:change={(e: Event) => handleTaskDisplayChange('reading.tag', (e.target as HTMLInputElement).checked)}
					/>
				</label>
				<label style="font-size: var(--font-small);">{t('settings.tasks.edit')}:
					<input
						type="checkbox"
						bind:checked={editingTag}
						on:change={(e: Event) => handleTaskDisplayChange('editing.tag', (e.target as HTMLInputElement).checked)}
					/>
				</label>
			</div>
		</div>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.tasks.stopInjectTitle')}</div>
				<div class="setting-item-description">
					{t('settings.tasks.stopInjectDesc')}
				</div>
			</div>
			<div class="setting-item-control">
				<input
					type="checkbox"
					checked={stopInjectingTickTickTag}
					on:change={handleStopInjectingTickTickTagChange}
				/>
			</div>
		</div>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.tasks.stripOnResetTitle')}</div>
				<div class="setting-item-description">
					{t('settings.tasks.stripOnResetDesc')}
				</div>
			</div>
			<div class="setting-item-control">
				<input
					type="checkbox"
					checked={stripTickTickTagOnReset}
					disabled={!stopInjectingTickTickTag}
					on:change={handleStripTickTickTagOnResetChange}
				/>
			</div>
		</div>

		<br>
		<ResetTasksControl
			{isWorking}
			{resetTasksText}
			{plugin}
			{setIsWorking}
		/>

	</div>
</div>
