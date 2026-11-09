<script lang="ts">
	import CollapsibleSection from '@/ui/settings/svelte/sections/CollapsibleSection.svelte'
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import { Notice } from 'obsidian';
	import { TAGS_BEHAVIOR } from '@/ui/settings/svelte/constants.svelte.js';
	import { settingsStore } from '@/ui/settings/settingsstore';
	import { t } from '@/i18n';

	export let open = false;
	export let plugin;

	/**
	 * 说明文字里有加粗标记，因此走 {@html}。项目名/标签是用户与滴答清单
	 * 提供的任意字符串，必须转义后再插入，否则会构成 HTML 注入。
	 */
	function escapeForHtml(value: string | undefined): string {
		if (!value) return '';
		return value
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	let projects: Array<{ id: string; name: string }> = [];
	let myProjectsOptions: Record<string, string> = {};
	let selectedSyncProject = '';
	let defaultProjectId = '';
	let tagAndOr: number = 1;
	$: tagAndOrString = tagAndOr.toString();
	let syncTag = '';
	let folder = '';
	let debounceTimeout: ReturnType<typeof setTimeout>;

	const dispatch = createEventDispatcher();

	function handleHeaderClick() {
		dispatch('toggle');
	}

	type SyncExplanationData = {
		project?: string,
		tag?: string,
		andOr?: boolean // true = AND, false = OR, undefined = not applicable
	};

	// Sync with store on load and change
	$: selectedSyncProject = $settingsStore.SyncProject ?? '';
	$: defaultProjectId = $settingsStore.defaultProjectId ?? '';
	$: tagAndOr = $settingsStore.tagAndOr ?? 1;
	$: syncTag = $settingsStore.SyncTag ?? '';

	async function handleSyncProjectChange(value: string) {
		settingsStore.update((s) => ({ ...s, SyncProject: value }));
		selectedSyncProject = value;

		const fileMetaData = await plugin.fileMetadataService?.getAllFileMetadata() ?? {};
		const defaultProjectFileEntry = Object.values(fileMetaData).find(
			(obj: any) => obj.defaultProjectId === value
		);
		if (!defaultProjectFileEntry) {
			const noticeMsg = t('settings.limit.noDefaultFile', { project: myProjectsOptions?.[value] ?? '' });
			new Notice(noticeMsg, 5000);
		}
		await plugin.saveSettings();
	}
	async function handleTagAndOrChange(value: string) {
		const num = parseInt(value);
		settingsStore.update((s) => ({ ...s, tagAndOr: num }));
		tagAndOr = num;
		await plugin.saveSettings();
	}

	let syncExplanationData: SyncExplanationData = {};

	function updateSyncExplanationData(myProjectsOptions: Record<string, string>) {
		const project = myProjectsOptions[$settingsStore.SyncProject];
		const tag = $settingsStore.SyncTag;
		const andOr = (project && tag) ? ($settingsStore.tagAndOr == 1) : undefined;

		syncExplanationData = { project, tag, andOr };
	}

	$: updateSyncExplanationData(myProjectsOptions);

	function getMyProjectsOptions() {
		return projects.reduce((obj, item) => {
			obj[item.id] = item.name;
			return obj;
		}, {});
	}
	function handleSyncTagChange(value: string) {
		syncTag = value;
		settingsStore.update((s) => ({ ...s, SyncTag: value }));
		if (debounceTimeout) clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(async () => {
			await plugin.saveSettings();
		}, 800);
	}
	onMount(async () => {
		projects = await plugin.service.getProjects?.() ?? [];
		myProjectsOptions = getMyProjectsOptions();
		selectedSyncProject = $settingsStore.SyncProject ?? '';
		defaultProjectId = $settingsStore.defaultProjectId ?? '';
		tagAndOr = $settingsStore.tagAndOr ?? 1;
		syncTag = $settingsStore.SyncTag ?? '';
		updateSyncExplanationData(myProjectsOptions);
	});
</script>

<CollapsibleSection
	title={t('settings.limit.title')}
	shortDesc={t('settings.limit.shortDesc')}
	open={open}
	on:headerClick={handleHeaderClick}
>
	<div class="setting-item-description">
		{t('settings.limit.desc')}
	</div>

	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">{t('settings.limit.projectName')}</div>
			<div class="setting-item-description">{t('settings.limit.projectDesc')}</div>
		</div>
		<div class="setting-item-control">
			<select
				class="dropdown"
				id="sync-project"
				bind:value={selectedSyncProject}
				on:change={(e: Event) => {
				handleSyncProjectChange((e.target as HTMLSelectElement).value);
				updateSyncExplanationData(myProjectsOptions);}}
			>
				<option value="">{t('common.none')}</option>
				{#each Object.entries(myProjectsOptions) as [id, name]}
					<option value={id}>{name}</option>
				{/each}
			</select>
		</div>
	</div>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">{t('settings.limit.tagBehaviorName')}</div>
			<div class="setting-item-description">{t('settings.limit.tagBehaviorDesc')}</div>
		</div>
		<div class="setting-item-control">
			<select
				class="dropdown"
				id="tag-and-or"
				bind:value={tagAndOrString}
				on:change={(e: Event) => {
				handleTagAndOrChange((e.target as HTMLSelectElement).value);
				updateSyncExplanationData(myProjectsOptions);}}
			>
				{#each Object.entries(TAGS_BEHAVIOR) as [num, label]}
					<option value={num}>{label}</option>
				{/each}
			</select>
		</div>
	</div>

	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">{t('settings.limit.tagName')}</div>
			<div class="setting-item-description">{t('settings.limit.tagDesc')}</div>
		</div>
		<div class="setting-item-control">
			<input
				id="sync-tag"
				type="text"
				bind:value={syncTag}
				placeholder={t('settings.limit.tagPlaceholder')}
				on:input={(e: Event) => {
					handleSyncTagChange((e.target as HTMLInputElement).value);
					updateSyncExplanationData(myProjectsOptions);}}
			/>
		</div>
	</div>
	<!-- In your relevant markup location: -->
	<div class="sync-explanation">
		{#if !syncExplanationData.project && !syncExplanationData.tag}
			<p>{t('settings.limit.noLimit')}</p>
		{:else if syncExplanationData.project && !syncExplanationData.tag}
			<p>{@html t('settings.limit.onlyProject', { project: escapeForHtml(syncExplanationData.project) })}</p>
		{:else if !syncExplanationData.project && syncExplanationData.tag}
			<p>{@html t('settings.limit.onlyTag', { tag: escapeForHtml(syncExplanationData.tag) })}</p>
		{:else if syncExplanationData.andOr}
			<p>
				{@html t('settings.limit.projectAndTag', {
					project: escapeForHtml(syncExplanationData.project!),
					tag: escapeForHtml(syncExplanationData.tag!),
				})}
			</p>
		{:else}
			<p>
				{@html t('settings.limit.projectOrTag', {
					project: escapeForHtml(syncExplanationData.project!),
					tag: escapeForHtml(syncExplanationData.tag!),
				})}
			</p>
		{/if}
	</div>

</CollapsibleSection>
