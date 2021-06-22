const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const LIMITER = 1000;

var pathInterpreter;
var versionInterpreter;
var history = [];
var storePath = path.join(app.getPath('userData'), 'store.json');
var settingsSaved = {};

/*Creates window with custom menu. Provide ability to
change interpreter.*/
function createWindow () {
  const win = new BrowserWindow({
    width: 1000,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'io.js')
    }
  })

  win.webContents.send('interpreter',
                      {pi: versionInterpreter,
                      hs: history,
                      pt: pathInterpreter,
                      settingsSaved: settingsSaved
                      });

  const template = [
      {
          label: 'Navigation',
          submenu: [
              {
                  label: 'Open Console',
                  click: () => {
                      win.webContents.send('console');
                  }
              },
              {
                  label: 'Open Settings',
                  click: () => {
                      win.webContents.send('settings');
                  }
              }
          ]
      },
  {
    label: 'Actions',
    submenu: [
        {label: 'Clear',
         click: async () => {
             win.webContents.send('clear');
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
                                {
                                    pi: versionInterpreter,
                                    pt: pathInterpreter
                                });
                    });
                })
            }
         }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'toggleDevTools' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Source',
    click: async () => {
      const { shell } = require('electron')
      await shell.openExternal('https://github.com/yde773786/YAPR')
    }
  }
]

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  win.loadFile(path.join(__dirname, '../html/index.html'));
}

/*read currently available persistent storage and pass
to renderer process.*/
app.whenReady().then(() => {

  try{
      storedVal = JSON.parse(fs.readFileSync(storePath));
      pathInterpreter = storedVal.path;
      versionInterpreter = storedVal.version;
      history = storedVal.history;
      settingsSaved = storedVal.settingsSaved;
  } catch (err){
      pathInterpreter = 'No Interpreter';
      versionInterpreter = '';
      history = [];
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

/*Register new input for persistence. If length
of history exceeds limit, pop out earliest entries.*/
ipcMain.on('history-update', (e, update) => {
    if(history.length == LIMITER){
        history.shift();
    }
    history.push(update);
});

/*Save updated settings*/
ipcMain.on('console-save', (e, settingsData) =>{
    settingsSaved = settingsData;
})

/*Error for invalid interpreter.*/
ipcMain.on('cannot-interpret', (e) => {
    dialog.showErrorBox('Cannot Execute', "Cannot execute program as" +
                                        " no valid Interpreter" +
                                        " is found.");
});

/*Write to persistent storage the new inputs before
closing the application.*/
app.on('window-all-closed', () => {
    fs.writeFileSync(storePath, JSON.stringify(
        {path: pathInterpreter,
        version: versionInterpreter,
        history: history,
        settingsSaved: settingsSaved}
    ));

    if (process.platform !== 'darwin') {
        app.quit()
    }
})
