// 注意：本文件是 .js（不是 .ts），Vite 的 tsconfig paths 别名对它不生效，
// 因此这里必须用相对路径而不是 `@/i18n`。
import { t } from '../../../i18n/index.ts';

export const PROVIDER_OPTIONS = { 'ticktick.com': 'TickTick', 'dida365.com': 'Dida365' };
export const TAGS_BEHAVIOR = { 1: 'AND', 2: 'OR' };
export const LOG_LEVEL = {
	'trace': 'trace',
	'debug': 'debug',
	'info': 'info',
	'warn': 'warn',
	'error': 'error'
};
export const NOTE_SEPERATOR =
	{
		'none': 'none',
		'line': 'line',
		'callout':	'callout'
	};

/**
 * 选项值 → 显示文案。
 *
 * 这些是 getter 而不是普通对象：Svelte 组件在渲染时会读取它们，
 * 而 getter 保证读到的是「当前语言」的文案，而不是模块加载时
 * （此时 i18n 可能尚未初始化）的快照。
 */
export const LINK_BEHAVIOR = {
	get noLink() { return t('option.link.noLink'); },
	get taskLink() { return t('option.link.taskLink'); },
	get noteLink() { return t('option.link.noteLink'); },
};

export const LINK_VISIBILITY = {
	get show() { return t('option.visibility.show'); },
	get hide() { return t('option.visibility.hide'); },
	get hover() { return t('option.visibility.hover'); },
};
