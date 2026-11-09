/**
 * 英文文案（默认语言 / 回退语言）。
 *
 * key 命名规则：`<模块>.<用途>`，模块名与源文件目录对应。
 * 带占位符的文案用 `{name}` 标记，由 `t()` 运行时替换。
 *
 * 注意：这里的文案同时是「英文原文」的权威拷贝。改动任何一条都要同步
 * locales/zh.ts，`npm run check:i18n` 会校验两侧 key 是否一致。
 */

const en = {
	// ---------------------------------------------------------------- 通用
	'common.cancel': 'Cancel',
	'common.close': 'Close',
	'common.save': 'Save',
	'common.unknown': 'Unknown',
	'common.none': '(none)',

	// ---------------------------------------------------------------- 命令 / 功能区
	'command.setDefaultProject': 'Set default TickTick project for current file',
	'command.sync': 'Synchronize',
	'command.deletePermanent': 'Permanently delete tasks',
	'command.recoverTasks': 'View and recover deleted tasks',

	// ---------------------------------------------------------------- 启动 / 通用通知
	'startup.pleaseLogin': 'Please login from settings.',
	'startup.settingsFailed': 'Settings failed to load. Please reload the AllinDida plugin.',
	'startup.initFailed': 'AllinDida plugin initialization failed, please check userid and password in settings.',
	'startup.loaded': 'AllinDida loaded successfully.',
	'startup.error': 'An error occurred: {message}',
	'sync.completed': 'Sync completed.',
	'sync.error': 'An error occurred while syncing: {message}',
	'sync.duplicatesAborted': 'Sync aborted. Please fix duplicates manually in metadata to prevent data corruption.',
	'sync.duplicateCheckFailed': 'Duplicate check failed: {message}',
	'sync.tasksNotFoundNotDeleted': 'Tasks not found on TickTick will not be deleted.',
	'sync.databaseCheckCompleted': 'Database check completed.',
	'sync.databaseCheckError': 'An error in saveProjectsToCache occurred: {message}',
	'login.notLoggedIn': 'Please login from settings.',
	'login.failedShort': 'Login Failed.',
	'login.failed': 'Login failed, please login through settings.',
	'login.failedWithError': 'Login failed: {message}\nPlease login again',
	'login.enterCredentials': 'Please fill in both Username and Password',
	'login.differentUser': 'You are logged in with a different user ID.',
	'login.opening': 'Opening login...',
	'login.mobileOnlyRegular': 'Mobile only allows for Regular Login.',
	'login.successful': 'Login successful.',
	'login.failedWithMessage': 'Login failed: {message}',

	// ---------------------------------------------------------------- 任务操作通知
	'task.closed': 'Task {taskId} is closed.',
	'task.reopened': 'Task {taskId} is reopened.',
	'task.created': 'New task created: {title} (ID: {id})',
	'task.createFailed': 'Failed to create task to TickTick: {message}. The task was not modified.',
	'task.createFailedApi': 'Failed to create task in TickTick{status}: {message}',
	'task.removedFromVault': 'Tasks will not be deleted from vault.',
	'task.recoveryFailed': 'Recovery failed: {message}',
	'task.recoveredTo': 'Task recovered to {path}',
	'task.allRecovered': 'All tasks have been recovered.',
	'task.enterValidPath': 'Please enter a valid file path.',
	'task.noDeletedFound': 'No deleted tasks found.',
	'task.permanentlyDeleted': 'Permanently deleted {count} task(s).',
	'task.orphansAdded': 'Added {count} orphaned task(s) to vault and database.',
	'task.orphansDeleted': 'Deleted {count} orphaned task(s) from TickTick.',
	'task.movedToProjectGroup': 'File moved to different project group. {count} task(s) updated.',
	'task.modified': 'Task {title} modified.',
	'task.newTasksOnNextSync': 'New tasks will be added to TickTick on next sync.',
	'task.noActiveFile': 'No active file.',
	'task.deleted': 'Task {taskId} deleted',
	'task.notFoundWillRemove': 'Task not found. It will be removed from the file.',
	'task.willNotBeDeleted': 'Tasks will not be deleted. Please rectify the issue before the next sync.',
	'task.fileRecordRemoved': 'Removed {count} non-existent file(s) from the database.',
	'task.circularDependency': 'A circular parent-child dependency was found. Please fix in TickTick by checking parent-child relationships.',
	'task.movedElsewhereInTickTick': 'Task {title} was moved in TickTick, but is in {file}. Assuming that this is intentional and not moving it.',

	// ---------------------------------------------------------------- 文件夹整理
	'reorganize.starting': 'Organizing task files into folders...',
	'reorganize.alreadyOrganized': 'All files are already organized',
	'reorganize.complete': 'Reorganization complete: {count} files moved',
	'reorganize.completeWithErrors': 'Reorganization complete: {count} files moved, {errors} errors (see console)',
	'reorganize.error': 'Error organizing files: {message}',
	'reorganize.moveExists': 'Cannot move file: {path} already exists',
	'reorganize.moveError': 'Error moving file: {message}',
	'reorganize.taskFileError': 'Error moving task file: {message}',

	// ---------------------------------------------------------------- 项目
	'project.saveError': 'error on save projects: {message}',
	'project.groupsError': 'Unable to get project groups: {message}',

	// ---------------------------------------------------------------- 文件操作
	'file.creating': 'Creating new file: {path}',
	'file.moved': 'Moved {from} to {to}',
	'file.deleted': 'Deleted {path}',
	'file.deletedAndMoved': 'Deleted {path} and moved {from} in its place',
	'file.taskMoved': 'Task Moved.\nTask: {title}\nwas moved from\n {from}\nto\n{to}',
	'file.taskNewParent': 'Task has new Parent.\nTask: {title}\nis now a child of\n {parent}',
	'file.taskNowTopLevel': 'Task is now a top level task.\nTask: {title}',
	'file.renameFailed': 'File rename failed. {message}',
	'common.unknownProject': 'Unknown Project',
	'folder.created': 'New folder {path} created.',
	'folder.createFailed': 'Folder {name} creation failed: {message}. Please correct and try again.',
	'folder.nowIs': '{type} folder is now {path}.',
	'folder.typeBackup': 'Backup',
	'folder.typeDefault': 'Default',

	// ---------------------------------------------------------------- 备份
	'backup.saved': 'TickTick backup saved: {path}',
	'backup.empty': 'TickTick backup failed: the export returned no data.',
	'backup.error': 'An error occurred while creating TickTick backup: {message}',

	// ---------------------------------------------------------------- 模态框：任务删除
	'modal.taskDeletion.title': 'Task Deletion Confirmation',
	'modal.taskDeletion.message': 'The following Task(s) will be deleted because: ',
	'modal.taskDeletion.confirm': 'Confirm Deletion',
	'modal.taskDeletion.unknownFile': 'Unknown File',
	'modal.taskDeletion.reasonDeletedInTickTick': 'they are deleted in TickTick or marked as deleted in the database.',
	'modal.taskDeletion.reasonNotFound': 'task(s) not found on TickTick',
	'modal.taskDeletion.reasonDeletedFromTickTick': 'tasks deleted from TickTick',
	'modal.taskDeletion.reasonNotInCache': 'task not found in local cache.',
	'modal.taskDeletion.reasonRemovedFromFile': 'The tasks were removed from the file',

	// ---------------------------------------------------------------- 模态框：重复清单
	'modal.duplicateLists.title': 'Duplicate Projects/Lists found',
	'modal.duplicateLists.message': 'The following duplicate Projects/Lists were found. On {baseURL}, please either choose one of those to contain the tasks from both lists, or rename one of the lists.',
	'modal.duplicateLists.abort': 'Abort Sync',
	'modal.duplicateLists.projectName': 'Project name',
	'modal.duplicateLists.projectId': 'Project ID',

	// ---------------------------------------------------------------- 模态框：重复任务
	'modal.duplicateTasks.title': 'Duplicate tasks found',
	'modal.duplicateTasks.message': 'The following tasks were found in multiple files in your metadata. This causes unpredictable sync results. Select which instances to remove from your files and metadata, or cancel to handle it manually.',
	'modal.duplicateTasks.remove': 'Remove?',
	'modal.duplicateTasks.taskTitle': 'Task title',
	'modal.duplicateTasks.filePath': 'File path',
	'modal.duplicateTasks.cancelAbort': 'Cancel & abort sync',
	'modal.duplicateTasks.applyContinue': 'Apply & continue sync',

	// ---------------------------------------------------------------- 模态框：恢复已删除任务
	'modal.recover.title': 'Recover deleted tasks',
	'modal.recover.intro': 'Select tasks to recover. Default restores to original file.',
	'modal.recover.untitled': 'Untitled',
	'modal.recover.noFile': 'No file',
	'modal.recover.meta': 'Original file: {file} | Deleted: {date}',
	'modal.recover.toOriginal': 'Recover to original file',
	'modal.recover.toOther': 'Recover to different file...',
	'modal.recover.confirmRecovery': 'Confirm recovery',
	'modal.recover.pathPlaceholder': 'Enter file path (e.g. Folder/task.md)',

	// ---------------------------------------------------------------- 模态框：永久删除已删除任务
	'modal.cleanupDeleted.title': 'Permanently delete tasks',
	'modal.cleanupDeleted.intro': 'These tasks were deleted and are kept only as records. Deleting them here cannot be undone.',
	'modal.cleanupDeleted.selectAll': 'Select all',
	'modal.cleanupDeleted.deleteSelected': 'Permanently delete selected',
	'modal.cleanupDeleted.noTasks': 'No deleted tasks found.',

	// ---------------------------------------------------------------- 模态框：数据库清理
	'modal.cleanupDb.title': 'Files missing from vault',
	'modal.cleanupDb.message': 'The following files are tracked in the database but no longer exist in your vault.',
	'modal.cleanupDb.remove': 'Remove database entries',
	'modal.cleanupDb.keep': 'Keep entries',

	// ---------------------------------------------------------------- 模态框：孤立任务
	'modal.orphan.title': 'Orphaned tasks found',
	'modal.orphan.message': 'These tasks exist in TickTick but have no matching task in your vault.',
	'modal.orphan.chooseAction': 'What would you like to do with these tasks?',
	'modal.orphan.add': 'Add to file & db',
	'modal.orphan.delete': 'Delete from TickTick',
	'modal.orphan.skip': 'Cancel',

	// ---------------------------------------------------------------- 模态框：文件位置冲突
	'modal.fileConflict.title': 'Misplaced project file',
	'modal.fileConflict.message': 'A file matching project "{project}" was found at:\n\n{file}\n\nbut it should be located at:\n\n{expected}',
	'modal.fileConflict.mergeWarning': 'A file already exists at the expected location. Moving will merge the two files.',
	'modal.fileConflict.move': 'Move to correct location',
	'modal.fileConflict.moveMerge': 'Move & Merge',
	'modal.fileConflict.deleteMisplaced': 'Delete this file',
	'modal.fileConflict.deleteCorrect': 'Delete file at correct location',
	'modal.fileConflict.skip': 'Skip',

	// ---------------------------------------------------------------- 模态框：同步日志
	'modal.journal.title': 'Sync journal',
	'modal.journal.loading': 'Loading journal entries...',
	'modal.journal.count': '{count} journal entr(y/ies)',
	'modal.journal.empty': 'No journal entries found.',
	'modal.journal.save': 'Save to JSON',
	'modal.journal.clear': 'Clear journal',

	// ---------------------------------------------------------------- 模态框：全库同步确认
	'modal.fullVaultSync.title': 'Full Vault Task Sync Confirmation',
	'modal.fullVaultSync.message': 'Are you sure you want to Sync ALL tasks?\nIndented Tasks created in Obsidian will be created as subtasks in TickTick\nTask Items created in TickTick will still be Task Items. This is the only way to create Task Items when Full Vault Sync is enabled.\nTasks that are currently "Items" of tasks MAY be converted to "Sub Tasks" of the containing Tasks.\nThe "Items" will not be deleted.\nPlease proceed with Caution.',
	'modal.fullVaultSync.confirm': 'Confirm Full Vault Task Sync',

	// ---------------------------------------------------------------- 模态框：默认项目
	'modal.defaultProject.description': 'Choose the TickTick project that tasks in "{file}" are added to.',

	// ---------------------------------------------------------------- 模态框：版本更新说明
	'modal.latestChanges.title': 'TicTickSync -- Latest Changes.',
	'modal.latestChanges.forkTitle': 'About this build',
	'modal.latestChanges.forkNotice': 'This is a community fork of TickTickSync (GPL-3.0), adding Chinese localization and quieter backup behaviour. Please report issues to this repository, not to the original author.',
	'modal.latestChanges.intro': 'The following are user experience affecting changes from prior versions of TickTickSync.',
	'modal.latestChanges.strongly': 'Strongly',
	'modal.latestChanges.backupAdvice': ' recommend that you take a backup ASAP.',
	'modal.latestChanges.gotIt': 'Got it.',

	// ---------------------------------------------------------------- 设置：标签页
	'settings.pageName': 'AllinDida',
	'settings.tab.access': 'Access Control',
	'settings.tab.sync': 'Sync Control',
	'settings.tab.manual': 'Maintenance',
	'settings.tab.debug': 'Debug Options',
	'settings.tab.tasks': 'Task Settings',
	'settings.tab.notes': 'Notes',

	// ---------------------------------------------------------------- 设置：登录
	'settings.login.loggedIn': 'You are logged in. You can re-login here.',
	'settings.login.pleaseLogin': 'Please login here.',
	'settings.login.privacy': 'Regardless of login option, AllinDida will not save your User ID or your Password anywhere.',
	'settings.login.ssoHintDesktop': 'If your {provider} account is set up with SSO/2FA, login using SSO/2FA. If your {provider} account set up with a username and password, login using Regular Login.',
	'settings.login.mobileHint': 'Mobile only allows Regular Login. If your {provider} account is set up with SSO/2FA, please login from desktop first, synchronize your vault to this device and you will be logged in.',
	'settings.login.homeServer': 'Select home server',
	'settings.login.ssoLogin': 'SSO/2FA Login',
	'settings.login.loginWith': 'Login with {provider}',
	'settings.login.regularLogin': 'Regular Login',
	'settings.login.username': 'Username',
	'settings.login.usernameDesc': 'Your {provider} account username',
	'settings.login.password': 'Password',
	'settings.login.passwordDesc': 'Your {provider} account password',
	'settings.login.login': 'Login',
	'settings.login.notSelected': 'Not Selected',

	// ---------------------------------------------------------------- 设置：维护
	'settings.manual.syncName': 'Manual sync',
	'settings.manual.syncDesc': 'Manually perform a synchronization task',
	'settings.manual.syncButton': 'Sync',
	'settings.manual.checkDbName': 'Check database',
	'settings.manual.checkDbDesc': 'Check for possible issues: sync error, file renaming not updated, or missed tasks not synchronized',
	'settings.manual.checkDbButton': 'Check Database',
	'settings.manual.checking': 'Checking...',
	'settings.manual.backupName': 'Backup TickTick data',
	'settings.manual.backupDesc': 'Click to backup TickTick data. The backed-up files will be stored in the selected directory of the Obsidian vault',
	'settings.manual.backupButton': 'Backup',
	'settings.manual.backupOnStartupName': 'Back up on startup',
	'settings.manual.backupOnStartupDesc': 'Export your TickTick data every time Obsidian starts. Off by default: the export is a full copy of all tasks, TickTick rate-limits how often it can be produced, and the plugin never reads these files back.',
	'settings.manual.retentionName': 'Backup files to keep',
	'settings.manual.retentionDesc': 'Older backup files in the backup folder are removed automatically, keeping only the most recent ones (1–20).',
	'settings.manual.backupFolderName': 'Backup folder',
	'settings.manual.backupFolderDesc': 'Choose the folder to store the backup files.',
	'settings.manual.purgeName': 'Permanently delete deleted tasks',
	'settings.manual.purgeDesc': 'View and permanently remove deleted task records from the database',
	'settings.manual.purgeButton': 'Manage Deleted Tasks',
	'settings.manual.recoverName': 'Recover deleted tasks',
	'settings.manual.recoverDesc': 'View and restore deleted tasks back to their original or a different file',
	'settings.manual.recoverButton': 'Recover Deleted Tasks',
	'settings.manual.retentionDaysName': 'Deleted Task Retention',
	'settings.manual.retentionDaysDesc': 'Days to keep deleted tasks before auto-purge (1–31)',
	'settings.manual.selectFolder': 'Select or Create folder',

	// ---------------------------------------------------------------- 设置：调试
	'settings.debug.modeName': 'Debug mode',
	'settings.debug.modeDesc': 'Enable verbose logging',
	'settings.debug.logLevelName': 'Log level',
	'settings.debug.logLevelDesc': 'Minimum level written to the console',
	'settings.debug.genName': 'Generate debug info',
	'settings.debug.genDesc': 'Create a snapshot of the current plugin state',
	'settings.debug.genButton': 'Generate',
	'settings.debug.copyToClipboard': 'Copy to clipboard',
	'settings.debug.copyDone': 'Copied!',
	'settings.debug.copyFailed': 'Copy failed',
	'settings.debug.retentionName': 'Journal retention',
	'settings.debug.retentionDesc': 'Days to keep journal entries (1–7)',
	'settings.debug.viewJournalName': 'Sync journal',
	'settings.debug.viewJournalDesc': 'Browse and export sync journal entries',
	'settings.debug.viewJournalButton': 'View journal',

	// ---------------------------------------------------------------- 设置：同步控制
	'settings.sync.defaults': 'Defaults',
	'settings.sync.defaultsDesc': 'Default Folder and Project settings',
	'settings.fullVault.title': 'Full vault sync',
	'settings.fullVault.shortDesc': 'Full vault settings',
	'settings.fullVault.desc': 'By default, only tasks marked with #ticktick are synchronized. If this option is turned on, all tasks in the vault will be synchronized.',
	'settings.fullVault.note': 'NOTE: This includes all tasks that are currently Items of a task.',
	'settings.fullVault.enabled': 'Full vault sync is enabled.',
	'settings.fullVault.notEnabled': 'Full vault sync not enabled.',
	'settings.fullVault.disabled': 'Full vault sync is disabled.',

	// ---------------------------------------------------------------- 设置：默认值
	'settings.defaults.projectName': 'Default Project',
	'settings.defaults.projectDesc1': 'Tasks are added to the default project associated with a file.',
	'settings.defaults.projectDesc2': 'If tasks are added to a file with no default project association',
	'settings.defaults.projectDesc3': 'they will be added to the {project} project.',
	'settings.defaults.folderName': 'Default folder location',
	'settings.defaults.folderDesc': 'Folder where TickTick tasks are stored.',
	'settings.defaults.projectFile': 'Default Project File',
	'settings.defaults.hitEnter': 'after you hit ENTER',
	'settings.defaults.willBeCreated': 'will be created',
	'settings.defaults.moveExisting': 'Move Existing Files.',
	'settings.defaults.updateWorldTitle': 'Update the World',
	'settings.defaults.updateWorldBody': 'The following files contain tasks and will be moved to {folder}',
	'settings.defaults.organizedByGroups': ' (organized by project groups)',
	'settings.defaults.yesMove': 'Yes, move them!',
	'settings.defaults.noCancel': 'No, cancel',
	'settings.defaults.noFilesToMove': 'No files found containing relevant tasks to move.',

	// ---------------------------------------------------------------- 设置：任务
	'settings.tasks.reorganizeTitle': 'Reorganize Files?',
	'settings.tasks.reorganizeQuestion': 'Would you like to reorganize existing task files into folders now?',
	'settings.tasks.reorganizeExplain': 'This will move plugin-managed files to match your TickTick folder structure.',
	'settings.tasks.reorganizeWarning': 'Files without a default project will not be moved.',
	'settings.tasks.reorganizing': 'Reorganizing...',
	'settings.tasks.yesReorganize': 'Yes, reorganize',
	'settings.tasks.notesDisabledTitle': 'Notice:',
	'settings.tasks.notesDisabledBody': 'Note syncing is disabled. Links can only be added to the Task text or not added at all.',
	'settings.tasks.keepFoldersName': 'Organize tasks by TickTick folders',
	'settings.tasks.keepFoldersDesc': 'When enabled, tasks will be organized into Obsidian folders matching your TickTick folder structure. Files without a default project will not be moved.',
	'settings.tasks.obsidianLinkName': 'Task link handling in Obsidian',
	'settings.tasks.obsidianLinkDesc': 'Add TickTick task link to Tasks in Obsidian',
	'settings.tasks.tickTickLinkName': 'Task link handling in TickTick',
	'settings.tasks.tickTickLinkDesc': 'Add Obsidian file link to Tasks in TickTick',
	'settings.tasks.displayTitle': 'Task Display',
	'settings.tasks.displayDesc': 'Control which task elements are visible in Reading mode and Edit mode.',
	'settings.tasks.tickTickLink': 'TickTick Link',
	'settings.tasks.tickTickId': 'TickTick ID',
	'settings.tasks.tickTickTag': '#ticktick Tag',
	'settings.tasks.reading': 'Reading',
	'settings.tasks.edit': 'Edit',
	'settings.tasks.stopInjectTitle': 'Stop injecting #ticktick tag',
	'settings.tasks.stopInjectDesc': 'Do not add the "#ticktick" tag to synced tasks in TickTick.',
	'settings.tasks.stripOnResetTitle': 'Strip #ticktick tag on reset',
	'settings.tasks.stripOnResetDesc': 'When resetting tasks, also remove the legacy "#ticktick" tag from TickTick.',

	// ---------------------------------------------------------------- 设置：笔记
	'settings.notes.syncName': 'Sync Notes',
	'settings.notes.syncDesc': 'Synchronize Notes',
	'settings.notes.enabled': 'Notes will be synchronized.',
	'settings.notes.disabled': 'Notes will be not synchronized.',
	'settings.notes.delimiterName': 'Note Delimiter',
	'settings.notes.delimiterDesc': 'Choose how Notes are separated from a Task. Changes will be applied on next update from TickTick.',
	'settings.notes.noDelimiter': 'No delimiter',
	'settings.notes.custom': 'Custom',
	'settings.notes.delimiterPlaceholder': 'Enter delimiter (e.g., ---)',
	'settings.notes.preview': 'Preview:',
	'settings.notes.resetGetNotes': 'Get all Notes from TickTick?',
	'settings.notes.resetRemoveNotes': 'Remove all Notes from Obsidian? (This will not delete Notes in TickTick)',

	// ---------------------------------------------------------------- 设置：重置任务
	'settings.reset.updateTasks': 'Update Tasks in TickTick and Obsidian?',
	'settings.reset.button': 'Reset Tasks',
	'settings.reset.working': 'Resetting...',
	'settings.reset.confirmTitle': 'Confirm Reset',
	'settings.reset.question': 'Do you want to {action}',
	'settings.reset.caution': 'Caution: This will take some time and update Tasks from TickTick to Obsidian and Obsidian to TickTick.',
	'settings.reset.warning': 'This will sync everything and can take a while.',
	'settings.reset.reallyConfirmPrefix': 'Do you',
	'settings.reset.really': 'REALLY',
	'settings.reset.confirmSuffix': 'want to {action}?',
	'settings.reset.yes': 'Yes, reset',
	'settings.reset.no': 'No, cancel',

	// ---------------------------------------------------------------- 设置：同步间隔
	'settings.autoInterval.name': 'Automatic sync interval time',
	'settings.autoInterval.shortDesc': 'Sync interval setting',
	'settings.autoInterval.desc': 'Please specify the desired interval time, with seconds as the default unit. 0 for manual sync. The default setting is 300 seconds, which corresponds to syncing once every 5 minutes. You can customize it, but it cannot be lower than 20 seconds.',
	'settings.autoInterval.placeholder': 'Sync interval',
	'settings.autoInterval.wrongType': 'Wrong type, please enter a integer.',
	'settings.autoInterval.tooSmall': 'The synchronization interval time cannot be less than 20 seconds.',
	'settings.autoInterval.updated': 'Settings have been updated.',

	// ---------------------------------------------------------------- 设置：同步限制
	'settings.limit.desc': 'Only sync tasks matching the selected tag and/or project.',
	'settings.limit.title': 'Limit synchronization',
	'settings.limit.shortDesc': 'Synchronization settings added for effect',
	'settings.limit.projectName': 'Project',
	'settings.limit.projectDesc': 'Only tasks in this project will be synchronized.',
	'settings.limit.tagBehaviorName': 'Tag Behavior',
	'settings.limit.tagBehaviorDesc': 'Determine how Tags will be handled.',
	'settings.limit.tagName': 'Tag',
	'settings.limit.tagDesc': 'Tag value, no "#".',
	'settings.limit.tagPlaceholder': 'Only tasks with this tag will be synced',
	'settings.limit.noLimit': 'No limitation.',
	'settings.limit.onlyProject': 'Only Tasks in <b>{project}</b> will be synchronized',
	'settings.limit.onlyTag': 'Only Tasks tagged with <b>#{tag}</b> tag will be synchronized',
	'settings.limit.projectAndTag': 'Only tasks in <b>{project}</b> AND tagged with <b>#{tag}</b> tag will be synchronized',
	'settings.limit.projectOrTag': 'All tasks in <b>{project}</b> will be synchronized. All tasks tagged with <b>#{tag}</b> tag will be synchronized',
	'settings.limit.noDefaultFile': 'Did not find a default Project File for Project {project}. Please create a file and set its default to this project, or select a file to be the default for this project.',

	// ---------------------------------------------------------------- 设置：设备身份
	'settings.device.name': 'Device Identity',
	'settings.device.label': 'Label',
	'settings.device.current': 'Current Device',
	'settings.device.currentDesc': "This device's identity",
	'settings.device.editLabel': 'Edit device label',
	'settings.device.knownDevices': 'Known Devices',
	'settings.device.knownDevicesDesc': 'All devices that have been used with this vault.',
	'settings.device.noDevices': 'No devices tracked yet',
	'settings.device.currentTag': '(current)',

	// ---------------------------------------------------------------- 查询代码块
	'query.tasks': 'Tasks',
	'query.loading': 'Loading tasks...',
	'query.systemError': 'System error: {message}.',
	'query.warnings': 'Warnings',
	'query.errorTitle': 'Error in Query',
	'query.warnJsonDeprecated': 'This query is written using JSON. This is deprecated and will be removed in a future version. Please use YAML instead.',
	'query.warnGroupDeprecated': 'The \'group\' field is deprecated and will be removed in a future version. Please use \'groupBy\' instead.',

	// ---------------------------------------------------------------- 桌面登录
	'login.desktopUnavailable': 'Desktop login is not available in this environment.',
	'login.cookieNotFound': 'Could not detect session cookie. Are you signed in?',
	'login.signInThenFinish': 'Please sign in, then click finish or cancel.',

	// ---------------------------------------------------------------- 状态栏
	'status.inbox': 'Inbox',
	'status.noDefaultProject': 'No default Project',

	// ---------------------------------------------------------------- 设置：选项值
	'option.link.noLink': 'No Link',
	'option.link.taskLink': 'Link in Task',
	'option.link.noteLink': 'Link in Description',
	'option.visibility.show': 'Show',
	'option.visibility.hide': 'Hide',
	'option.visibility.hover': 'Show on hover',
} as const;

export type TranslationKey = keyof typeof en;
export default en;
