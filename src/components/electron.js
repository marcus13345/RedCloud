
// process.env.ELECTRON_ENABLE_LOGGING = false;
// process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true"
// process.env.ELECTRON_RUN_AS_NODE = "true";

const { spawn } = require('child_process');
const createSemaphore = require('../lib/semaphore.js')
const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const electronReady = createSemaphore();

const path = require('path');
const log = new (require('signale').Signale)({
	scope: 'ELEC'
});

class Electron {
	async start() {

		await (async () => {
			const iconPath = path.resolve(__dirname, '../../static', 'tray.png');
			log.debug(iconPath);

			if(typeof require('electron') === 'string') {
				this.electronProcess = spawn(require('electron'), [__filename]);
				this.electronProcess.stdout.on("end", process.exit)
				return;
			}

			app.on('ready', _ => electronReady.resolve());
			await electronReady;

			const appIcon = new Tray(nativeImage.createFromPath(iconPath));
			// const appIcon = new Tray(nativeImage.createEmpty());
			const win = new BrowserWindow({
				width: 800,
				height: 600,
				frame: false,
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
						// app.isQuiting = true
						process.exit(0);
					}
				}
			]);
			appIcon.on('balloon-click', _ => {
				win.hide();
			})

			win.webContents.openDevTools();
			win.on('ready-to-show', _ => win.show());

			appIcon.setContextMenu(contextMenu)

			win.on('close', evt => {
				evt.preventDefault();
				win.hide();
				return false;
			})
			win.on('show', function () {
				appIcon.setToolTip('RedCloud');
				// appIcon.
			});

			
			process.on( 'exit', function() {
				appIcon.destroy();
			});

			win.loadFile(path.join(__dirname, './../../dist/index.html'));
		})();
	}

	async stop() {
		this.electronProcess.kill(0);
	}
}

module.exports = Electron;

if(module === require.main) {
	// we're being RUN
	const electron = new Electron()
	electron.start();
}