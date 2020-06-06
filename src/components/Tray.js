const SysTray = require('systray').default;
const fs = require('fs');
const log = new (require('signale').Signale)({
	scope: 'TRAY'
});

class Tray {
	start() {
		const systray = new SysTray({
			menu: {
					// you should using .png icon in macOS/Linux, but .ico format in windows
					icon: fs.readFileSync('./static/tray.ico', 'base64'),
					title: "RedCloud",
					tooltip: "RedCloud",
					items: [{
						title: 'Show App',
						tooltip: '',
						checked: false,
						enabled: true
					}, {
						title: 'Exit',
						tooltip: '',
						checked: false,
						enabled: true
					}]
			},
			debug: false,
			copyDir: true
		})

		systray.onClick(action => {
			log.debug(action)
			if (action.seq_id === 0) {

			} else if (action.seq_id === 1) {
				this._links.Util.shutdown();
			}
		});
	}

}

module.exports = Tray;