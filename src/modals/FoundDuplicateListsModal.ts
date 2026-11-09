import { App, Modal, Setting } from 'obsidian';
import TickTickSync from '@/main';
import { getSettings } from '@/settings';
import type { IProject } from '@/api/types/Project';
import { t } from '@/i18n';


export class FoundDuplicateListsModal extends Modal {
	message: string;
	projects: IProject[] = [];
	result!: boolean;
	onSubmit: (result: boolean) => void;
	resolvePromise!: (value: (PromiseLike<boolean> | boolean)) => void;
	private plugin: TickTickSync;

	constructor(app: App, plugin: TickTickSync, projects: IProject[], onSubmit: (result: boolean) => void) {
		super(app);
		this.plugin = plugin;
		this.projects = projects;
		// 文案在构造时按当前语言拼好，{baseURL} 由 t() 替换。
		this.message = t('modal.duplicateLists.message', { baseURL: getSettings().baseURL });
		this.onSubmit = onSubmit;
	}

	/**
	 * Called automatically by the Modal class when modal is opened.
	 */
	onOpen() {
		const { titleEl, contentEl } = this;

		titleEl.setText(t('modal.duplicateLists.title'));

		contentEl.createEl('p', { text: `${this.message}` });
		// const unorderedList = contentEl.createEl('ul');
		// this.projects.forEach((project) => {unorderedList.createEl('li', {text: `${project.id} \t ${project.name}`})})

		const projectsTable = contentEl.createEl('table', 'projects-table');
		const projectsTableHead = projectsTable.createEl('thead');
		const projectsTableHeadRow = projectsTableHead.createEl('tr');
		const projectsTableHeadRowName = projectsTableHeadRow.createEl('th');
		const projectsTableHeadRowName2 = projectsTableHeadRow.createEl('th');
		projectsTableHeadRowName.setText(t('modal.duplicateLists.projectName'));
		projectsTableHeadRowName2.setText(t('modal.duplicateLists.projectId'));
		const projectsTableBody = projectsTable.createEl('tbody');

		this.projects.forEach((project) => {
			const row = projectsTableBody.createEl('tr');
			const projectId = row.createEl('td', { cls: 'project-table-border' });
			const projectName = row.createEl('td', { cls: 'project-table-border' });
			projectId.setText(String(project.id));
			projectName.setText(String(project.name));
		});


		new Setting(contentEl).addButton(confirmBtn => {
			confirmBtn.setClass('ts_button');
			confirmBtn.buttonEl.addClass('mod-destructive');
			confirmBtn.setButtonText(t('modal.duplicateLists.abort'));
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
