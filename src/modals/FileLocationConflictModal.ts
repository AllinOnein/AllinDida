import { App, Modal, Setting } from 'obsidian';
import { t } from '@/i18n';

export type FileLocationConflictAction = 'move' | 'delete-misplaced' | 'delete-correct' | 'skip';

export class FileLocationConflictModal extends Modal {
	filePath: string;
	expectedPath: string;
	projectName: string;
	targetExists: boolean;
	result!: FileLocationConflictAction;
	onSubmit: (result: FileLocationConflictAction) => void;
	resolvePromise!: (value: (PromiseLike<FileLocationConflictAction> | FileLocationConflictAction)) => void;

	constructor(app: App, filePath: string, expectedPath: string, projectName: string, targetExists: boolean, onSubmit: (result: FileLocationConflictAction) => void) {
		super(app);
		this.filePath = filePath;
		this.expectedPath = expectedPath;
		this.projectName = projectName;
		this.targetExists = targetExists;
		this.onSubmit = onSubmit;
	}

	/**
	 * Called automatically by the Modal class when modal is opened.
	 */
	onOpen() {
		const { titleEl, contentEl } = this;

		titleEl.setText(t('modal.fileConflict.title'));

		const message =
			t('modal.fileConflict.message', {
				file: this.filePath,
				project: this.projectName,
				expected: this.expectedPath,
			}) + '\n\n' +
			(this.targetExists ? t('modal.fileConflict.mergeWarning') : '');

		contentEl.createEl('p', { text: message });

		new Setting(contentEl).addButton(moveBtn => {
			moveBtn.setClass('ts_button');
			moveBtn.setButtonText(this.targetExists ? t('modal.fileConflict.moveMerge') : t('modal.fileConflict.move'));
			moveBtn.onClick(() => {
				this.result = 'move';
				this.onSubmit(this.result);
				this.close();
			});
		});
		new Setting(contentEl).addButton(deleteBtn => {
			deleteBtn.setClass('ts_button');
			deleteBtn.buttonEl.addClass('mod-destructive');
			deleteBtn.setButtonText(t('modal.fileConflict.deleteMisplaced'));
			deleteBtn.onClick(() => {
				this.result = 'delete-misplaced';
				this.onSubmit(this.result);
				this.close();
			});
		});
		if (this.targetExists) {
			new Setting(contentEl).addButton(deleteBtn => {
				deleteBtn.setClass('ts_button');
				deleteBtn.buttonEl.addClass('mod-destructive');
				deleteBtn.setButtonText(t('modal.fileConflict.deleteCorrect'));
				deleteBtn.onClick(() => {
					this.result = 'delete-correct';
					this.onSubmit(this.result);
					this.close();
				});
			});
		}
		new Setting(contentEl).addButton(skipBtn => {
			skipBtn.setClass('ts_button');
			skipBtn.setButtonText(t('modal.fileConflict.skip'));
			skipBtn.onClick(() => {
				this.result = 'skip';
				this.onSubmit(this.result);
				this.close();
			});
		});
	}

	/**
	 * Called automatically by the Modal class when modal is closed.
	 */
	onClose() {
		this.titleEl.empty();
		this.contentEl.empty();
		super.onClose();
		this.resolvePromise(this.result ?? 'skip');
	}

	public showModal(): Promise<FileLocationConflictAction> {
		this.open();
		return new Promise(
			(resolve) => (this.resolvePromise = resolve)
		);
	}
}
