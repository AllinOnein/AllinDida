import { App, Modal, Setting } from 'obsidian';
import { t } from '@/i18n';

export interface OrphanItem {
	title: string;
	filePath?: string;
	projectName?: string;
}

export type OrphanAction = 'add' | 'delete' | 'cancel';

export class OrphanTaskModal extends Modal {
	items: OrphanItem[] = [];
	action: OrphanAction = 'cancel';
	resolvePromise!: (value: OrphanAction) => void;

	constructor(app: App, items: OrphanItem[]) {
		super(app);
		this.items = items;
	}

	onOpen() {
		const { titleEl, contentEl } = this;

		titleEl.setText(t('modal.orphan.title'));

		contentEl.createEl('p', { text: t('modal.orphan.message') });

		const unknownLabel = t('common.unknown');
		const groupedItems: Record<string, string[]> = {};
		this.items.forEach(item => {
			const group = item.filePath || item.projectName || unknownLabel;
			if (!groupedItems[group]) {
				groupedItems[group] = [];
			}
			groupedItems[group].push(item.title);
		});

		for (const [group, titles] of Object.entries(groupedItems)) {
			if (group !== unknownLabel || Object.keys(groupedItems).length > 1) {
				contentEl.createEl('strong', { text: group, attr: { style: 'display: block; margin-top: 10px;' } });
			}
			const unorderedList = contentEl.createEl('ul', { attr: { style: 'margin-top: 5px;' } });
			titles.forEach((title) => {
				unorderedList.createEl('li', { text: title });
			});
		}

		contentEl.createEl('hr');

		contentEl.createEl('p', { text: t('modal.orphan.chooseAction'), attr: { style: 'margin-bottom: 10px;' } });

		new Setting(contentEl)
			.addButton(cancelBtn => {
				cancelBtn.setClass('ts_button');
				cancelBtn.setButtonText(t('modal.orphan.skip'));
				cancelBtn.onClick(() => {
					this.action = 'cancel';
					this.close();
				});
			})
			.addButton(deleteBtn => {
				deleteBtn.setClass('ts_button');
				deleteBtn.buttonEl.addClass('mod-destructive');
				deleteBtn.setButtonText(t('modal.orphan.delete'));
				deleteBtn.onClick(() => {
					this.action = 'delete';
					this.close();
				});
			})
			.addButton(addBtn => {
				addBtn.setClass('ts_button');
				addBtn.setCta();
				addBtn.setButtonText(t('modal.orphan.add'));
				addBtn.onClick(() => {
					this.action = 'add';
					this.close();
				});
			});
	}

	onClose() {
		this.titleEl.empty();
		this.contentEl.empty();
		super.onClose();
		this.resolvePromise(this.action);
	}

	public showModal(): Promise<OrphanAction> {
		this.open();
		return new Promise((resolve) => (this.resolvePromise = resolve));
	}
}
