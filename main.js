const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const menu = require('./menu');
const fs = require('fs');
const { lsDevices } = require('fs-hard-drive');

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

ipcMain.on('list_drives', async () => {
  const drives = await lsDevices().then(ok => ok, err => err);
  console.log(drives)
  win.webContents.send('list_drives', {drives});
});


ipcMain.on('explorer_list_files', (event, args) => {

  const testFolder = args.driveSelected;
  let arrFiles = [];
  fs.readdir(testFolder, (err, files) => {
    files.forEach(file => {
      // console.log(testFolder+file+' :', fs.existsSync(testFolder+file))
      if (fs.existsSync(testFolder+file)) {
        let objectFile = {
          name: file,
          type: fs.statSync(testFolder+file).isDirectory() ? 'directory' : (fs.statSync(testFolder+file).isFile() ? 'file' : 'unknown')
        };
        arrFiles.push(objectFile);
      }
    });
    win.webContents.send('explorer_list_files', {arrFiles});
  });
});

Menu.setApplicationMenu(menu);





