process.env.ELECTRON_ENABLE_LOGGING = "false";
// process.env.ELECTRON_RUN_AS_NODE = true;

const { app, BrowserWindow } = require('electron');
const createSemaphore = require('../lib/semaphore.js')
const electronReady = createSemaphore();
app.on('ready', _ => {
  electronReady.resolve()
});


class Electron {
  async connected() {
    await electronReady;
    // Create the browser window.
    let win = new BrowserWindow({
      width: 800,
      height: 600,
      frame: false,
      webPreferences: {
        nodeIntegration: true
      },
      show: false,
    });
    // console.log('loading URL')

    win.webContents.openDevTools();

    win.autoHideMenuBar = true;

    win.on('ready-to-show', _ => {
      // console.log('opening Window')
      win.show()
    });

    // and load the index.html of the app.
    // win.loadFile('index.html')
    win.loadURL('http://localhost:52310/');
  }
}

module.exports = Electron;


if(module === require.main) {
  // we're being RUN
  const electron = new Electron()
  electron.connected();
}