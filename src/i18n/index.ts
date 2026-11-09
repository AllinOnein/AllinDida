/**
 * TickTickSync 国际化（i18n）基础设施。
 *
 * 设计要点：
 * - 默认语言为英文，只有在检测到中文环境时才切换到中文。这样既保证
 *   已有的英文用户/测试行为不变，也让中文用户开箱即用。
 * - 所有文案以扁平 key 存放在 locales/ 下，key 用 `模块.用途` 命名。
 * - `t()` 支持 `{name}` 形式的占位符替换。
 * - 语言检测是防御性的：运行在 jsdom（测试环境）或非 Obsidian 环境时
 *   任何一步失败都回退到英文，绝不抛异常。
 */

import en from './locales/en';
import zh from './locales/zh';
import { getLanguage } from 'obsidian';

export type Locale = 'en' | 'zh';

/** 支持的语言及其在设置里的显示名（用各自语言书写）。 */
export const SUPPORTED_LOCALES: Record<Locale, string> = {
	en: 'English',
	zh: '简体中文',
};

type Dictionary = Record<string, string>;

const DICTIONARIES: Record<Locale, Dictionary> = { en, zh };

let currentLocale: Locale = 'en';

/**
 * 把 Obsidian / 浏览器给出的语言标签归一化成我们支持的语言。
 * 例如 `zh`、`zh-CN`、`zh-Hans`、`zh-TW` 都归到 `zh`。
 */
export function normalizeLocale(raw: string | null | undefined): Locale {
	if (!raw) return 'en';
	const lower = raw.toLowerCase();
	if (lower.startsWith('zh')) return 'zh';
	return 'en';
}

/**
 * 探测当前 Obsidian 界面语言。
 *
 * 首选 Obsidian 1.8+ 的官方 `getLanguage()`；在测试环境（jsdom，obsidian
 * 模块被替换为桩）或更老的 API 版本下它可能不存在，因此逐级回退到
 * moment.locale() 与 navigator.language。任何一步异常都视为未设置。
 */
export function detectLocale(): Locale {
	try {
		const language = getLanguage();
		if (language) return normalizeLocale(language);
	} catch {
		// 旧版本 Obsidian 或测试桩没有该 API，继续尝试其它来源。
	}

	try {
		// Obsidian 内置 moment，它的 locale 反映界面语言。
		const momentLocale = (window as unknown as { moment?: { locale?: () => string } })
			?.moment?.locale?.();
		if (momentLocale) return normalizeLocale(momentLocale);
	} catch {
		// 忽略，继续。
	}

	try {
		return normalizeLocale(window.navigator?.language);
	} catch {
		return 'en';
	}
}

/** 显式设置语言（设置面板用）。 */
export function setLocale(locale: Locale): void {
	currentLocale = locale;
}

export function getLocale(): Locale {
	return currentLocale;
}

/**
 * 按当前语言取文案，并替换 `{param}` 占位符。
 *
 * 找不到 key 时回退到英文，再不行就返回 key 本身，便于发现遗漏。
 */
export function t(key: string, params?: Record<string, string | number>): string {
	const dictionary = DICTIONARIES[currentLocale] ?? DICTIONARIES.en;
	const template = dictionary[key] ?? DICTIONARIES.en[key] ?? key;
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (match, name: string) => {
		const value = params[name];
		return value === undefined ? match : String(value);
	});
}

/** 初始化：在插件 onload 时调用一次。 */
export function initI18n(): void {
	setLocale(detectLocale());
}

/**
 * 监听 Obsidian 语言切换。
 *
 * Obsidian 切换界面语言后不会重载插件，因此这里注册一个 localStorage
 * 监听：语言键变化时重新探测并返回新语言，供设置页重绘使用。
 * 返回取消监听的函数。
 */
export function watchLocaleChange(onChange: (locale: Locale) => void): () => void {
	const handler = (event: StorageEvent): void => {
		if (event.key !== 'language') return;
		const next = normalizeLocale(event.newValue);
		if (next === currentLocale) return;
		setLocale(next);
		onChange(next);
	};

	try {
		window.addEventListener('storage', handler);
	} catch {
		return () => {};
	}

	return () => {
		try {
			window.removeEventListener('storage', handler);
		} catch {
			// 忽略：窗口已销毁。
		}
	};
}

export default t;
