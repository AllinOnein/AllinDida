import { App, Modal, Setting } from 'obsidian';
import { t } from '@/i18n';


export interface DeletionItem {
	title: string;
	filePath?: string;
}

export class TaskDeletionModal extends Modal {
	items: DeletionItem[] = [];
	result!: boolean;
	reason: string;
	onSubmit: (result: boolean) => void;
	resolvePromise!: (value: (PromiseLike<boolean> | boolean)) => void;

	constructor(app: App, items: DeletionItem[], reason: string, onSubmit: (result: boolean) => void) {
		super(app);
		this.items = items;
		this.reason = reason;

		this.onSubmit = onSubmit;
	}

	/**
	 * Called automatically by the Modal class when modal is opened.
	 */
	onOpen() {
		const { titleEl, contentEl } = this;

		titleEl.setText(t('modal.taskDeletion.title'));

		contentEl.createEl('p', { text: `${t('modal.taskDeletion.message')}${this.reason}` });

		// Group items by filePath
		const unknownFile = t('modal.taskDeletion.unknownFile');
		const groupedItems: Record<string, string[]> = {};
		this.items.forEach(item => {
			const path = item.filePath || unknownFile;
			if (!groupedItems[path]) {
				groupedItems[path] = [];
			}
			groupedItems[path].push(item.title);
		});

		for (const [filePath, titles] of Object.entries(groupedItems)) {
			if (filePath !== unknownFile || Object.keys(groupedItems).length > 1) {
				contentEl.createEl('strong', { text: filePath, attr: { style: 'display: block; margin-top: 10px;' } });
			}
			const unorderedList = contentEl.createEl('ul', { attr: { style: 'margin-top: 5px;' } });
			titles.forEach((title) => {
				unorderedList.createEl('li', { text: title });
			});
		}


		new Setting(contentEl).addButton(cancelBtn => {
			cancelBtn.setClass('ts_button');
			cancelBtn.setButtonText(t('common.cancel'));
			cancelBtn.onClick(() => {
				this.result = false;
				this.onSubmit(this.result);
				this.close();
			});
		})
			.addButton(confirmBtn => {
				confirmBtn.setClass('ts_button');
				confirmBtn.buttonEl.addClass('mod-destructive');
				confirmBtn.setButtonText(t('modal.taskDeletion.confirm'));
				confirmBtn.onClick(() => {
					this.result = true;
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
		this.resolvePromise(this.result);
	}

	public showModal(): Promise<boolean> {
		this.open();
		return new Promise(
			(resolve) => (this.resolvePromise = resolve)
		);
	}
}
