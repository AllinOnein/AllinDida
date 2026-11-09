<script lang="ts">
	import { App } from 'obsidian';
	import type TickTickSync from '@/main';
	import './SettingsStyles.css';
	import AccessControlLogin from './AccessControlLogin.svelte';
	import ManualSyncOperations from './ManualSyncOperations.svelte';
	import DebugOptionsSettings from './DebugOptionsSettings.svelte';
	import NotesSettings from './NotesSettings.svelte';
	import SyncControlSettings from './sections/SyncControlSettings.svelte';
	import TasksSettings from './TasksSettings.svelte';
	import { getSettings } from '@/settings';
	import { t } from '@/i18n';


	export let app: App;
	export let plugin: TickTickSync;
	/**
	 * 是否显示「库名 -- 版本」。
	 * Obsidian 1.13+ 的 SettingPage 自带标题栏，此时传 false 避免重复；
	 * 旧版 PluginSettingTab 没有标题栏，传 true。
	 */
	export let showMeta: boolean = true;

	const vaultName = app.vault.getName();
	const version = getSettings().version;

	let activeTab = 'access';

	const tabs = {
		access: t('settings.tab.access'),
		sync: t('settings.tab.sync'),
		manual: t('settings.tab.manual'),
		debug: t('settings.tab.debug'),
		tasks: t('settings.tab.tasks'),
		notes: t('settings.tab.notes'),
	};
</script>

<div class="ticktick-settings" class:ticktick-settings--standalone={showMeta}>
	{#if showMeta}
		<div class="ticktick-settings-meta">{vaultName} -- {version}</div>
	{/if}

	<nav class="settings-tabs">
		{#each Object.entries(tabs) as [id, label]}
			<button
				class="tab-button {activeTab === id ? 'active' : ''}"
				on:click={() => activeTab = id}>
				{label}
			</button>
		{/each}
	</nav>

	<div class="TTS-tab-content">
		{#if activeTab === 'access'}
			<AccessControlLogin {plugin} />
		{:else if activeTab === 'sync'}
			<SyncControlSettings {plugin} {app} />
		{:else if activeTab === 'manual'}
			<ManualSyncOperations {plugin} />
		{:else if activeTab === 'debug'}
			<DebugOptionsSettings {plugin} />
		{:else if activeTab === 'notes'}
			<NotesSettings {plugin} />
		{:else if activeTab === 'tasks'}
			<TasksSettings {plugin} />
		{/if}
	</div>
</div>
