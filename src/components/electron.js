// process.env.ELECTRON_ENABLE_LOGGING = false;
// process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true"
// process.env.ELECTRON_RUN_AS_NODE = "true";

const { spawn } = require('child_process');
const createSemaphore = require('../lib/semaphore.js')
const { app, BrowserWindow } = require('electron');
const electronReady = createSemaphore();

const path = require('path');
const log = new (require('signale').Signale)({
	scope: 'ELEC'
});

class Electron {
  async connected() {

    if(typeof require('electron') === 'string') {
      
      const electronProcess = spawn(
        path.resolve(
          __dirname,
          './../../node_modules/.bin/electron.cmd'
        ),
        [
          __filename
        ],
        {
          "windowsHide": true,
          stdio: 'inherit'
        }
      );

      // process.on('exit', _ => {
      //   electronProcess.kill(0);
      // });

      // electronProcess.stdout.on("end", process.exit)
      
      return;
    }

    

    app.on('ready', _ => {
      electronReady.resolve()
    });

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


    win.autoHideMenuBar = true;
    
    process.on('exit', _ => {
      win.webContents.openDevTools();
    })

    win.on('ready-to-show', _ => {
      // console.log('opening Window')
      win.show()
    });

    // and load the index.html of the app.
    // win.loadFile('index.html')
    win.loadFile(path.join(__dirname, './../../dist/index.html'));
  }
}

module.exports = Electron;

if(module === require.main) {
  // we're being RUN
  const electron = new Electron()
  electron.connected();
}