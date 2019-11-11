process.env.ELECTRON_ENABLE_LOGGING = "false";
// process.env.ELECTRON_RUN_AS_NODE = true;

const { app, BrowserWindow } = require('electron')

function createWindow () {
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

	win.webContents.openDevTools();

	win.autoHideMenuBar = true;

	win.on('ready-to-show', _ => win.show());

  // and load the index.html of the app.
  // win.loadFile('index.html')
	win.loadURL('http://localhost:52310/');
}

app.on('ready', createWindow)