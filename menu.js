const { app, Menu, shell, ipcMain, BrowserWindow, globalShortcut, dialog } = require('electron');
const fs = require('fs');


const template = [

];

if (process.env.DEBUG) {
	template.push({
	  label: 'Debugging',
	  submenu: [
		{
		  label: 'Dev Tools',
		  role: 'toggleDevTools'
		},

		{ type: 'separator' },
		{
		  role: 'reload',
		  accelerator: 'Alt+R'
		}
	  ]
	});
}

//if (process.platform === 'darwin') {
	template.unshift({
	  label: app.getName(),
	  submenu: [
		{ role: 'about' },
		{ type: 'separator' },
		{ role: 'quit' }
	  ]
	})
//}

const menu = Menu.buildFromTemplate(template);

module.exports = menu;
