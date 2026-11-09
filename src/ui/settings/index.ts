import { App, PluginSettingTab } from 'obsidian';
import type { SettingDefinitionItem } from 'obsidian';
import TickTickSync from '@/main';
import { mount, unmount } from 'svelte';
import SettingsTabs from '@/ui/settings/svelte/SettingsTabs.svelte';
import { settingsLoad } from '@/ui/settings/settingsstore';

/**
 * 设置面板。
 *
 * 关于 Obsidian 1.13 的兼容策略：
 *
 * 1.13 引入了声明式设置（`getSettingDefinitions()`）。如果在这里返回一个
 * `type: 'page'`，框架会先渲染一张「可点击入口卡片」，点进去才是真正的页面——
 * 对只有一个页面的插件来说，这等于凭空多出一层导航，用户体验很差。
 *
 * 本插件的界面是 Svelte 命令式渲染的，无法用声明式条目表达，因此让
 * `getSettingDefinitions()` 返回空数组：框架不再生成任何入口卡片，
 * 直接在 `containerEl` 里渲染我们自己挂载的界面。同时兼容 1.13 以下
 * （那些版本本来就走 `display()`）。
 */
export class TickTickSyncSettingTab extends PluginSettingTab {
	private readonly plugin: TickTickSync;
	private view: Record<string, unknown> | null = null;

	constructor(app: App, plugin: TickTickSync) {
		super(app, plugin);
		this.plugin = plugin;
		settingsLoad(plugin);
	}

	display(): void {
		this.containerEl.empty();
		this.view = mount(SettingsTabs, {
			target: this.containerEl,
			props: {
				app: this.plugin.app,
				plugin: this.plugin,
				// 我们自己渲染整个面板，没有框架标题栏，需要显示「库名 -- 版本」。
				showMeta: true,
			},
		}) as Record<string, unknown> | null;
	}

	hide(): void {
		if (this.view) {
			void unmount(this.view);
			this.view = null;
		}
	}

	/**
	 * 故意返回空数组。
	 *
	 * 返回 `type: 'page'` 会让 1.13+ 多渲染一层「入口卡片 → 页面」的导航，
	 * 而本插件只有一个设置页面、且内容是命令式渲染的，声明式条目无法描述它。
	 * 返回空数组后，框架不会插入额外容器，界面直接渲染在 `containerEl` 中。
	 */
	getSettingDefinitions(): SettingDefinitionItem[] {
		return [];
	}
}
