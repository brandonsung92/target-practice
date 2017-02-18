const electron = require('electron');
const path = require('path')
const url = require('url')

const {app, BrowserWindow, ipcMain} = electron;

const MAIN_PATH = "main.html";

let mainWindow;

const createMainWindow = function() {
    const {workAreaSize} = electron.screen.getPrimaryDisplay();
    const windowOptions = {
        width: workAreaSize.width,
        height: workAreaSize.height,
        fullscreen: true
    }
    mainWindow = new BrowserWindow(windowOptions);
    
    // dev only
    // mainWindow.openDevTools();

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, MAIN_PATH),
        protocol: 'file'
    }));

    mainWindow.on('closed', function() {
        mainWindow = null;
    })
}

ipcMain.on('quit', function(event, arg) {
    app.quit();
});

app.on('ready', createMainWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    app.quit();
});
