import '@/static/styles.css';

import { type Editor, type MarkdownFileInfo, MarkdownView, Notice, Plugin } from 'obsidian';

//settings
import { DEFAULT_SETTINGS, getSettings, mergeDeviceLists, updateSettings } from './settings';

import { TickTickService } from '@/services';
//TickTick api
import { TickTickRestAPI } from '@/services/TicktickRestAPI';
//task parser
import { TaskParser } from './taskParser';
//cache task read and write
//file operation
import { FileOperation } from './fileOperation';

//import modals
import { SetDefaultProjectForFileModal } from './modals/DefaultProjectModal';
import { LatestChangesModal } from './modals/LatestChangesModal';
import { CleanupDeletedTasksModal } from './modals/CleanupDeletedTasksModal';
import { RecoverDeletedTasksModal } from './modals/RecoverDeletedTasksModal';

//import utils
import { isOlder } from './utils/version';
import { NOTABLE_CHANGES } from './notable-changes';
import { TickTickSyncSettingTab } from './ui/settings';
import { MarkdownProcessor } from '@/query/MarkdownProcessor';
import store from '@/store';
import { DateMan } from '@/dateMan';
import { NewFileMap } from '@/services/NewFileMap';

//logging
import log from '@/utils/logger';
//i18n
import { initI18n, t } from '@/i18n';

//database
import { initDB, db } from '@/db/dexie';
import { migrateFromDataJson } from '@/db/migrations';
import type { DeviceInfo } from '@/db/schema';

//NEW: Repository layer
import { FileMetadataService } from '@/repositories/FileMetadataService';
import { TaskRepository } from '@/repositories/TaskRepository';
import { FileTaskQueries } from '@/repositories/FileTaskQueries';
import { TaskCache } from '@/repositories/TaskCache';
import { ProjectGroupRepository } from '@/repositories/ProjectGroupRepository';

//NEW: Service layer
import { ProjectSyncService } from '@/services/ProjectSyncService';
import { EventHandlerService } from '@/services/EventHandlerService';
import { VaultSyncCoordinator } from '@/services/VaultSyncCoordinator';
import { TaskModificationDetector } from '@/services/TaskModificationDetector';
import { TaskDeletionHandler } from '@/services/TaskDeletionHandler';
import { TaskOperationsService } from '@/services/TaskOperationsService';
import { FolderSyncService } from '@/services/FolderSyncService';
import { FolderMigrationService } from '@/services/FolderMigrationService';
import { TagService } from '@/services/TagService';
import { BackupService } from '@/services/BackupService';

export default class TickTickSync extends Plugin {

	readonly service: TickTickService = new TickTickService(this);
	readonly taskParser: TaskParser = new TaskParser(this.app, this);
	readonly fileOperation: FileOperation = new FileOperation(this.app, this);
	readonly fileMetadataService: FileMetadataService = new FileMetadataService();
	readonly dateMan: DateMan = new DateMan();
	readonly tagService: TagService = new TagService();
	readonly backupService: BackupService = new BackupService(this.app, this);

	readonly lastLines: Map<string, number> = new Map(); //lastLine object {path:line} is saved in lastLines map

	//NEW: Repository layer
	taskRepository!: TaskRepository;
	fileTaskQueries!: FileTaskQueries;
	taskCache!: TaskCache;
	projectGroupRepository!: ProjectGroupRepository;

	//NEW: Service layer
	projectSyncService!: ProjectSyncService;
	eventHandlerService!: EventHandlerService;
	vaultSyncCoordinator!: VaultSyncCoordinator;
	taskModificationDetector!: TaskModificationDetector;
	taskDeletionHandler!: TaskDeletionHandler;
	taskOperationsService!: TaskOperationsService;
	folderSyncService!: FolderSyncService;
	folderMigrationService!: FolderMigrationService;

	tickTickRestAPI?: TickTickRestAPI;
	statusBar?: HTMLElement;
	private syncIntervalId?: number;
	private markdownProcessor?: MarkdownProcessor;

	async onload() {
		// 尽早初始化界面语言，保证后续所有 Notice/Modal 都使用同一语言。
		initI18n();
		this.app.workspace.onLayoutReady(async () => {
			await this.waitForObsidianSync();
			await this.pluginLoad();
		});
	}

	/**
	 * If Obsidian Sync is installed and enabled, wait until it finishes
	 * syncing before proceeding with plugin initialization.
	 */
	private async waitForObsidianSync(): Promise<void> {
		const app = this.app as unknown as {
			internalPlugins: { getPluginById(id: string): { enabled: boolean; instance?: unknown } | undefined };
			sync?: { isSyncing?: () => boolean; on?: (event: string, handler: () => void) => void; syncing?: boolean };
		};
		const internalPlugins = app.internalPlugins;
		if (!internalPlugins) return;

		const syncPlugin = internalPlugins.getPluginById('sync');
		if (!syncPlugin?.enabled) return;

		const syncService = app.sync ?? syncPlugin.instance as { isSyncing?: () => boolean; on?: (event: string, handler: () => void) => void; syncing?: boolean };
		if (!syncService) return;

		log.debug('Obsidian Sync detected, waiting for sync to complete...');

		return new Promise<void>((resolve) => {
			const isSyncing = (): boolean => {
				try {
					const fn = syncService.isSyncing;
					return typeof fn === 'function' ? fn() : (fn ?? syncService.syncing ?? false);
				} catch {
					return false;
				}
			};

			if (!isSyncing()) {
				log.debug('Obsidian Sync already idle, proceeding.');
				resolve();
				return;
			}

			const poll = () => {
				if (!isSyncing()) {
					log.debug('Obsidian Sync finished, proceeding.');
					resolve();
					return;
				}
				window.setTimeout(poll, 500);
			};
			poll();

			try {
				if (typeof syncService.on === 'function') {
					syncService.on('status-change', () => {
						if (!isSyncing()) {
							resolve();
						}
					});
				}
			} catch {
				// event listener not available, polling alone is fine
			}
		});
	}

	reloadInterval() {
		if (this.syncIntervalId) {
			window.clearInterval(this.syncIntervalId);
			this.syncIntervalId = undefined;
		}
		const timeout = getSettings().automaticSynchronizationInterval * 1000;
		if (timeout === 0) {
			return;
		}
		this.syncIntervalId = this.registerInterval(
			window.setInterval(() => { void this.scheduledSynchronization(); }, timeout)
		);
	}

	// Configure logging.
	// reloadLogging() {
	// 	const options: LogOptions = {
	// 		minLevels: {
	// 			'': getSettings().logLevel,
	// 			ticktick: getSettings().logLevel
	// 		}
	// 	};
	// 	logging.configure(options);
	// }

	onunload() {
		super.onunload();
		// registerInterval handles cleanup of syncIntervalId automatically
		//NEW: Cleanup event handler
		this.eventHandlerService?.cleanup();
		//NEW: Clear cache
		this.taskCache?.clear();
		log.debug(`TickTickSync unloaded!`);
	}

	async loadSettings() {
		try {
			let data = await this.loadData() as Record<string, unknown> | null;
			if (!data) {
				data = { version: this.manifest.version };
				await this.saveData(data);
			}
			try {
				data = await this.migrateData(data);
			} catch (error) {
				log.error('Failed to migrate data:', error);
				return false; // Returning false indicates that the setting loading failed
			}
			if (data?.TickTickTasksData) {
				// Old data migration is handled by initDB
			}
			const settings = Object.assign({}, DEFAULT_SETTINGS, data);
			updateSettings(settings);
		} catch (error) {
			log.error('Failed to load data:( ' + String(error) + ')');
			return false; // Returning false indicates that the setting loading failed
		}
		return true; // Returning true indicates that the settings are loaded successfully
	}

	/** Last payload written to `data.json`, used to skip redundant disk writes. */
	private lastSavedSettingsJson?: string;
	/** Serializes `saveSettings` calls so writes cannot interleave. */
	private saveSettingsChain: Promise<void> = Promise.resolve();

	/**
	 * Build the exact object that gets persisted to `data.json`.
	 *
	 * Large blobs live in Dexie now, so they are stripped here. Keeping this in
	 * one place lets {@link saveSettings} compare payloads reliably.
	 */
	private buildSettingsPayload(): Record<string, unknown> | null {
		const inMemorySettings = getSettings();
		if (!inMemorySettings || Object.keys(inMemorySettings).length === 0) {
			return null;
		}
		const payload = { ...inMemorySettings } as Record<string, unknown>;
		delete payload.fileMetadata;
		delete payload.TickTickTasksData;
		delete payload.__migratedDBData;
		return payload;
	}

	/**
	 * Persist settings to `data.json`.
	 *
	 * Calls are serialized and a write that would not change the file is
	 * skipped. This matters for vaults stored in a synchronised folder: the
	 * plugin used to rewrite `data.json` on every sync cycle even when nothing
	 * but the (Dexie-owned) checkpoint had moved, which produced constant
	 * uploads and occasional conflict copies.
	 */
	async saveSettings(): Promise<void> {
		this.saveSettingsChain = this.saveSettingsChain.then(() => this.writeSettings());
		return this.saveSettingsChain;
	}

	private async writeSettings(): Promise<void> {
		try {
			const settingsToSave = this.buildSettingsPayload();
			// Verify that the setting exists and is not empty
			if (!settingsToSave) {
				log.warn('Settings are empty or invalid, not saving to avoid data loss.');
				return;
			}

			// Defensive merge: on-disk data.json may have been updated by
			// another device via Obsidian Sync. Merge devices so that entries
			// added by other instances are not lost.
			try {
				const onDiskData = await this.loadData() as Record<string, unknown> | null;
				if (onDiskData?.devices && Array.isArray(onDiskData.devices)) {
					const merged = mergeDeviceLists(
						onDiskData.devices as DeviceInfo[],
						settingsToSave.devices as DeviceInfo[] || []
					);
					settingsToSave.devices = merged;
					getSettings().devices = merged;
				}
			} catch (e) {
				log.warn('Could not read on-disk settings for device merge', e);
			}

			const serialized = JSON.stringify(settingsToSave);
			if (serialized === this.lastSavedSettingsJson) {
				log.debug('Settings unchanged, skipping data.json write.');
				return;
			}

			await this.saveData(settingsToSave);
			this.lastSavedSettingsJson = serialized;
		} catch (error) {
			//Print or handle errors
			log.error('Error saving settings:', error);
		}
	}

	// return true of false
	async initializePlugin(): Promise<boolean> {
		if (!getSettings().token) {
			new Notice(t('startup.pleaseLogin'));
			return false;
		}

		// Load Dexie first as it's the source of truth
		await initDB();

		// Read the sync meta before the first synchronization so the startup
		// sync can run incrementally once this vault has synced before.
		this.lastSyncMeta = await db.meta.get('sync');

		//NEW: Initialize repositories
		this.taskRepository = new TaskRepository();
		this.fileTaskQueries = new FileTaskQueries();
		this.taskCache = new TaskCache();
		this.projectGroupRepository = new ProjectGroupRepository();

		//NEW: Initialize services
		this.projectSyncService = new ProjectSyncService(this.app, this);
		this.folderSyncService = new FolderSyncService(this.app, this, this.projectGroupRepository);
		this.projectSyncService.setFolderSyncService(this.folderSyncService);
		this.folderMigrationService = new FolderMigrationService(this.app, this.folderSyncService);
		this.vaultSyncCoordinator = new VaultSyncCoordinator(this.app, this, this.folderSyncService);
		this.taskModificationDetector = new TaskModificationDetector(this.app, this, this.folderSyncService);
		this.taskDeletionHandler = new TaskDeletionHandler(this.app, this);
		this.taskOperationsService = new TaskOperationsService(this.app, this);

		// Device ID and Label are now managed in the DB and loaded into memory during initDB
		// They are no longer stored in settings to prevent sync conflicts
		await this.tagService.loadFromDb();
		const isProjectsSaved = await this.saveProjectsToCache();
		if (!isProjectsSaved) {// invalid token or offline?
			this.tickTickRestAPI = undefined;
			new Notice(t('startup.initFailed'));
			return false;
		}

		this.initializeModuleClass();
		// Back up TickTick data before each startup, but only when the user opted
		// in. The export is a full dump and TickTick rate-limits it, so it must
		// not run unconditionally; failures are logged, never fatal.
		if (getSettings().backupOnStartup) {
			await this.backupService.backupTickTickData({ quiet: true });
		}
		//And now load the DB and sync it.
		await this.service.synchronization(!this.hasCompletedInitialSync());

		await this.autoCleanupDeletedTasks();

		new Notice(t('startup.loaded'));
		return true;
	}

	initializeModuleClass() {
		// log.debug("initializeModuleClass")
		//initialize TickTick restapi
		if (!this.tickTickRestAPI) {
			// log.debug("API wasn't inited?")
			this.tickTickRestAPI = new TickTickRestAPI(this.app, this, null);
		}
	}

	async lineNumberCheck(): Promise<boolean> {
		const markDownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!markDownView) {
			return false;
		}

		const cursor = markDownView?.editor.getCursor();
		const line = cursor?.line;
		//const lineText = view.editor.getLine(line)
		//log.debug(line)
		//const fileName = view.file?.name
		const file = markDownView?.app.workspace.activeEditor?.file;
		const fileName = file?.name;
		const filepath = file?.path;

		if (typeof this.lastLines === 'undefined' || typeof this.lastLines.get(fileName as string) === 'undefined') {
			this.lastLines.set(fileName as string, line);
			return false;
		}

		//log.debug(`filename is ${fileName}`)
		if (this.lastLines.has(fileName as string) && line !== this.lastLines.get(fileName as string)) {
			const lastLine = this.lastLines.get(fileName as string);
			// if (this.settings.debugMode) {
			// 	log.debug('Line changed!', `current line is ${line}`, `last line is ${lastLine}`);
			// }

			//Perform the operation you want
			const lastLineText = markDownView.editor.getLine(lastLine as number);
			// log.debug(lastLineText)
			if (!(this.checkModuleClass())) {
				return false;
			}
			this.lastLines.set(fileName as string, line);

			return await this.service.lineModifiedTaskCheck(filepath as string, lastLineText, lastLine as number);
		} else {
			//log.debug('Line not changed');
		}
		return false;
	}

	async checkboxEventhandler(evt: MouseEvent, editor: Editor) {
		const target = evt.target as HTMLInputElement;
		const bOpenTask = target.checked;

		if (!target.classList.contains('task-list-item-checkbox')) {
			return;
		}

		if (editor) {
			const mouse = (editor as unknown as { posAtMouse(evt: MouseEvent): { line: number; ch: number } }).posAtMouse(evt);
			const line = mouse.line; // Line where the click occurred
			const clickedText = editor.getLine(line); // Get the text at the clicked line
			if (this.taskParser.isMarkdownTask(clickedText)) {
				const taskId = this.taskParser.getTickTickId(clickedText);
				if (taskId) {
					if (bOpenTask) {
						await this.service.closeTask(taskId);
					} else {
						await this.service.openTask(taskId);
					}
				} else {
					const itemID = this.taskParser.getLineItemId(clickedText);
					if (itemID) {
						const markDownView = this.app.workspace.getActiveViewOfType(MarkdownView);
						if (markDownView?.file) {
							const fileMap = new NewFileMap(this.app, this, markDownView.file);
							await fileMap.init();
							await this.service.tickTickSync.handleTaskItem(clickedText, fileMap, line);
						}
					}
				}
			}
		}
	}


	//return true
	checkModuleClass() {
		if (!getSettings().token) {
			new Notice(t('startup.pleaseLogin'));
			return false;
		}

		if (!this.service.initialized) {
			this.service.initialize();
		}
		if (this.tickTickRestAPI === undefined) {
			this.initializeModuleClass();
		}
		return true;
	}

	async setStatusBarText() {
		const markDownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!markDownView || !markDownView.file) {
			this.statusBar?.setText('');
			return;
		}

		const filepath = markDownView.file.path;
		let defaultProjectName = await this.fileMetadataService.getDefaultProjectNameForFilepath(filepath);
		if (!defaultProjectName) {
			// 文件名以 Inbox 开头视为收集箱；注意这里只影响状态栏显示文案。
			if (filepath.startsWith('Inbox')) {
				defaultProjectName = t('status.inbox');
			} else {
				defaultProjectName = t('status.noDefaultProject');
			}
		}
		this.statusBar?.setText(defaultProjectName);

	}

	async scheduledSynchronization(fullSync: boolean = false) {
		if (!this.checkModuleClass()) {
			return;
		}

		await this.waitForObsidianSync();

		try {
			await this.service.synchronization(fullSync);
			await this.autoCleanupDeletedTasks();
		} catch (error) {
			log.error('An error occurred: ', error);
			new Notice(t('startup.error', { message: String(error) }));
		}
	}

	async autoCleanupDeletedTasks() {
		try {
			const days = getSettings().deletedTaskRetentionDays;
			const purged = await this.taskRepository.purgeOldDeletedTasks(days);
			if (purged > 0) {
				log.info(`Auto-cleanup: purged ${purged} deleted task(s) older than ${days} day(s).`);
			}
		} catch (error) {
			log.error('Auto-cleanup error:', error);
		}
	}

	/**
	 * Whether this database has already completed a full sync at least once.
	 *
	 * A first run has no checkpoint, so it must pull everything. Every later
	 * startup can resume from the delta checkpoint instead of re-downloading the
	 * entire task list on each launch.
	 */
	hasCompletedInitialSync(): boolean {
		const meta = this.lastSyncMeta;
		if (!meta) return false;
		return (meta.lastFullSync ?? 0) > 0 || (meta.lastDeltaSync ?? 0) > 0;
	}

	/** Snapshot of the sync meta read during `initializePlugin`, used for startup sync decisions. */
	private lastSyncMeta?: { lastFullSync?: number; lastDeltaSync?: number };


	// async oldCheckboxEventhandle(evt: MouseEvent) {
	// 	if (!(this.checkModuleClass())) {
	// 		return;
	// 	}
	//
	//
	// 	const target = evt.target as HTMLInputElement;
	// 	const bOpenTask = target.checked;
	// 	log.debug('Second: Checked: ', bOpenTask);
	//
	// 	//This breaks for subtasks if Tasks is installed. See: https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/2685
	// 	//hence the else.
	// 	const taskElement = target.closest('div');
	// 	if (taskElement) {
	// 		const taskLine = taskElement.textContent;
	// 		const taskId = this.taskParser?.getTickTickId(taskLine);
	// 		if (taskId) {
	// 			// let task = this.taskParser?.convertTextToTickTickTaskObject(tas)
	// 			if (bOpenTask) {
	// 				log.debug('it\'s open, close it.');
	// 				this.tickTickSync?.closeTask(taskId);
	// 			} else {
	// 				log.debug('it\'s closed, open it.');
	// 				this.tickTickSync?.reopenTask(taskId);
	// 			}
	// 		}
	// 	} else {
	// 		log.debug('#### TickTick_id not found -- do it the hard way.');
	// 		//Start full-text search and check status updates
	// 		try {
	// 			log.debug('#### Full text modified??');
	// 			let file = this.app.workspace.getActiveFile();
	// 			let filePath = null;
	// 			if (file instanceof TFile) {
	// 				filePath = file.path;
	// 			}
	//
	// 			if (!await this.checkAndHandleSyncLock()) return;
	// 			await this.tickTickSync?.fullTextModifiedTaskCheck(filePath);
	// 			await this.unlockSynclock();
	// 		} catch (error) {
	// 			log.error(`An error occurred while check modified tasks in the file: ${error}`);
	// 			await this.unlockSynclock();
	//
	// 		}
	// 	}
	// }

	async saveProjectsToCache(): Promise<boolean> {
		if (!this.checkModuleClass()) {
			return false;
		}
		let result = false;
		const startTime = performance.now();
		log.debug(`TickTick saveProjectsToCache started at ${new Date().toLocaleString()}`);
		try {
			result = !!(await this.service.saveProjectsToCache());
		} catch (error) {
			log.error(`An error in saveProjectsToCache occurred:( ${String(error)}`);
			new Notice(t('sync.databaseCheckError', { message: String(error) }));
		}
		const endTime = performance.now();
		log.debug(`TickTick saveProjectsToCache completed at ${new Date().toLocaleString()}, took ${(endTime - startTime).toFixed(2)} ms`);
		return result;
	}

	private async pluginLoad() {
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TickTickSyncSettingTab(this.app, this));

		const isSettingsLoaded = await this.loadSettings();
		if (!isSettingsLoaded) {
			new Notice(t('startup.settingsFailed'));
			return;
		}
		log.setLevel(getSettings().logLevel as 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent')
		log.info(`loading plugin "${this.manifest.name}" v${this.manifest.version}`);



		let initialized = false;
		try {
			updateSettings({vaultName: this.app.vault.getName()});
			initialized = await this.initializePlugin();
		} catch (error) {
			log.error('API Initialization Failed.( ' + String(error) + ')');
		}

		if (initialized) {
			this.reloadInterval();
		} else {
			// Initialization failed (no token, bad credentials, offline first run).
			// Registering the periodic sync anyway would make every tick fail the
			// same way; the login flow restarts it once the user is authenticated.
			log.warn('TickTickSync initialization did not complete: automatic sync stays disabled.');
		}

		store.service.set(this.service);
		this.markdownProcessor = new MarkdownProcessor(this);
		this.markdownProcessor.activate();


		this.addRibbonIcon('sync', t('settings.pageName'), async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			await this.synchronizeNow();
		});

		// //Used for testing adhoc code.
		// this.addRibbonIcon('check', 'Tts test', async (evt: MouseEvent) => {
		// 	// Nothing to see here right now.
		// 	const vaultId = this.app.vault.getName();
		// 	log.debug(`Vault ID: ${vaultId}`);
		// 	this.dumpDB();
		// });

		//Used for testing adhoc code.
		// this.addRibbonIcon('dice', 'Tts test 2', async (evt: MouseEvent) => {
		// 	// Nothing to see here right now.
		// 	// for (const file of this.app.vault.getMarkdownFiles()) {
		// 	// 	if (file.path.includes("List 1")) {
		// 	// 		const fileMap = new NewFileMap(this.app, this, file);
		// 	// 		await fileMap.init();
		// 	// 		const taskRecord = fileMap.getTaskRecord("6a08733c9086963234d145a5")
		// 	// 		const taskItems = fileMap.getTaskItems("6a08733c9086963234d145a5")
		// 	// 		log.debug("record", taskRecord)
		// 	// 		log.debug("items", taskItems)
		// 	// 	}
		// 	// }
		// 	// Example Usage inside a command or event:
		// 	// const targetFolder = 'Folder 1';
		// 	//
		// 	// // Get every file in the vault and filter by path prefix
		// 	// const allFilesInFolder = this.app.vault.getFiles().filter(file =>
		// 	// 	file.path.startsWith(targetFolder + '/')
		// 	// );
		// 	//
		// 	// for (const file of allFilesInFolder) {
		// 	// 	const activeFile = this.app.vault.getFileByPath(file)
		// 	// 	const tasks = await getTasksWithChildren(activeFile, this.app);
		// 	// 	// const fm = new NewFileMap(this.app, this, activeFile);
		// 	// 	// await fm.init();
		// 	// 	// const tasks = fm.getTasks();
		// 	//
		// 	// 	log.debug("In File: ", file.name, "\nStructured Tasks:\n", JSON.stringify(tasks,null, 4));
		// 	// }
		// 	generateDeviceId();
		//
		//
		// });


		this.registerEvents();

		// set default project for TickTick task in the current file
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'tts-default-project-for-file',
			name: t('command.setDefaultProject'),
			editorCallback: (editor: Editor, view: MarkdownView | MarkdownFileInfo) => {
				if (!view || !view.file) {
					new Notice(t('task.noActiveFile'));
					return;
				}
				const filepath = view.file.path;
				new SetDefaultProjectForFileModal(this.app, this, filepath);
			}
		});
		this.addCommand({
			id: 'tts-sync',
			name: t('command.sync'),
			callback: async () => {
				await this.synchronizeNow();
			}
		});

		this.addCommand({
			id: 'tts-delete-permanent',
			name: t('command.deletePermanent'),
			callback: async () => {
				const deletedTasks = await this.taskRepository.getDeletedTasks();
				if (deletedTasks.length === 0) {
					new Notice(t('task.noDeletedFound'));
					return;
				}
				const modal = new CleanupDeletedTasksModal(this.app, deletedTasks);
				const selected = await modal.showModal();
				if (selected.length > 0) {
					await this.taskRepository.hardDeleteTasks(selected);
					new Notice(t('task.permanentlyDeleted', { count: selected.length }));
				}
			}
		});

		this.addCommand({
			id: 'tts-recover-tasks',
			name: t('command.recoverTasks'),
			callback: async () => {
				const deletedTasks = await this.taskRepository.getDeletedTasks();
				if (deletedTasks.length === 0) {
					new Notice(t('task.noDeletedFound'));
					return;
				}
				const modal = new RecoverDeletedTasksModal(this.app, this, deletedTasks);
				await modal.showModal();
			}
		});

		//display default project for the current file on status bar
		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		this.statusBar = this.addStatusBarItem();
	}

	private async synchronizeNow() {
		await this.scheduledSynchronization();
		new Notice(t('sync.completed'));
	}

	private registerEvents() {
		//NEW: Use EventHandlerService to manage all event registration
		this.eventHandlerService = new EventHandlerService(this.app, this);
		this.eventHandlerService.registerAll();
	}

	private async migrateData(data: Record<string, unknown>): Promise<Record<string, unknown>> {
		if (!data) return data;

		//We're going to handle data structure conversions here.
		//NB: The version that goes in the literal is the current version.
		if ((!data.version) || (isOlder(data.version as string, '1.0.10'))) {
			//get rid of username and password. we don't need them no more.
			delete data.username;
			delete data.password;
		}
		if ((!data.version) || (isOlder(data.version as string, '1.0.36'))) {
			//default to AND because that's what we used to do:
			data.tagAndOr = 1;
		}

		//BIG Change. BIG I tell you!
		if ((!data.version) || isOlder(data.version as string, '2.0.0')) {
			log.debug('Entering 1.1.17 migration block');
			// Migrate from legacy data.json repository to Dexie-based repository
			data.__migratedDBData = migrateFromDataJson(data);
			log.debug('migrateFromDataJson completed');
		}
		if ((!data.version) || (isOlder(data.version as string, '2.0.5'))) {
			log.debug('Entering 2.0.5 migration block');
			// New in 2.0.5: opt-in settings for the "#ticktick" control tag.
			// Historically the plugin force-injected "ticktick" onto every
			// synced task's TickTick tags. Default off (false) preserves the
			// legacy behavior for existing installs.
			data.stopInjectingTickTickTag = false;
			data.stripTickTickTagOnReset = false;
		}

		// New in 2.1.0: startup backups became opt-in (`backupOnStartup`) and
		// exports are pruned to `backupRetentionCount`. The old `skipBackup`
		// flag only ever described the previous automatic behaviour, and the
		// files it produced were never read back by the plugin, so existing
		// installs default to "no startup backup" and keep the flag ignored.
		if (data.backupOnStartup === undefined) {
			data.backupOnStartup = false;
		}
		if (data.backupRetentionCount === undefined) {
			data.backupRetentionCount = DEFAULT_SETTINGS.backupRetentionCount;
		}

		//Build notable changes from the single source of truth
		const notableChanges: string[][] = [];
		const currentVersion = (data.version as string) || '0.0.0';
		for (const change of NOTABLE_CHANGES) {
			if (!data.version || isOlder(currentVersion, change.version)) {
				notableChanges.push([change.title, change.description, change.anchor]);
			}
		}

		if (notableChanges.length > 0) {
			log.debug('Calling LatestChangesModal with', notableChanges.length, 'items');
			await this.LatestChangesModal(notableChanges);
			log.debug('LatestChangesModal returned');
		} else {
			log.debug('Skipping LatestChangesModal - no notable changes');
		}

		//Update the version number. It will save me headaches later.

		if ((!data.version) || (isOlder(data.version as string, this.manifest.version))) {
			log.debug('Updating version number to ', this.manifest.version);
			data.version = this.manifest.version;
			await this.saveSettings();
		}

		return data;
	}

	private async LatestChangesModal(notableChanges: string[][]) {
		return await new Promise<boolean>(resolve => {
			const myModal = new LatestChangesModal(this.app, notableChanges, (result) => {
				resolve(result);
			});
			myModal.open();
		});

	}
	private dumpDB() {
		let dbName = (getSettings().vaultName || '')  + "TickTickSync";
		const request = indexedDB.open(dbName);

		request.onsuccess = async (event) => {
			const db = (event.target as EventTarget & { result: IDBDatabase }).result;
			const storeNames = Array.from(db.objectStoreNames);
			const exportData: Record<string, unknown> = {};

			// Process all stores
			for (const storeName of storeNames) {
				exportData[storeName] = await new Promise((resolve) => {
					const transaction = db.transaction([storeName], "readonly");
					const store = transaction.objectStore(storeName);
					const allItems = store.getAll();

					allItems.onsuccess = () => resolve(allItems.result);
					allItems.onerror = () => resolve([]); // Handle empty/error stores
				});
			}

			// Create and download JSON file
			const jsonString = JSON.stringify(exportData, null, 2);
			const blob = new Blob([jsonString], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = createEl("a");

			a.href = url;
			a.download = `${dbName}_full_dump.json`;
			a.click();

			URL.revokeObjectURL(url);
			log.debug(`Exported ${storeNames.length} stores to ${dbName}_full_dump.json`);
			db.close();
		};

		request.onerror = (e: Event) => console.error("Database failed to open:", (e.target as IDBRequest)?.error);

	}


}




