import { autoUpdater } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';

export function update(win: BrowserWindow) {
  // Disable auto-download
  autoUpdater.autoDownload = false;
  autoUpdater.disableWebInstaller = false;
  autoUpdater.allowDowngrade = false;

  // start check
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });

  // update available
  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info);
    
    dialog.showMessageBox(win, {
      type: 'info',
      title: '发现新版本',
      message: '发现新版本，是否立即下载？',
      detail: `当前版本: ${autoUpdater.currentVersion}\n最新版本: ${info.version}`,
      buttons: ['立即下载', '稍后提醒'],
      defaultId: 0,
      cancelId: 1,
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
  });

  // update not available
  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available:', info);
  });

  // update error
  autoUpdater.on('error', (err) => {
    console.error('Update error:', err);
  });

  // update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info);
    
    dialog.showMessageBox(win, {
      type: 'info',
      title: '更新已下载',
      message: '新版本已下载完成，是否立即重启应用？',
      detail: '重启后将自动安装新版本',
      buttons: ['立即重启', '稍后重启'],
      defaultId: 0,
      cancelId: 1,
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  // download progress
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
    log_message = log_message + ` - Downloaded ${progressObj.percent}%`;
    log_message = log_message + ` (${progressObj.transferred}/${progressObj.total})`;
    console.log(log_message);
    
    // Send progress to renderer
    win.webContents.send('download-progress', progressObj);
  });

  // Check for updates (only in production)
  if (process.env.NODE_ENV === 'production') {
    // Check for updates every 4 hours
    setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 4 * 60 * 60 * 1000);
    
    // Check for updates on startup (after 10 seconds)
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 10000);
  }
}