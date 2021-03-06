
// process.env.ELECTRON_ENABLE_LOGGING = false;
// process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true"
// process.env.ELECTRON_RUN_AS_NODE = "true";


const log = __signale.scope('ELEC');
const path = require('path');
const { spawn } = require('child_process');
const electron = require('electron');
const electronFile = path.join(__filename, '../ElectronThread.js');

class Electron {
	start() {
		this.electronProcess = spawn(electron, [electronFile]);
	}

	async stop() {
		try {
			if(this.electronProcess) {
				this.electronProcess.kill('SIGINT');
			} else {
				log.warn('no electron process to kill');
			}
		} catch (e) {
			log.error(e);
		}
	}
}

module.exports = Electron;


	// async start() {
	// 	if(!__options.app.electron.enabled) return;

	// 	if(typeof require('electron') === 'string') {

	// 		this.electronProcess = spawn(require('electron'), [__filename]);
	// 		// this.electronProcess.stdout.on("end", _ => {
	// 		// 	log.debug('electron window closed, shutting down');
	// 		// 	this._links.Util.shutdown();
	// 		// });
	// 		this.electronProcess.stderr.on('data', _ => {
	// 			if(__options.electron.logging)
	// 				log.warn(_.toString().trim())
	// 		});
	// 		this.electronProcess.on('exit', _ => {
	// 			// TODO SHUT DOWN GRACEFULLY
	// 			this._links.Util.shutdown();
	// 		});
	// 		return;
	// 	}

	// 	// !!! FROM HERE FORWARD, THIS ALL HAPPENS IN THE SUB PROCESS

	// 	app.on('ready', _ => electronReady.resolve());
	// 	await electronReady;

	// 	// const iconPath = path.resolve(__dirname, '../../static', 'tray.png');
	// 	// const appIcon = // process.platform === 'darwin'
	// 	//                 // ? nativeImage.createEmpty() :
	// 	// 							 nativeImage.createFromPath(iconPath)

	// 	const win = new BrowserWindow({
	// 		width: 800,
	// 		height: 600,
	// 		// frame: process.platform !== 'win32',
	// 		webPreferences: {
	// 			nodeIntegration: true,
	// 			webSecurity: false
	// 		},
	// 		show: false,
	// 	});
	// 	win.setMenu(null);
	// 	win.webContents.openDevTools();

	// 	win.on('ready-to-show', _ => win.show());

	// 	win.on('close', evt => {
	// 		evt.preventDefault();
	// 		win.hide();
	// 		return false;
	// 	});

	// 	win.on('show', function () {
	// 	});
		
	// 	process.on('exit', function() {
	// 	});

	// 	win.loadFile(path.join(__dirname, './../../dist/index.html'));
	// }
