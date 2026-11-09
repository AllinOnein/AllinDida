import { App, Modal, Notice, Setting } from 'obsidian';
import type TickTickSync from '@/main';
import type { LocalTask } from '@/db/schema';
import log from '@/utils/logger';
import { t } from '@/i18n';

export class RecoverDeletedTasksModal extends Modal {
	private plugin: TickTickSync;
	private items: LocalTask[] = [];
	private resolvePromise!: (value: boolean) => void;

	constructor(app: App, plugin: TickTickSync, tasks: LocalTask[]) {
		super(app);
		this.plugin = plugin;
		this.items = [...tasks];
	}

	onOpen() {
		const { titleEl, contentEl } = this;

		titleEl.setText(t('modal.recover.title'));

		contentEl.createEl('p', { text: t('modal.recover.intro') });

		if (this.items.length === 0) {
			contentEl.createEl('p', { text: t('task.noDeletedFound') });
			new Setting(contentEl).addButton(btn => {
				btn.setButtonText(t('common.close'));
				btn.onClick(() => {
					this.resolvePromise(false);
					this.close();
				});
			});
			return;
		}

		const listEl = contentEl.createDiv({ attr: { style: 'max-height: 450px; overflow-y: auto; margin-bottom: 10px;' } });

		this.items.forEach((localTask) => {
			const task = localTask;
			const title = task.task.title || t('modal.recover.untitled');
			const originalFile = task.file || t('modal.recover.noFile');
			const deletedAt = new Date(task.updatedAt).toLocaleDateString();

			const section = listEl.createDiv({ attr: { style: 'border: 1px solid var(--background-modifier-border); border-radius: 6px; padding: 8px; margin-bottom: 8px;' } });

			section.createEl('strong', { text: title.length > 80 ? title.substring(0, 80) + '...' : title });

			const meta = section.createDiv({ attr: { style: 'font-size: 0.85em; color: var(--text-muted); margin: 4px 0;' } });
			meta.setText(t('modal.recover.meta', { file: originalFile, date: deletedAt }));

			const btnDiv = section.createDiv({ attr: { style: 'display: flex; gap: 6px; margin-top: 6px;' } });

			const recoverBtn = btnDiv.createEl('button', {
				text: t('modal.recover.toOriginal'),
				attr: { style: 'padding: 4px 8px; cursor: pointer;' }
			});
			recoverBtn.className = 'ts_button';
			recoverBtn.addEventListener('click', () => {
				this.recoverTask(task, task.file || undefined)
					.then(() => this.removeItem(task, section))
					.catch((e: unknown) => new Notice(t('task.recoveryFailed', { message: (e as Error).message })));
			});

			const customBtn = btnDiv.createEl('button', {
				text: t('modal.recover.toOther'),
				attr: { style: 'padding: 4px 8px; cursor: pointer;' }
			});
			customBtn.className = 'ts_button';
			customBtn.addEventListener('click', () => {
				const fileInput = section.createEl('input', {
					attr: {
						type: 'text',
						placeholder: t('modal.recover.pathPlaceholder'),
						style: 'width: 100%; margin-top: 6px; padding: 4px; box-sizing: border-box;'
					}
				});
				fileInput.value = task.file || '';

				const confirmCustom = section.createEl('button', {
					text: t('modal.recover.confirmRecovery'),
					attr: { style: 'padding: 4px 8px; margin-top: 4px; cursor: pointer;' }
				});
				confirmCustom.className = 'ts_button';
				confirmCustom.addEventListener('click', () => {
					const targetPath = fileInput.value.trim();
					if (!targetPath) {
						new Notice(t('task.enterValidPath'));
						return;
					}
					this.recoverTask(task, targetPath)
						.then(() => this.removeItem(task, section))
						.catch((e: unknown) => new Notice(t('task.recoveryFailed', { message: (e as Error).message })));
				});

				customBtn.remove();
			});
		});

		new Setting(contentEl).addButton(cancelBtn => {
			cancelBtn.setButtonText(t('common.close'));
			cancelBtn.onClick(() => {
				this.resolvePromise(false);
				this.close();
			});
		});
	}

	private async recoverTask(localTask: LocalTask, targetFile?: string) {
		const filePath = targetFile || localTask.file;
		if (!filePath) {
			throw new Error('No target file specified for recovery.');
		}

		// 1. Mark as not deleted in DB
		await this.plugin.taskRepository.recoverTask(localTask.taskId, filePath);

		// 2. Write task back to file and update TickTick
		const task = { ...localTask.task };
		task.modifiedTime = this.plugin.dateMan?.formatDateToISO(new Date()) || new Date().toISOString();

		const success = await this.plugin.fileOperation.synchronizeToVault(filePath, [task], false);
		if (!success) {
			log.warn(`File sync may have failed for recovered task ${localTask.taskId}`);
		}

		new Notice(t('task.recoveredTo', { path: filePath }));
	}

	private removeItem(localTask: LocalTask, sectionEl: HTMLDivElement) {
		const idx = this.items.indexOf(localTask);
		if (idx !== -1) this.items.splice(idx, 1);
		sectionEl.remove();
		if (this.items.length === 0) {
			new Notice(t('task.allRecovered'));
			this.resolvePromise(true);
			this.close();
		}
	}

	onClose() {
		this.titleEl.empty();
		this.contentEl.empty();
		super.onClose();
	}

	public showModal(): Promise<boolean> {
		this.open();
		return new Promise((resolve) => (this.resolvePromise = resolve));
	}
}
