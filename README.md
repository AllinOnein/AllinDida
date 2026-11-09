# AllinDida

将 Obsidian 中的待办任务双向同步到滴答清单（TickTick / 滴答清单），便于在手机桌面小组件中查看。

> **本项目是 [thesamim/TickTickSync](https://github.com/thesamim/TickTickSync) 的衍生版本**，基于其 v2.0.15 代码修改，遵循 **GNU GPL v3.0** 许可证。
> 主要改动见下方「相对上游的改动」一节。这不是原作者的官方项目，请勿就本版本的问题去打扰原作者。

## 与官方版本的关系

本插件的 ID 为 `allindida`，**与官方 TickTickSync（ID `tickticksync`）互不冲突，可以各自独立安装**。

> ⚠️ **从官方版迁移过来时请注意**
>
> 两者是彼此独立的插件，配置与同步缓存不共享：
>
> - 插件配置：`.obsidian/plugins/allindida/data.json` 是全新的，需要重新登录滴答清单
> - 同步缓存：存放在独立的 IndexedDB 中，首次同步会重新拉取全部任务
>
> 建议的迁移步骤：
>
> 1. 先在官方版里确认同步状态正常
> 2. 停用官方版（不要删除）
> 3. 安装并启用 AllinDida，重新登录
> 4. 等首次全量同步完成后，确认任务都在，再决定是否卸载官方版
>
> 如果只想保留一个版本，卸载官方版前请先备份其 `data.json`。

---

## 相对上游的改动

### 中文化

- 插件界面**全面支持简体中文**：所有对话框、通知、命令面板项、设置页面文案都会跟随 Obsidian 的界面语言自动切换。
- 默认语言跟随 Obsidian，中文环境下开箱即用；英文环境下保持原文，不影响原有体验。
- 文案集中在 `src/i18n/locales/`，可用 `npm run check:i18n` 校验中英词典一致性。

### 更安静的备份行为

- **启动时备份改为可选**（默认关闭）。原版每次启动都会往库根目录写一份 `ticktick-backup-<时间戳>.csv`，长期累积大量无用文件；且滴答清单对该导出接口有频率限制。
- 备份文件**只保留最近 N 份**（可在设置中配置），旧文件自动清理。
- 同名文件改为覆盖写入，不再因同一秒内重复触发而报错。
- 备份由**单一实现**负责，移除了上游重复的一份死代码。

### 更轻的启动过程

- **首次启动全量同步，之后走增量**。原版每次启动都以 `since=0` 全量拉取全部任务。
- **大幅减少 `data.json` 写入**：设置内容未变化时跳过落盘。这对把库放在 OneDrive / Dropbox 等同步盘的用户尤其重要——原版每轮同步都会改写该文件，导致持续上传与冲突副本。
- 移除了每轮同步中「把所有任务塞进内存 Map 后丢弃」的无意义开销。

### 修复

- 修复开启「按滴答清单文件夹组织任务」时的崩溃（`String.prototype.contains` 不存在）。
- 修复设置中文件夹搜索框必崩的问题。
- 修复项目列表为空时同步崩溃。
- 初始化失败时不再启动空转的定时同步；登录成功后自动恢复。

---

## 功能特性

- 任务与笔记的双向同步
- 与 [Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) 插件兼容的日期/时间格式
- 重复（循环）任务同步
- 移动端兼容

## 安装

### 手动安装

1. 从 [Releases](https://github.com/AllinOnein/AllinDida/releases) 下载 `main.js`、`manifest.json`、`styles.css`
2. 放入 `<你的库>/.obsidian/plugins/allindida/`
3. 在 Obsidian 的「第三方插件」中启用

### 从源码构建

```bash
npm ci
npm run build      # 产物在 dist/
```

## 开发

```bash
npm run check        # TypeScript 类型检查
npm run lint         # ESLint
npm test             # 单元测试
npm run check:i18n   # 中英文案 key 一致性校验
```

## 已知限制

- 仅支持 [Tasks 插件的 emoji 日期格式](https://publish.obsidian.md/tasks/Reference/Task+Formats/About+Task+Formats)。
- 与官方 TickTickSync 的插件 ID 不同，两者可共存，但**配置与同步缓存互不相通**（详见上方迁移说明）。

## 文档

原项目的完整文档见 <https://thesamim.github.io/TickTickSync/>（英文，基于上游版本，部分内容可能与本版本不一致）。

## 免责声明

本插件按「现状」提供，不附带任何明示或暗示的担保。使用本插件所产生的任何风险与后果（包括但不限于数据丢失）由使用者自行承担。

## 许可证

本项目以 [GNU GPLv3](LICENSE.md) 授权，与原项目一致。

原始代码版权归 [thesamim](https://github.com/thesamim) 所有；本衍生版本的修改部分版权归 AllinOnein 所有。
