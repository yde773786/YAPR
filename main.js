const { app, BrowserWindow, Menu, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec;

var pathInterpreter;
var child;

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
                                child = exec(pathInterpreter + ' --version');
                                child.stdout.on('data', (data) => {
                                        win.webContents.send('interpreter', data);
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
