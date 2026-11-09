#!/usr/bin/env node
/**
 * i18n 一致性校验。
 *
 * 1. zh.ts 与 en.ts 的 key 必须完全一致（缺失/多余都报错）。
 * 2. 源码中所有 `t('...')` 用到的 key 必须存在于 en.ts。
 * 3. 报告未被任何源码引用的 key（仅提示，不算失败）。
 *
 * 用法：node scripts/check-i18n.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** 从词典源码里按行提取 `'key':` 形式的键。 */
function extractKeys(file) {
	const text = readFileSync(file, 'utf8');
	const keys = new Set();
	for (const line of text.split('\n')) {
		const m = /^\s*'([^']+)':\s/.exec(line);
		if (m) keys.add(m[1]);
	}
	return keys;
}

const enKeys = extractKeys(join(root, 'src/i18n/locales/en.ts'));
const zhKeys = extractKeys(join(root, 'src/i18n/locales/zh.ts'));

const problems = [];

const missingInZh = [...enKeys].filter(k => !zhKeys.has(k));
const extraInZh = [...zhKeys].filter(k => !enKeys.has(k));
if (missingInZh.length) {
	problems.push(`zh.ts 缺少 ${missingInZh.length} 个 key:\n  ${missingInZh.join('\n  ')}`);
}
if (extraInZh.length) {
	problems.push(`zh.ts 多出 ${extraInZh.length} 个 key:\n  ${extraInZh.join('\n  ')}`);
}

/** 递归收集 .ts/.svelte 源文件。 */
function walk(dir, out = []) {
	for (const entry of readdirSync(dir)) {
		// 跳过依赖、词典本身，以及测试目录：测试里的 t() 用的是一次性假 key。
		if (entry === 'node_modules' || entry === 'i18n' || entry === 'test') continue;
		const full = join(dir, entry);
		const st = statSync(full);
		if (st.isDirectory()) walk(full, out);
		else if (/\.(ts|svelte|js)$/.test(entry) && !/\.test\./.test(entry)) out.push(full);
	}
	return out;
}

const usedKeys = new Set();
for (const file of walk(join(root, 'src'))) {
	const text = readFileSync(file, 'utf8');
	for (const m of text.matchAll(/\bt\(\s*'([^']+)'/g)) {
		usedKeys.add(m[1]);
	}
}

const usedButMissing = [...usedKeys].filter(k => !enKeys.has(k));
if (usedButMissing.length) {
	problems.push(`源码使用了 ${usedButMissing.length} 个不存在的 key:\n  ${usedButMissing.join('\n  ')}`);
}

const unused = [...enKeys].filter(k => !usedKeys.has(k));

if (problems.length) {
	console.error('i18n 校验失败：\n\n' + problems.join('\n\n'));
	process.exit(1);
}

console.log(`i18n 校验通过：en/zh 各 ${enKeys.size} 个 key，源码引用 ${usedKeys.size} 个。`);
if (unused.length) {
	console.log(`\n提示：${unused.length} 个 key 暂未被引用（可能是为将来预留）：`);
	console.log('  ' + unused.join('\n  '));
}
