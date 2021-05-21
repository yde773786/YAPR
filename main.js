const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')
const path = require('path')
const storage = require('electron-json-storage');
const fs = require('fs')
const exec = require('child_process').exec;

var pathInterpreter;
var versionInterpreter;
var history = [];

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'input.js')
    }
  })

  const template = [
  {
    label: 'Actions',
    submenu: [
        {label: 'Clear',
         click: async () => {
             console.log('CLICKED ME');
         }},
        {label: 'Choose Interpreter',
            click: async (menuItem, browserWindow, event) => {
                dialog.showOpenDialog({properties: ['openFile']
            }).then(
                (result) => {
                                pathInterpreter = result.filePaths[0];
                                let child = exec(pathInterpreter + ' --version');
                                child.stdout.on('data', (data) => {
                                        versionInterpreter = data.toString();
                                        win.webContents.send('interpreter',
                                                            {pi: versionInterpreter,
                                                            hs: history});
                                });
                            })
            }
         }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Source',
    click: async () => {
      const { shell } = require('electron')
      await shell.openExternal('https://github.com/yde773786/electron-python-console')
    }
  }
]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

ipcMain.on('history-update', (e, update) => {
    history.push(update);
});

app.on('window-all-closed', () => {

    console.log('Interpreter Path: ' + pathInterpreter);
    console.log('Interpreter Version: ' + versionInterpreter);
    console.log('History: ' + history);

    if (process.platform !== 'darwin') {
        app.quit()
    }
})
