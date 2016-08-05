

const electron = require('electron');
const app = electron.app;

const windowProps = { width: 400,
                      height: 400,
                      frame: true,
                      transparent:false,
                      resizable:false};

let mainWindow;

function createWindow () {
  mainWindow = new electron.BrowserWindow(windowProps)
  mainWindow.loadURL(`file://${__dirname}/index.html`)
  mainWindow.on('closed', function () {
    mainWindow = null;
  })
}

app.on('ready', function(){
  if (!mainWindow) {
    createWindow();
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
