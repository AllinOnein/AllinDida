# Maintenance

The **Maintenance** tab provides tools for managing and troubleshooting your sync.

| Feature | Description |
|---------|-------------|
| **Manual Sync** | Force an immediate synchronization cycle |
| **Check Database** | Scan for synchronization errors or inconsistencies |
| **Backup TickTick Data** | Export all TickTick data as a CSV file |
| **Manage Deleted Tasks** | View, permanently remove, or recover deleted task records |

## Backup

Back up your TickTick data as a CSV file compatible with TickTick's **Import Backup** feature.

Backups are exported as `ticktick-backup-<timestamp>.csv`. The plugin never reads these files back — they exist solely so you can re-import your data into TickTick.

### Backup Folder

Choose which folder in your vault stores backup files. By default, backups are saved to the vault root.

### Back Up on Startup

Off by default. When enabled, the plugin exports your TickTick data every time Obsidian starts.

This is off by default because the export is a full copy of every task and TickTick limits how often it can be produced (see below). If your vault is stored in a synchronised folder such as OneDrive or Dropbox, leaving it off also avoids uploading a new file on every launch.

### Backup Files to Keep

Older backup files in the backup folder are removed automatically, keeping only the most recent ones (1–20, default 3). Only files matching the `ticktick-backup-` prefix are affected, so your own CSVs are never touched.

!!! note
    TickTick limits backups to **4 per day** through the API. Enable **Back Up on Startup** only if you really need it, and use the manual **Backup** button judiciously.

## Deleted Task Management

When tasks are deleted (from Obsidian or TickTick), the plugin retains a record rather than removing them immediately. This provides a safety net against accidental deletions.

### Deleted Task Retention

Set how many days to keep deleted task records before automatic cleanup (1–31, default 7).

### Permanently Delete Tasks

View all soft-deleted task records and permanently remove selected ones from the database. This cannot be undone.

### Recover Deleted Tasks

Restore deleted tasks back to their original file or a different file in your vault. Opens a modal where you can select which tasks to recover and where to place them.
