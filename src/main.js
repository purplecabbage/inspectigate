

const electron = require('electron');
const app = electron.app;
const Menu = electron.Menu;

const windowProps = { width: 400,
                      height: 400,
                      frame: true,
                      transparent:false,
                      resizable:false,
                      webPreferences: {
                        nodeIntegration: true
                      }
};

let mainWindow;
let template = [
{
      label: 'File',
      submenu: [{
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: function (item, focusedWindow) {
              var dialogProps = {
                                    properties: ['openFile', 'multiSelections'],
                                    filters: [{
                                                  name: 'iOS/Android Apps',
                                                  extensions: ['ipa','apk']
                                              }]
                                };
              var fileList = electron.dialog.showOpenDialog(dialogProps);
              if(fileList) {
                  console.log("fileList = " + fileList.length);
                  mainWindow.webContents.send('file-menu',fileList);
              }
          }
  }]},
  {
    label:"View",
    role:"view",
    submenu:[{
	      label: 'Toggle Developer Tools',
        accelerator: (function () {
            if (process.platform === 'darwin') {
              return 'Alt+Command+I'
            }
            else {
              return 'Ctrl+Shift+I'
            }
        })(),
        click: function (item, focusedWindow) {
            if (focusedWindow) {
                focusedWindow.toggleDevTools()
            }
        }
    }]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [{
        label: 'Learn More',
        click: function () {
            electron.shell.openExternal('https://github.com/purplecabbage/inspectigate')
        }
    }]
}];

if (process.platform === 'darwin') {
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [{ role: 'about'},
              { type: 'separator'},
              { role: 'services', submenu: []},
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideothers'},
              { role: 'unhide'},
              { type: 'separator'},
              { role: 'quit'}]
  });
};


function createWindow () {
  mainWindow = new electron.BrowserWindow(windowProps);

  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.webContents.on('did-finish-load', function () {
      mainWindow.webContents.send('window-id',mainWindow.id);
  });
  mainWindow.on('closed', function () {
    mainWindow = null;
  })
}

app.on('ready', function(){
  if (!mainWindow) {
    createWindow();
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu);
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (!mainWindow) {
    createWindow();
  }
});
