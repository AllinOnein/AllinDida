<script lang="ts">
	import type TickTickSync from '@/main';
	import { Notice, Platform } from 'obsidian';
	import { onMount } from 'svelte';
	import { settingsStore } from '@/ui/settings/settingsstore';
	import { getSettings, updateSettings } from '@/settings';
	import log from 'loglevel';
	import { getTick } from '@/api/tick_singleton_factory';
	import { t } from '@/i18n';

	export let plugin: TickTickSync;

	let loginBusy = false;
	// 两个服务商都是品牌名，不翻译；仅把 "Not Selected" 之类的状态文案交给 i18n。
	const PROVIDER_OPTIONS = { 'ticktick.com': 'TickTick', 'dida365.com': 'Dida365' };
	let userLogin: string;
	let userPassword: string;

	let baseURL: string;
	let isWorking: boolean = false;
	let loggedIn: boolean = false;
	let desktoApp: boolean = false;
	let providerString: string = '';

	async function saveLoginInfo(info: { inboxId: string | null; token: string | null }) {
		const oldInboxId = $settingsStore.inboxID;
		if (oldInboxId &&  oldInboxId.length > 0 && oldInboxId != info.inboxId) {
			new Notice(t('login.differentUser'));
		}
		settingsStore.update(s => ({ ...s, token: info.token, inboxID: info.inboxId, checkPoint: 0 }));
		updateSettings({ token: info.token, inboxID: info.inboxId, inboxName: 'Inbox', checkPoint: 0 });
		loggedIn = !!$settingsStore.token;

		const api = getTick({ baseUrl: $settingsStore.baseURL, token: info.token, checkPoint: 0 });
		if (plugin.tickTickRestAPI && plugin.tickTickRestAPI.api) plugin.tickTickRestAPI.api = api;
		if (plugin.service) plugin.service.api = api;

		const initialized = await plugin.initializePlugin();
		await plugin.saveSettings();
		if (initialized) {
			// Startup skipped the periodic sync because initialization failed;
			// now that credentials are valid, start the interval.
			plugin.reloadInterval();
		}
	}

	async function handleLogin() {
		isWorking = true;
		if (!$settingsStore.baseURL || !userLogin || !userPassword) {
			new Notice(t('login.enterCredentials'));
			isWorking = false;
			return;
		}

		try {
			const info = await plugin.service.login(baseURL, userLogin, userPassword);
			if (!info) {
				new Notice(t('login.failedShort'));
				await saveLoginInfo({ inboxId: null, token: null });
				isWorking = false;
				return;
			}
			await saveLoginInfo(info);
		} catch (e: any) {
			await saveLoginInfo({ inboxId: null, token: null });
			log.error('Authentication error:', e);
		}
		isWorking = false;
	}

	async function webBasedLogin() {
		if (loginBusy) return;
		loginBusy = true;
		isWorking = true;
		try {
			new Notice(t('login.opening'));
			const isMobile = Platform.isAndroidApp || Platform.isIosApp;

			let cookie: { name: string; value: string } | null = null;
			if (Platform.isDesktopApp) {
				const { DesktopAuth } = await import('@/utils/login/desktop_authenticator');
				cookie = await new DesktopAuth(plugin, baseURL).authenticate();
			} else if (isMobile) {
				new Notice(t('login.mobileOnlyRegular'), 5000);
			}

			if (!cookie?.value) throw new Error('No cookie received.');

			const api = getTick({
				username: '',
				password: '',
				baseUrl: $settingsStore.baseURL,
				token: cookie.value,
				checkPoint: 0
			});
			if (plugin.tickTickRestAPI) plugin.tickTickRestAPI.api = api;
			plugin.service.api = api;

			const info = await api.getUserStatus();
			if (!info) throw new Error('Failed to verify login with API.');
			await saveLoginInfo(info);
			new Notice(t('login.successful'));
		} catch (e: any) {
			new Notice(t('login.failedWithMessage', { message: e?.message || String(e) }), 5000);
			await saveLoginInfo({ inboxId: null, token: null });
			log.error('Authentication error:', e);
		} finally {
			isWorking = false;
			loginBusy = false;
		}
	}

	onMount(async () => {
		loggedIn = !!$settingsStore.token;
		baseURL = $settingsStore.baseURL;
		desktoApp = Platform.isDesktopApp;
		providerString = PROVIDER_OPTIONS[baseURL] || t('settings.login.notSelected');
	});
</script>

<div class="access-control">
	<div class="login-status-banner">
		{loggedIn ? t('settings.login.loggedIn') : t('settings.login.pleaseLogin')}
		<div class="login-status-banner-actions">
			<br>{t('settings.login.privacy')}<br>
		</div>
		{#if desktoApp}
			<div class="login-status-banner-actions">
				<br>{t('settings.login.ssoHintDesktop', { provider: providerString })}<br>
			</div>
		{:else }
			<div class="login-status-banner-actions">
				<br>{t('settings.login.mobileHint', { provider: providerString })}<br>
			</div>
		{/if}
	</div>

	<div class="setting-item">
		<div class="setting-item-info">
			<div class="setting-item-name">{ providerString }</div>
			<div class="setting-item-description">{t('settings.login.homeServer')}</div>
		</div>
		<div class="setting-item-control">
			<select disabled={isWorking}
					value={getSettings().baseURL}
					on:change={async (e) => {
					baseURL = e.target.value;
					providerString = PROVIDER_OPTIONS[baseURL];
					$settingsStore.baseURL = baseURL;
					updateSettings({ baseURL });
					if ($settingsStore.token) {
						const api = getTick({ baseUrl: baseURL, token: $settingsStore.token, checkPoint: $settingsStore.checkPoint ?? 0 });
						if (plugin.tickTickRestAPI) plugin.tickTickRestAPI.api = api;
						plugin.service.api = api;
					}
					await plugin.saveSettings();
				}}>
				{#each Object.entries(PROVIDER_OPTIONS) as [value, label]}
					<option {value}>{label}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if desktoApp}
		<div class='card-section'>
			<div class="setting-item">
				<div class="setting-item-info">
					<div class="setting-item-name">{t('settings.login.ssoLogin')}</div>
					<div class="setting-item-description"></div>
				</div>
				<div class="setting-item-control">
					<button disabled={isWorking} class="mod-cta ts_login_button" on:click={webBasedLogin}>
						{t('settings.login.loginWith', { provider: providerString })}
					</button>
				</div>
			</div>
		</div>
	{/if}
	<div class='card-section'>
		<div class="setting-item-info">
			<div class="setting-item-name">{t('settings.login.regularLogin')}</div>
			<div class="setting-item-description"></div>
		</div>
		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.login.username')}</div>
				<div class="setting-item-description">{t('settings.login.usernameDesc', { provider: providerString })}</div>
			</div>
			<div class="setting-item-control">
				<input type="text" placeholder={t('settings.login.username')} bind:value={userLogin} />
			</div>
		</div>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.login.password')}</div>
				<div class="setting-item-description">{t('settings.login.passwordDesc', { provider: providerString })}</div>
			</div>
			<div class="setting-item-control">
				<input type="password" placeholder={t('settings.login.password')} bind:value={userPassword} />
			</div>
		</div>

		<div class="setting-item">
			<div class="setting-item-info">
				<div class="setting-item-name">{t('settings.login.login')}</div>
				<div class="setting-item-description">
					{loggedIn ? t('settings.login.loggedIn') : t('settings.login.pleaseLogin')}
				</div>
			</div>
			<div class="setting-item-control">
				<button disabled={isWorking} class="mod-cta ts_login_button" on:click={handleLogin}>
					{t('settings.login.login')}
				</button>
			</div>
		</div>
	</div>
</div>
