<script lang="ts">
	import { resetTasks } from '@/ui/settings/utils/ResetSynchronization';
	import { t } from '@/i18n';
	export let isWorking: boolean;
	export let resetTasksText: string;
	export let plugin;
	export let setIsWorking: (val: boolean) => void;

	let showResetModal = false;
	let modalWorking = false;

	async function onReset() {
		showResetModal = true;
		modalWorking = false;
	}
	function closeModal() {
		if (!modalWorking) showResetModal = false;
	}
	async function confirmReset() {
		modalWorking = true;
		try {
			await resetTasks(plugin, setIsWorking);
		} finally {
			showResetModal = false;
			modalWorking = false;
		}
	}
</script>

<div class="setting-item">
	<div class="setting-item-info">
		<div class="setting-item-name">{t('settings.reset.button')}</div>
		<div class="setting-item-description">
			{t('settings.reset.question', { action: resetTasksText })}
			<br>
			<em>
				{t('settings.reset.caution')}
			</em>
		</div>
	</div>
	<div class="setting-item-control">
		<button
			disabled={isWorking}
			class="mod-cta"
			on:click={onReset}>
			{t('settings.reset.button')}
		</button>
	</div>
</div>

{#if showResetModal}
	<div
		class="local-modal-backdrop"
		role="button"
		tabindex="0"
		on:click={modalWorking ? undefined : closeModal}
		on:keydown={(e) => { if (!modalWorking && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); closeModal(); } }}
		aria-label={t('common.close')}
		style={modalWorking ? 'cursor: wait;' : ''}
	></div>
	<div
		class="local-modal-dialog"
		role="dialog"
		aria-modal="true"
		style={modalWorking ? 'cursor: wait;' : ''}
	>
		<div class="local-modal-content">
			<h2>{t('settings.reset.confirmTitle')}</h2>
			<p>{t('settings.reset.reallyConfirmPrefix')} <strong>{t('settings.reset.really')}</strong> {t('settings.reset.confirmSuffix', { action: resetTasksText })}</p>
			<p style="color:var(--text-warning);"><em>{t('settings.reset.warning')}</em></p>
			<div class="local-modal-actions">
				<button class="mod-cta"
					on:click={confirmReset}
					disabled={modalWorking}>
					{modalWorking ? t('settings.reset.working') : t('settings.reset.yes')}
				</button>
				<button
					style="margin-left:1em;"
					on:click={closeModal}
					disabled={modalWorking}
				>
					{t('settings.reset.no')}
				</button>
			</div>
		</div>
	</div>
{/if}
