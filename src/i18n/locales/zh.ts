/**
 * 简体中文文案。
 *
 * key 必须与 locales/en.ts 完全一致；`npm run check:i18n` 会做双向校验。
 * 翻译约定：
 * - 「Project」在滴答清单语境下译为「清单」，「List」同样译为「清单」。
 * - 「Task」译为「任务」，「Task Item」译为「子任务项」。
 * - 「Vault」译为「库」，「Note」译为「笔记」。
 * - 按钮文案尽量简短，避免撑破设置面板宽度。
 */

import type en from './en';

const zh: Record<keyof typeof en, string> = {
	// ---------------------------------------------------------------- 通用
	'common.cancel': '取消',
	'common.close': '关闭',
	'common.save': '保存',
	'common.unknown': '未知',
	'common.none': '（无）',

	// ---------------------------------------------------------------- 命令 / 功能区
	'command.setDefaultProject': '为当前文件设置默认滴答清单项目',
	'command.sync': '立即同步',
	'command.deletePermanent': '永久删除任务',
	'command.recoverTasks': '查看并恢复已删除的任务',

	// ---------------------------------------------------------------- 启动 / 通用通知
	'startup.pleaseLogin': '请先在设置中登录。',
	'startup.settingsFailed': '设置加载失败，请重新加载滴答清单同步插件。',
	'startup.initFailed': '滴答清单同步插件初始化失败，请在设置中检查用户名和密码。',
	'startup.loaded': '滴答清单同步已加载。',
	'startup.error': '发生错误：{message}',
	'sync.completed': '同步完成。',
	'sync.error': '同步时发生错误：{message}',
	'sync.duplicatesAborted': '同步已中止。请手动修复元数据中的重复任务，以免数据损坏。',
	'sync.duplicateCheckFailed': '重复检查失败：{message}',
	'sync.tasksNotFoundNotDeleted': '在滴答清单中找不到的任务不会被删除。',
	'sync.databaseCheckCompleted': '数据库检查完成。',
	'sync.databaseCheckError': '保存项目缓存时发生错误：{message}',
	'login.notLoggedIn': '请先在设置中登录。',
	'login.failedShort': '登录失败。',
	'login.failed': '登录失败，请通过设置重新登录。',
	'login.failedWithError': '登录失败：{message}\n请重新登录',
	'login.enterCredentials': '请填写用户名和密码',
	'login.differentUser': '你当前登录的是另一个用户 ID。',
	'login.opening': '正在打开登录页面…',
	'login.mobileOnlyRegular': '移动端仅支持常规登录。',
	'login.successful': '登录成功。',
	'login.failedWithMessage': '登录失败：{message}',

	// ---------------------------------------------------------------- 任务操作通知
	'task.closed': '任务 {taskId} 已关闭。',
	'task.reopened': '任务 {taskId} 已重新打开。',
	'task.created': '已创建新任务：{title}（ID：{id}）',
	'task.createFailed': '任务创建到滴答清单失败：{message}。该任务未被修改。',
	'task.createFailedApi': '在滴答清单中创建任务失败{status}：{message}',
	'task.removedFromVault': '这些任务不会从库中删除。',
	'task.recoveryFailed': '恢复失败：{message}',
	'task.recoveredTo': '任务已恢复到 {path}',
	'task.allRecovered': '所有任务均已恢复。',
	'task.enterValidPath': '请输入有效的文件路径。',
	'task.noDeletedFound': '没有找到已删除的任务。',
	'task.permanentlyDeleted': '已永久删除 {count} 个任务。',
	'task.orphansAdded': '已将 {count} 个孤立任务添加到库和数据库。',
	'task.orphansDeleted': '已从滴答清单删除 {count} 个孤立任务。',
	'task.movedToProjectGroup': '文件已移动到不同的项目分组，{count} 个任务已更新。',
	'task.modified': '任务 {title} 已修改。',
	'task.newTasksOnNextSync': '新任务将在下次同步时添加到滴答清单。',
	'task.noActiveFile': '没有活动文件。',
	'task.deleted': '任务 {taskId} 已删除',
	'task.notFoundWillRemove': '找不到该任务，将从文件中移除。',
	'task.willNotBeDeleted': '这些任务不会被删除。请在下一次同步前修正问题。',
	'task.fileRecordRemoved': '已从数据库中移除 {count} 个不存在的文件记录。',
	'task.circularDependency': '检测到父子任务关系出现循环，请在滴答清单中检查并修复父子关系。',
	'task.movedElsewhereInTickTick': '任务 {title} 在滴答清单中被移动了，但它当前位于 {file}。这里视为有意为之，不做移动。',

	// ---------------------------------------------------------------- 文件夹整理
	'reorganize.starting': '正在将任务文件整理到文件夹…',
	'reorganize.alreadyOrganized': '所有文件均已整理完毕',
	'reorganize.complete': '整理完成：已移动 {count} 个文件',
	'reorganize.completeWithErrors': '整理完成：已移动 {count} 个文件，{errors} 个错误（详见控制台）',
	'reorganize.error': '整理文件时发生错误：{message}',
	'reorganize.moveExists': '无法移动文件：{path} 已存在',
	'reorganize.moveError': '移动文件时出错：{message}',
	'reorganize.taskFileError': '移动任务文件时出错：{message}',

	// ---------------------------------------------------------------- 项目
	'project.saveError': '保存项目时出错：{message}',
	'project.groupsError': '无法获取项目分组：{message}',

	// ---------------------------------------------------------------- 文件操作
	'file.creating': '正在创建新文件：{path}',
	'file.moved': '已将 {from} 移动到 {to}',
	'file.deleted': '已删除 {path}',
	'file.deletedAndMoved': '已删除 {path}，并将 {from} 移动到该位置',
	'file.taskMoved': '任务已移动。\n任务：{title}\n已从\n {from}\n移动到\n{to}',
	'file.taskNewParent': '任务有了新的父任务。\n任务：{title}\n现在是\n {parent}\n的子任务',
	'file.taskNowTopLevel': '任务现在是顶层任务。\n任务：{title}',
	'file.renameFailed': '文件重命名失败。{message}',
	'common.unknownProject': '未知项目',
	'folder.created': '已创建新文件夹 {path}。',
	'folder.createFailed': '文件夹 {name} 创建失败：{message}。请修正后重试。',
	'folder.nowIs': '{type}文件夹现在为 {path}。',
	'folder.typeBackup': '备份',
	'folder.typeDefault': '默认',

	// ---------------------------------------------------------------- 备份
	'backup.saved': '滴答清单备份已保存：{path}',
	'backup.empty': '滴答清单备份失败：导出未返回数据。',
	'backup.error': '创建滴答清单备份时发生错误：{message}',

	// ---------------------------------------------------------------- 模态框：任务删除
	'modal.taskDeletion.title': '确认删除任务',
	'modal.taskDeletion.message': '以下任务将被删除，原因：',
	'modal.taskDeletion.confirm': '确认删除',
	'modal.taskDeletion.unknownFile': '未知文件',
	'modal.taskDeletion.reasonDeletedInTickTick': '它们在滴答清单中已被删除，或在数据库中被标记为已删除。',
	'modal.taskDeletion.reasonNotFound': '在滴答清单中找不到这些任务',
	'modal.taskDeletion.reasonDeletedFromTickTick': '这些任务已从滴答清单删除',
	'modal.taskDeletion.reasonNotInCache': '在本地缓存中找不到该任务。',
	'modal.taskDeletion.reasonRemovedFromFile': '这些任务已从文件中移除',

	// ---------------------------------------------------------------- 模态框：重复清单
	'modal.duplicateLists.title': '发现重复的项目/清单',
	'modal.duplicateLists.message': '在 {baseURL} 上发现以下重复的项目/清单。请选择其中一个来容纳这两个清单中的任务，或重命名其中一个清单。',
	'modal.duplicateLists.abort': '中止同步',
	'modal.duplicateLists.projectName': '项目名称',
	'modal.duplicateLists.projectId': '项目 ID',

	// ---------------------------------------------------------------- 模态框：重复任务
	'modal.duplicateTasks.title': '发现重复任务',
	'modal.duplicateTasks.message': '在元数据中发现以下任务同时存在于多个文件中。这会导致不可预期的同步结果。请选择要从文件和元数据中移除的实例，或取消以手动处理。',
	'modal.duplicateTasks.remove': '移除？',
	'modal.duplicateTasks.taskTitle': '任务标题',
	'modal.duplicateTasks.filePath': '文件路径',
	'modal.duplicateTasks.cancelAbort': '取消并中止同步',
	'modal.duplicateTasks.applyContinue': '应用并继续同步',

	// ---------------------------------------------------------------- 模态框：恢复已删除任务
	'modal.recover.title': '恢复已删除的任务',
	'modal.recover.intro': '选择要恢复的任务。默认恢复到原文件。',
	'modal.recover.untitled': '无标题',
	'modal.recover.noFile': '无文件',
	'modal.recover.meta': '原文件：{file} | 删除时间：{date}',
	'modal.recover.toOriginal': '恢复到原文件',
	'modal.recover.toOther': '恢复到其他文件…',
	'modal.recover.confirmRecovery': '确认恢复',
	'modal.recover.pathPlaceholder': '输入文件路径（例如 文件夹/任务.md）',

	// ---------------------------------------------------------------- 模态框：永久删除已删除任务
	'modal.cleanupDeleted.title': '永久删除任务',
	'modal.cleanupDeleted.intro': '这些任务已被删除，仅作为记录保留。在此处删除后无法撤销。',
	'modal.cleanupDeleted.selectAll': '全选',
	'modal.cleanupDeleted.deleteSelected': '永久删除所选',
	'modal.cleanupDeleted.noTasks': '没有找到已删除的任务。',

	// ---------------------------------------------------------------- 模态框：数据库清理
	'modal.cleanupDb.title': '库中缺失的文件',
	'modal.cleanupDb.message': '以下文件记录在数据库中，但已不在你的库里。是否从数据库中移除？',
	'modal.cleanupDb.remove': '移除数据库记录',
	'modal.cleanupDb.keep': '保留记录',

	// ---------------------------------------------------------------- 模态框：孤立任务
	'modal.orphan.title': '发现孤立任务',
	'modal.orphan.message': '这些任务存在于滴答清单中，但在本地库或数据库中找不到对应任务：',
	'modal.orphan.chooseAction': '你想如何处理这些任务？',
	'modal.orphan.add': '添加到文件和数据库',
	'modal.orphan.delete': '从滴答清单删除',
	'modal.orphan.skip': '取消',

	// ---------------------------------------------------------------- 模态框：文件位置冲突
	'modal.fileConflict.title': '项目文件位置不正确',
	'modal.fileConflict.message': '匹配项目「{project}」的文件位于：\n\n{file}\n\n但它应位于：\n\n{expected}',
	'modal.fileConflict.mergeWarning': '预期位置已存在同名文件。移动时会合并这两个文件。',
	'modal.fileConflict.move': '移动到正确位置',
	'modal.fileConflict.moveMerge': '移动并合并',
	'modal.fileConflict.deleteMisplaced': '删除此文件',
	'modal.fileConflict.deleteCorrect': '删除正确位置的文件',
	'modal.fileConflict.skip': '跳过',

	// ---------------------------------------------------------------- 模态框：同步日志
	'modal.journal.title': '同步日志',
	'modal.journal.loading': '正在加载日志条目…',
	'modal.journal.count': '{count} 条日志记录',
	'modal.journal.empty': '没有找到日志记录。',
	'modal.journal.save': '保存为 JSON',
	'modal.journal.clear': '清空日志',

	// ---------------------------------------------------------------- 模态框：全库同步确认
	'modal.fullVaultSync.title': '全库任务同步确认',
	'modal.fullVaultSync.message': '确定要同步全部任务吗？\n在 Obsidian 中以缩进形式创建的任务，将在滴答清单中创建为子任务\n在滴答清单中创建的子任务项仍会保持为子任务项。启用全库同步时，这是创建子任务项的唯一方式。\n目前作为任务「子任务项」的内容，可能会被转换为所属任务的「子任务」。\n这些「子任务项」不会被删除。\n请谨慎操作。',
	'modal.fullVaultSync.confirm': '确认全库任务同步',

	// ---------------------------------------------------------------- 模态框：默认项目
	'modal.defaultProject.description': '选择「{file}」中的任务要添加到的滴答清单项目。',

	// ---------------------------------------------------------------- 模态框：版本更新说明
	'modal.latestChanges.title': '滴答清单同步 —— 版本变更',
	'modal.latestChanges.forkTitle': '关于本版本',
	'modal.latestChanges.forkNotice': '本项目是滴答清单同步（TickTickSync，GPL-3.0）的社区衍生版本，主要增加了中文化并让备份行为更安静。如遇问题请反馈到本仓库，不要打扰原作者。',
	'modal.latestChanges.intro': '以下是滴答清单同步相较于旧版本中会影响使用体验的变更。',
	'modal.latestChanges.strongly': '强烈',
	'modal.latestChanges.backupAdvice': '建议你尽快做一次备份。',
	'modal.latestChanges.gotIt': '知道了',

	// ---------------------------------------------------------------- 设置：标签页
	'settings.pageName': '滴答清单同步',
	'settings.pageDesc': '配置滴答清单同步设置',
	'settings.tab.access': '账户登录',
	'settings.tab.sync': '同步控制',
	'settings.tab.manual': '维护',
	'settings.tab.debug': '调试选项',
	'settings.tab.tasks': '任务设置',
	'settings.tab.notes': '笔记',

	// ---------------------------------------------------------------- 设置：登录
	'settings.login.loggedIn': '你已登录。可以在这里重新登录。',
	'settings.login.pleaseLogin': '请在此登录。',
	'settings.login.privacy': '无论使用哪种登录方式，滴答清单同步都不会保存你的用户名或密码。',
	'settings.login.ssoHintDesktop': '如果你的 {provider} 账户启用了 SSO/两步验证，请使用 SSO/两步验证登录。如果使用用户名和密码，请使用常规登录。',
	'settings.login.mobileHint': '移动端仅支持常规登录。如果你的 {provider} 账户启用了 SSO/两步验证，请先在桌面端登录，将库同步到本设备后即会自动登录。',
	'settings.login.homeServer': '选择服务器',
	'settings.login.ssoLogin': 'SSO/两步验证登录',
	'settings.login.loginWith': '使用 {provider} 登录',
	'settings.login.regularLogin': '常规登录',
	'settings.login.username': '用户名',
	'settings.login.usernameDesc': '你的 {provider} 账户用户名',
	'settings.login.password': '密码',
	'settings.login.passwordDesc': '你的 {provider} 账户密码',
	'settings.login.login': '登录',
	'settings.login.notSelected': '未选择',

	// ---------------------------------------------------------------- 设置：维护
	'settings.manual.syncName': '手动同步',
	'settings.manual.syncDesc': '立即执行一次同步',
	'settings.manual.syncButton': '同步',
	'settings.manual.checkDbName': '检查数据库',
	'settings.manual.checkDbDesc': '检查可能出现的问题：同步错误、文件重命名未更新、任务漏同步等',
	'settings.manual.checkDbButton': '检查数据库',
	'settings.manual.checking': '检查中…',
	'settings.manual.backupName': '备份滴答清单数据',
	'settings.manual.backupDesc': '点击后将滴答清单数据备份到库中所选的目录',
	'settings.manual.backupButton': '备份',
	'settings.manual.backupOnStartupName': '启动时备份',
	'settings.manual.backupOnStartupDesc': '每次启动 Obsidian 时导出滴答清单数据。默认关闭：导出的是全部任务的完整副本，滴答清单对该接口有频率限制，且插件从不读回这些文件。',
	'settings.manual.retentionName': '保留备份文件数量',
	'settings.manual.retentionDesc': '备份文件夹中较旧的文件会被自动删除，只保留最近的若干个（1–20）。',
	'settings.manual.backupFolderName': '备份文件夹',
	'settings.manual.backupFolderDesc': '选择存放备份文件的文件夹。',
	'settings.manual.purgeName': '永久删除已删除任务',
	'settings.manual.purgeDesc': '查看并从数据库中永久移除已删除任务的记录',
	'settings.manual.purgeButton': '管理已删除任务',
	'settings.manual.recoverName': '恢复已删除任务',
	'settings.manual.recoverDesc': '查看已删除任务并将它们恢复到原文件或其他文件',
	'settings.manual.recoverButton': '恢复已删除任务',
	'settings.manual.retentionDaysName': '已删除任务保留天数',
	'settings.manual.retentionDaysDesc': '已删除任务在自动清理前保留的天数（1–31）',
	'settings.manual.selectFolder': '选择或创建文件夹',

	// ---------------------------------------------------------------- 设置：调试
	'settings.debug.modeName': '调试模式',
	'settings.debug.modeDesc': '启用详细日志输出',
	'settings.debug.logLevelName': '日志级别',
	'settings.debug.logLevelDesc': '写入控制台的最低日志级别',
	'settings.debug.genName': '生成调试信息',
	'settings.debug.genDesc': '生成当前插件状态的快照',
	'settings.debug.genButton': '生成',
	'settings.debug.copyToClipboard': '复制到剪贴板',
	'settings.debug.copyDone': '已复制！',
	'settings.debug.copyFailed': '复制失败',
	'settings.debug.retentionName': '日志保留天数',
	'settings.debug.retentionDesc': '同步日志条目保留的天数（1–7）',
	'settings.debug.viewJournalName': '同步日志',
	'settings.debug.viewJournalDesc': '浏览并导出同步日志条目',
	'settings.debug.viewJournalButton': '查看日志',

	// ---------------------------------------------------------------- 设置：同步控制
	'settings.sync.defaults': '默认设置',
	'settings.sync.defaultsDesc': '默认文件夹与项目设置',
	'settings.fullVault.title': '全库任务同步',
	'settings.fullVault.shortDesc': '全库同步设置',
	'settings.fullVault.desc': '默认情况下，只有标记了 #ticktick 的任务才会同步。开启此选项后，库中的所有任务都会被同步。',
	'settings.fullVault.note': '注意：这包括当前作为任务「子任务项」的所有内容。',
	'settings.fullVault.enabled': '全库任务同步已启用。',
	'settings.fullVault.notEnabled': '未启用全库任务同步。',
	'settings.fullVault.disabled': '全库任务同步已关闭。',

	// ---------------------------------------------------------------- 设置：默认值
	'settings.defaults.projectName': '默认项目',
	'settings.defaults.projectDesc1': '任务会被添加到该文件关联的默认项目。',
	'settings.defaults.projectDesc2': '如果向没有关联默认项目的文件添加任务，',
	'settings.defaults.projectDesc3': '它们会被添加到 {project} 项目。',
	'settings.defaults.folderName': '默认文件夹位置',
	'settings.defaults.folderDesc': '存放滴答清单任务的文件夹。',
	'settings.defaults.projectFile': '默认项目文件',
	'settings.defaults.hitEnter': '按下回车后创建',
	'settings.defaults.willBeCreated': '将在',
	'settings.defaults.moveExisting': '移动现有文件',
	'settings.defaults.updateWorldTitle': '移动文件',
	'settings.defaults.updateWorldBody': '以下文件包含任务，将被移动到 {folder}',
	'settings.defaults.organizedByGroups': '（按项目分组组织）',
	'settings.defaults.yesMove': '是，移动它们',
	'settings.defaults.noCancel': '否，取消',
	'settings.defaults.noFilesToMove': '没有找到包含相关任务、需要移动的文件。',

	// ---------------------------------------------------------------- 设置：任务
	'settings.tasks.reorganizeTitle': '重新整理文件？',
	'settings.tasks.reorganizeQuestion': '是否现在将现有任务文件重新整理到文件夹中？',
	'settings.tasks.reorganizeExplain': '这会将插件管理的文件移动到与滴答清单文件夹结构一致的位置。',
	'settings.tasks.reorganizeWarning': '没有默认项目的文件不会被移动。',
	'settings.tasks.reorganizing': '正在整理…',
	'settings.tasks.yesReorganize': '是，重新整理',
	'settings.tasks.notesDisabledTitle': '提示：',
	'settings.tasks.notesDisabledBody': '笔记同步已关闭。链接只能添加到任务文本中，或完全不添加。',
	'settings.tasks.keepFoldersName': '按滴答清单文件夹组织任务',
	'settings.tasks.keepFoldersDesc': '启用后，任务会被整理到与滴答清单文件夹结构一致的 Obsidian 文件夹中。没有默认项目的文件不会被移动。',
	'settings.tasks.obsidianLinkName': 'Obsidian 中的任务链接处理',
	'settings.tasks.obsidianLinkDesc': '在 Obsidian 的任务中添加滴答清单任务链接',
	'settings.tasks.tickTickLinkName': '滴答清单中的任务链接处理',
	'settings.tasks.tickTickLinkDesc': '在滴答清单的任务中添加 Obsidian 文件链接',
	'settings.tasks.displayTitle': '任务显示',
	'settings.tasks.displayDesc': '控制阅读模式和编辑模式下显示哪些任务元素。',
	'settings.tasks.tickTickLink': '滴答清单链接',
	'settings.tasks.tickTickId': '滴答任务 ID',
	'settings.tasks.tickTickTag': '#ticktick 标签',
	'settings.tasks.reading': '阅读模式',
	'settings.tasks.edit': '编辑模式',
	'settings.tasks.stopInjectTitle': '停止注入 #ticktick 标签',
	'settings.tasks.stopInjectDesc': '不再向滴答清单中已同步的任务添加「ticktick」标签。',
	'settings.tasks.stripOnResetTitle': '重置时移除 #ticktick 标签',
	'settings.tasks.stripOnResetDesc': '重置任务时，同时从滴答清单中移除历史遗留的「ticktick」标签。',

	// ---------------------------------------------------------------- 设置：笔记
	'settings.notes.syncName': '同步笔记',
	'settings.notes.syncDesc': '同步任务笔记',
	'settings.notes.enabled': '笔记将会同步。',
	'settings.notes.disabled': '笔记将不会同步。',
	'settings.notes.delimiterName': '笔记分隔符',
	'settings.notes.delimiterDesc': '选择笔记与任务之间的分隔方式。修改将在下次从滴答清单更新时生效。',
	'settings.notes.noDelimiter': '不使用分隔符',
	'settings.notes.custom': '自定义',
	'settings.notes.delimiterPlaceholder': '输入分隔符（例如 ---）',
	'settings.notes.preview': '预览：',
	'settings.notes.resetGetNotes': '从滴答清单获取所有笔记？',
	'settings.notes.resetRemoveNotes': '从 Obsidian 移除所有笔记？（不会删除滴答清单中的笔记）',

	// ---------------------------------------------------------------- 设置：重置任务
	'settings.reset.updateTasks': '更新滴答清单和 Obsidian 中的任务？',
	'settings.reset.button': '重置任务',
	'settings.reset.working': '正在重置…',
	'settings.reset.confirmTitle': '确认重置',
	'settings.reset.question': '是否要{action}',
	'settings.reset.caution': '注意：该操作需要一些时间，会双向更新滴答清单与 Obsidian 中的任务。',
	'settings.reset.warning': '这会同步全部内容，可能需要较长时间。',
	'settings.reset.reallyConfirmPrefix': '你',
	'settings.reset.really': '确定',
	'settings.reset.confirmSuffix': '要{action}吗？',
	'settings.reset.yes': '是，重置',
	'settings.reset.no': '否，取消',

	// ---------------------------------------------------------------- 设置：同步间隔
	'settings.autoInterval.name': '自动同步间隔',
	'settings.autoInterval.shortDesc': '同步间隔设置',
	'settings.autoInterval.desc': '请输入期望的间隔时间，单位为秒。填 0 表示仅手动同步。默认 300 秒，即每 5 分钟同步一次。可自定义，但不能小于 20 秒。',
	'settings.autoInterval.placeholder': '同步间隔',
	'settings.autoInterval.wrongType': '类型错误，请输入整数。',
	'settings.autoInterval.tooSmall': '同步间隔不能小于 20 秒。',
	'settings.autoInterval.updated': '设置已更新。',

	// ---------------------------------------------------------------- 设置：同步限制
	'settings.limit.desc': '仅同步匹配所选标签和/或项目的任务。',
	'settings.limit.title': '限制同步范围',
	'settings.limit.shortDesc': '同步范围相关设置',
	'settings.limit.projectName': '项目',
	'settings.limit.projectDesc': '只有该项目中的任务会被同步。',
	'settings.limit.tagBehaviorName': '标签组合方式',
	'settings.limit.tagBehaviorDesc': '决定多个筛选条件如何组合。',
	'settings.limit.tagName': '标签',
	'settings.limit.tagDesc': '标签值，不要带 “#”。',
	'settings.limit.tagPlaceholder': '只有带此标签的任务会被同步',
	'settings.limit.noLimit': '不限制。',
	'settings.limit.onlyProject': '只有 <b>{project}</b> 中的任务会被同步',
	'settings.limit.onlyTag': '只有标记了 <b>#{tag}</b> 标签的任务会被同步',
	'settings.limit.projectAndTag': '只有位于 <b>{project}</b> 且标记了 <b>#{tag}</b> 标签的任务会被同步',
	'settings.limit.projectOrTag': '<b>{project}</b> 中的所有任务都会被同步；标记了 <b>#{tag}</b> 标签的所有任务也会被同步',
	'settings.limit.noDefaultFile': '未找到项目「{project}」对应的默认项目文件。请新建一个文件并将其默认项目设为此项目，或选择一个文件作为该项目的默认文件。',

	// ---------------------------------------------------------------- 设置：设备身份
	'settings.device.name': '设备标识',
	'settings.device.label': '名称',
	'settings.device.current': '当前设备',
	'settings.device.currentDesc': '本设备的身份标识',
	'settings.device.editLabel': '编辑设备名称',
	'settings.device.knownDevices': '已知设备',
	'settings.device.knownDevicesDesc': '所有曾使用过本库的设备。',
	'settings.device.noDevices': '尚未记录任何设备',
	'settings.device.currentTag': '（当前）',

	// ---------------------------------------------------------------- 查询代码块
	'query.tasks': '任务',
	'query.loading': '正在加载任务…',
	'query.systemError': '系统错误：{message}。',
	'query.warnings': '警告',
	'query.errorTitle': '查询出错',
	'query.warnJsonDeprecated': '该查询使用了 JSON 写法，此写法已弃用并将在未来版本中移除，请改用 YAML。',
	'query.warnGroupDeprecated': '字段「group」已弃用并将在未来版本中移除，请改用「groupBy」。',

	// ---------------------------------------------------------------- 桌面登录
	'login.desktopUnavailable': '当前环境不支持桌面端登录。',
	'login.cookieNotFound': '未能获取会话 Cookie，请确认你已登录。',
	'login.signInThenFinish': '请先完成登录，然后点击完成或取消。',

	// ---------------------------------------------------------------- 状态栏
	'status.inbox': '收集箱',
	'status.noDefaultProject': '无默认项目',

	// ---------------------------------------------------------------- 设置：选项值
	'option.link.noLink': '不添加链接',
	'option.link.taskLink': '链接在任务中',
	'option.link.noteLink': '链接在描述中',
	'option.visibility.show': '显示',
	'option.visibility.hide': '隐藏',
	'option.visibility.hover': '悬停时显示',
};

export default zh;
