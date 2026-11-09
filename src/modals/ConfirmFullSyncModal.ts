import { App, Modal, Setting } from 'obsidian';
import { t } from '@/i18n';


export class ConfirmFullSyncModal extends Modal {
	result: boolean = false;
	onSubmit: (result: boolean) => void;
	resolvePromise!: (value: (PromiseLike<boolean> | boolean)) => void;

	constructor(app: App, onSubmit: (result: boolean) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	/**
	 * Called automatically by the Modal class when modal is opened.
	 */
	onOpen() {
		const { titleEl, contentEl } = this;

		titleEl.setText(t('modal.fullVaultSync.title'));

		// 每个段落单独成行，与原文的换行排版保持一致。
		const paragraphs = t('modal.fullVaultSync.message').split('\n');
		paragraphs.forEach(message => {
			if (message.trim().length > 0) {
				contentEl.createEl('p', { text: message });
			}
		});

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
				confirmBtn.setButtonText(t('modal.fullVaultSync.confirm'));
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
