const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const menu = require('./menu');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false
    }
  });

  if (process.env.DEBUG) {
    win.loadURL(`http://localhost:4200`);
  } else {
    win.loadURL(`file://${__dirname}/dist/integrate-angular-electron/index.html`);
  }

  win.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready',() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.on('app_version', (event) => {
  console.log('entra')
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
  win.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  win.webContents.send('update_downloaded');
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

Menu.setApplicationMenu(menu);
