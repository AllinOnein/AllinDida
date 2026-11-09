<script lang="ts">
	import CollapsibleSection from '@/ui/settings/svelte/sections/CollapsibleSection.svelte';
	import { createEventDispatcher } from 'svelte';
	import { getSettings, updateSettings } from '@/settings';
	import { Notice } from 'obsidian';
	import { t } from '@/i18n';

	export let open = false;
	export let plugin;

	let automaticSynchronizationInterval: number = getSettings().automaticSynchronizationInterval;
	$: automaticSynchronizationIntervalString = automaticSynchronizationInterval.toString();
	let debounceTimeout: ReturnType<typeof setTimeout>;
	const dispatch = createEventDispatcher();

	function handleHeaderClick() {
		dispatch('toggle');
	}

	async function handleAutomaticSynchronizationIntervalChange(value: string) {
		const intervalNum = Number(value);
		if (isNaN(intervalNum) || !Number.isInteger(intervalNum)) {
			new Notice(t('settings.autoInterval.wrongType'));
			return;
		}
		if (intervalNum !== 0 && intervalNum < 20) {
			new Notice(t('settings.autoInterval.tooSmall'));
			return;
		}
		updateSettings({ automaticSynchronizationInterval: intervalNum });
		await plugin.saveSettings();
		plugin.reloadInterval();
		new Notice(t('settings.autoInterval.updated'));
	}
</script>

<CollapsibleSection
	title={t('settings.autoInterval.name')}
	shortDesc={t('settings.autoInterval.shortDesc')}
	open={open}
	on:headerClick={handleHeaderClick}
>
	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">{t('settings.autoInterval.name')}</div>
			<div class="setting-item-description">{t('settings.autoInterval.desc')}
			</div>
		</div>
		<div class="setting-item-control">
			<input
				id="sync-tag"
				type="text"
				bind:value={automaticSynchronizationInterval}
				Placeholder={t('settings.autoInterval.placeholder')}
				on:input={(e: Event) => {
					if (debounceTimeout) clearTimeout(debounceTimeout);
					debounceTimeout = setTimeout(async () => {
						const target = e.target as HTMLInputElement;
						await handleAutomaticSynchronizationIntervalChange(target.value);
						}, 900);
				}}
			/>
		</div>
	</div>
</CollapsibleSection>
