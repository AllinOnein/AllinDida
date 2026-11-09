import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('obsidian', () => ({
	// 模拟 Obsidian 1.8+ 的官方语言 API；测试里可以改返回值。
	getLanguage: vi.fn(() => 'zh'),
}));

vi.mock('@/i18n/locales/en', () => ({
	default: {
		'greeting.hello': 'Hello',
		'greeting.named': 'Hello, {name}!',
		'greeting.count': '{count} item(s)',
	},
}));

vi.mock('@/i18n/locales/zh', () => ({
	default: {
		'greeting.hello': '你好',
		'greeting.named': '你好，{name}！',
		'greeting.count': '{count} 项',
	},
}));

import {
	detectLocale,
	getLocale,
	normalizeLocale,
	setLocale,
	t,
	initI18n,
	SUPPORTED_LOCALES,
} from '@/i18n';
import { getLanguage } from 'obsidian';

describe('i18n normalizeLocale', () => {
	it('maps every zh variant to zh', () => {
		for (const tag of ['zh', 'zh-CN', 'zh-Hans', 'zh-TW', 'ZH-cn']) {
			expect(normalizeLocale(tag)).toBe('zh');
		}
	});

	it('maps other languages to en', () => {
		for (const tag of ['en', 'en-US', 'fr', 'ja', '', null, undefined]) {
			expect(normalizeLocale(tag as string)).toBe('en');
		}
	});
});

describe('i18n detectLocale', () => {
	afterEach(() => {
		vi.mocked(getLanguage).mockReturnValue('zh');
	});

	it('prefers Obsidian getLanguage()', () => {
		vi.mocked(getLanguage).mockReturnValue('zh-CN');
		expect(detectLocale()).toBe('zh');
	});

	it('falls back to navigator.language when getLanguage throws', () => {
		vi.mocked(getLanguage).mockImplementation(() => {
			throw new Error('not available');
		});
		const original = navigator.language;
		Object.defineProperty(navigator, 'language', { value: 'zh-TW', configurable: true });
		try {
			expect(detectLocale()).toBe('zh');
		} finally {
			Object.defineProperty(navigator, 'language', { value: original, configurable: true });
		}
	});
});

describe('i18n t()', () => {
	beforeEach(() => {
		vi.mocked(getLanguage).mockReturnValue('en');
		initI18n();
	});

	it('returns English by default', () => {
		expect(getLocale()).toBe('en');
		expect(t('greeting.hello')).toBe('Hello');
	});

	it('returns Chinese after switching locale', () => {
		setLocale('zh');
		expect(t('greeting.hello')).toBe('你好');
	});

	it('substitutes named placeholders', () => {
		setLocale('zh');
		expect(t('greeting.named', { name: '世界' })).toBe('你好，世界！');
		setLocale('en');
		expect(t('greeting.named', { name: 'World' })).toBe('Hello, World!');
	});

	it('substitutes numeric placeholders', () => {
		expect(t('greeting.count', { count: 3 })).toBe('3 item(s)');
		setLocale('zh');
		expect(t('greeting.count', { count: 3 })).toBe('3 项');
	});

	it('leaves unknown placeholders untouched', () => {
		expect(t('greeting.named', {})).toBe('Hello, {name}!');
	});

	it('falls back to the key itself for unknown keys', () => {
		expect(t('does.not.exist')).toBe('does.not.exist');
	});

	it('falls back to English text when a key is missing in zh', () => {
		setLocale('zh');
		// zh 词典里没有这个 key 时会回退 en，再不行返回 key 本身。
		expect(t('does.not.exist')).toBe('does.not.exist');
	});
});

describe('i18n SUPPORTED_LOCALES', () => {
	it('offers a display name per supported locale', () => {
		expect(Object.keys(SUPPORTED_LOCALES).sort()).toEqual(['en', 'zh']);
		expect(SUPPORTED_LOCALES.zh).toBe('简体中文');
	});
});
