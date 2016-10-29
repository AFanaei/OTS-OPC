const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog, webContents} = require('electron')

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({width: 1200, height: 600})
  createMenu();
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

function createMenu () {
  let template = [
    {
      label: 'File',
      submenu: [{
        label : 'Connect',
        click : function (item, focusedWindow) {
          webContents.fromId(mainWindow.id).send('new-connection');
        }
      },{
        label : 'Disconnect',
        click : function (item, focusedWindow) {
          webContents.fromId(mainWindow.id).send('disconnect');
        },
        enabled: false,
      },{
        type: 'separator'
      },{
        label : 'Load Layout',
        click : function (item, focusedWindow) {
          const options = {
            title: 'Load ...',
            filters: [
              { name: 'LayoutData', extensions: ['json'] },
              {name: 'All Files', extensions: ['*']}
            ],
            properties: ['openFile']
          };
          dialog.showOpenDialog(options, function (files) {
            if (files) webContents.fromId(mainWindow.id).send('load-layout', files)
          });
        }
      },{
        label : 'Save Layout',
        click : function (item, focusedWindow) {
          const options = {
            title: 'Save ...',
            filters: [
              { name: 'LayoutData', extensions: ['json'] },
              {name: 'All Files', extensions: ['*']}
            ]
          }
          dialog.showSaveDialog(options, function (filename) {
            if(filename) webContents.fromId(mainWindow.id).send('save-layout',filename);
          })
        }
      },{
        type: 'separator'
      },{
        label: 'Exit',
        role: 'quit'
      }
    ]},{
    label: 'View',
    submenu: [{
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          if (focusedWindow.id === 1) {
            BrowserWindow.getAllWindows().forEach(function (win) {
              if (win.id > 1) {
                win.close()
              }
            })
          }
          focusedWindow.reload()
        }
      }
    }, {
      label: 'Toggle Full Screen',
      accelerator: 'F11',
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
        }
      }
    }, {
      label: 'Toggle Developer Tools',
      accelerator: 'Ctrl+Shift+I',
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      }
    }, {
      type: 'separator'
    }, {
      label: 'App Menu Demo',
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          const options = {
            type: 'info',
            title: 'Application Menu Demo',
            buttons: ['Ok'],
            message: 'This demo is for the Menu section, showing how to create a clickable menu item in the application menu.'
          }
          electron.dialog.showMessageBox(focusedWindow, options, function () {})
        }
      }
    }]
  }];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}


app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
