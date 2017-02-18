const electron = require('electron');
const path = require('path')
const url = require('url')

const {app, BrowserWindow, ipcMain} = electron;

const MAIN_PATH = "main.html";

// Keep a global reference of the window objectto prevent it being automatically closed
// when the JavaScript object is garbage collected.
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
    mainWindow.openDevTools();

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, MAIN_PATH),
        protocol: 'file'
    }));

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
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

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createMainWindow();
    }
});
