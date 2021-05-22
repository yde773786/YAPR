const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const exec = require('child_process').exec;

var pathInterpreter;
var versionInterpreter;
var history = [];
var storePath = path.join(app.getPath('userData'), 'store.json');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'input.js')
    }
  })

  win.webContents.send('interpreter',
                      {pi: versionInterpreter,
                      hs: history});

  const template = [
  {
    label: 'Actions',
    submenu: [
        {label: 'Clear',
         click: async () => {
             console.log('CLICKED CLEAR');
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
                                        win.webContents.send('interpreter-update',
                                                            versionInterpreter);
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

  storedVal = JSON.parse(fs.readFileSync(storePath));
  console.log(storedVal);
  pathInterpreter = storedVal.path;
  versionInterpreter = storedVal.version;
  history = storedVal.history;

  createWindow();

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
    fs.writeFileSync(storePath, JSON.stringify(
        {path: pathInterpreter,
        version: versionInterpreter,
        history: history}
    ));

    if (process.platform !== 'darwin') {
        app.quit()
    }
})
