
// process.env.ELECTRON_ENABLE_LOGGING = false;
// process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true"
// process.env.ELECTRON_RUN_AS_NODE = "true";
const log = new (require('signale').Signale)({
	scope: 'ELEC'
});

const { spawn } = require('child_process');
const createSemaphore = require('../lib/semaphore.js')
const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const electronReady = createSemaphore();

const path = require('path');

class Electron {
	async start() {
		if(typeof require('electron') === 'string') {
			this.electronProcess = spawn(require('electron'), [__filename]);
			// this.electronProcess.stdout.on("end", _ => {
			// 	log.debug('electron window closed, shutting down');
			// 	this._links.Util.shutdown();
			// });
			this.electronProcess.stderr.on('data', _ => {
				log.warn(_.toString().trim())
			})
			this.electronProcess.on('close', _ => {
				// TODO SHUT DOWN GRACEFULLY
				this._links.Util.shutdown();
			});
			return;
		}

		// !!! FROM HERE FORWARD, THIS ALL HAPPENS IN THE SUB PROCESS

		app.on('ready', _ => electronReady.resolve());
		await electronReady;

		const iconPath = path.resolve(__dirname, '../../static', 'tray.png');
		const appIcon = // process.platform === 'darwin'
		              // ? nativeImage.createEmpty() :
									 nativeImage.createFromPath(iconPath)


		const tray = new Tray(appIcon);
		// const tray = new Tray();

		// that.tray = tray;

		const win = new BrowserWindow({
			width: 800,
			height: 600,
			frame: process.platform !== 'win32',
			webPreferences: {
				nodeIntegration: true
			},
			show: false,
		});
		const contextMenu = Menu.buildFromTemplate([
			{
				label: 'Show App',
				click: function () {
					win.show()
				}
			},
			{
				label: 'Quit',
				click: function () {
					process.exit(0);
				}
			}
		]);
		tray.on('balloon-click', _ => {
			win.hide();
		})

		// win.webContents.openDevTools();
		win.on('ready-to-show', _ => win.show());

		tray.setContextMenu(contextMenu)

		win.on('close', evt => {
			evt.preventDefault();
			win.hide();
			return false;
		});

		win.on('show', function () {
			tray.setToolTip('RedCloud');
			// appIcon.
		});
		
		process.on('exit', function() {
		});

		win.loadFile(path.join(__dirname, './../../dist/index.html'));
	}

	async stop() {
		try {
			if(this.electronProcess) {
				this.electronProcess.kill('SIGINT');
			} else {
				log.warn('electron process undefined??');
			}
		} catch (e) {
			log.error(e);
		}
	}
}

module.exports = Electron;

if(module === require.main) {
	// we're being RUN
	const electron = new Electron()
	electron.start();
}