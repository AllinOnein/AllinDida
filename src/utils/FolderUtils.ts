   import { App, Notice, TFolder } from 'obsidian';
   import { t } from '@/i18n';

   /**
    * Validate the folder, create if needed, and return its path or null.
    */
   export async function validateNewFolder(app: App, newFolder: string, folderType: string): Promise<string | null> {
     if (!newFolder) return null;
     if (newFolder.length > 1 && /^[/\\]/.test(newFolder)) {
       newFolder = newFolder.substring(1);
     }
     let newFolderFile = app.vault.getAbstractFileByPath(newFolder);
     if (!newFolderFile) {
       try {
         newFolderFile = await app.vault.createFolder(newFolder);
         new Notice(t('folder.created', { path: newFolderFile.path }));
       } catch (error) {
         new Notice(t('folder.createFailed', { name: newFolder, message: String(error) }), 5000);
         return null;
       }
     }
     if (newFolderFile instanceof TFolder) {
       new Notice(t('folder.nowIs', { type: folderType, path: newFolderFile.path }));
       return newFolderFile.path;
     }
     return null;
   }
