<script lang="ts">
	import CollapsibleSection from '@/ui/settings/svelte/sections/CollapsibleSection.svelte';
	import { createEventDispatcher, onMount } from 'svelte';
	import { ConfirmFullSyncModal } from '@/modals/ConfirmFullSyncModal';
	import { settingsStore } from '@/ui/settings/settingsstore';
	import { get } from 'svelte/store';
	import { Notice } from 'obsidian';
	import { t } from '@/i18n';

	export let open = false;
	export let plugin;

	const dispatch = createEventDispatcher();

	function handleHeaderClick() {
		dispatch('toggle');
	}

	async function confirmFullSync() {
		const myModal = new ConfirmFullSyncModal(plugin.app, () => {
		});
		return await myModal.showModal();
	}

	async function handleToggle() {
		const targetValue = !$settingsStore.enableFullVaultSync;
		await handleFullVaultSyncChange(targetValue);
	}

	async function handleFullVaultSyncChange(value: boolean) {
		let noticeString: string;
		if (value) { // Use the passed value instead of checking store state before update
			const bConfirmation = await confirmFullSync();
			if (bConfirmation) {
				// enable, update store
				settingsStore.update((s) => ({ ...s, enableFullVaultSync: true }));
				noticeString = t('settings.fullVault.enabled');
			} else {
				// stay disabled
				settingsStore.update((s) => ({ ...s, enableFullVaultSync: false }));
				noticeString = t('settings.fullVault.notEnabled');
			}
		} else {
			settingsStore.update((s) => ({ ...s, enableFullVaultSync: false }));
			noticeString = t('settings.fullVault.disabled');
		}
		new Notice(noticeString);
		await plugin.saveSettings();
	}
</script>

<CollapsibleSection
	title={t('settings.fullVault.title')}
	shortDesc={t('settings.fullVault.shortDesc')}
	open={open}
	on:headerClick={handleHeaderClick}
>
	<div class="Full vault sync">
		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.fullVault.title')}</div>
				<div class="setting-item-description">
					{t('settings.fullVault.desc')}
					<p><b>{t('settings.fullVault.note')}</b></p></div>
			</div>
			<div class="setting-item-control">
				<label class="checkbox-container" class:is-enabled={$settingsStore.enableFullVaultSync}>
					<input
						type="checkbox"
						checked={$settingsStore.enableFullVaultSync}
						on:click|preventDefault={handleToggle}
					/>
				</label>
			</div>
		</div>
	</div>
</CollapsibleSection>
