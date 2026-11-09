import { App, Component, MarkdownRenderer, Modal, Setting } from 'obsidian';
import { t } from '@/i18n';


export class LatestChangesModal extends Modal {
	message = '';
	result = false;
	notableChanges: string[][];
	onSubmit: (result: boolean) => void;
	resolvePromise!: (value: (PromiseLike<boolean> | boolean)) => void;
	private renderComponent!: Component;


	constructor(app: App, notableChanges: string[][], onSubmit: (result: boolean) => void) {
		super(app);
		this.notableChanges = notableChanges;
		this.onSubmit = onSubmit;
	}

	/**
	 * Called automatically by the Modal class when modal is opened.
	 */
	onOpen() {
		this.renderComponent = new Component();
		this.renderComponent.load();
		let { titleEl, contentEl } = this;
		titleEl.setText(t('modal.latestChanges.title'));

		// 这里是衍生版本：不再展示原作者的赞助入口，改为说明本项目来源。
		let tipEl = contentEl.createDiv({ cls: 'callout', attr: { 'data-callout': 'info' } });
		let calloutTitle = tipEl.createDiv({ cls: 'callout-title' });
		calloutTitle.createDiv({ cls: 'callout-icon' });
		calloutTitle.createDiv({ cls: 'callout-title-inner', text: t('modal.latestChanges.forkTitle') });
		let calloutContent = tipEl.createDiv({ cls: 'callout-content' });
		let p = calloutContent.createEl('p');
		p.setText(t('modal.latestChanges.forkNotice'));

		let p1 = contentEl.createEl('p');
		p1.setText(t('modal.latestChanges.intro'));
		let p2 = contentEl.createEl('p');
		p2.createEl('strong', { text: t('modal.latestChanges.strongly') });
		p2.appendText(t('modal.latestChanges.backupAdvice'));
		let changesText = contentEl.createEl('ol');
		// 本仓库没有搭建文档站：只展示变更标题，不再外链到原作者的英文文档。
		this.notableChanges.forEach(notableChange => {
			let lineItem = changesText.createEl('li');
			lineItem.createEl('strong', { text: notableChange[0] });
			let holder = lineItem.createEl('ol');
			const changeLines = notableChange[1].split('\n');
			changeLines.forEach(line => {
				const div = holder.createDiv();
				void MarkdownRenderer.render(this.app, line, div, '', this.renderComponent);
			})
		});

		new Setting(contentEl)
			.addButton(confirmBtn => {
				confirmBtn.setClass('ts_button');
				confirmBtn.buttonEl.addClass('mod-destructive');
				confirmBtn.setButtonText(t('modal.latestChanges.gotIt'));
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
		this.renderComponent.unload();
		this.titleEl.empty();
		this.contentEl.empty();
		super.onClose();
		if (this.resolvePromise) {
			this.resolvePromise(this.result);
		}
	}

	public showModal(): Promise<boolean> {
		this.open();
		return new Promise(
			(resolve) => (this.resolvePromise = resolve)
		);
	}
}
