if (window && window.process && window.process.type) {
	const customTitlebar = require('custom-electron-titlebar');
	const Store = require('electron-store');
	
	window.titlebar = new customTitlebar.Titlebar({
		backgroundColor: customTitlebar.Color.fromHex('#000'),
		icon: './logo.png',
		iconsTheme: customTitlebar.Themebar.win,
		menu: null
	});

	document.addEventListener('pageLoad', () => {
		window.titlebar.updateTitle();
	});

	window.redcloud = {
		store: new Store({
			defaults: {
				settings: {
					apiBasePath: 'http://localhost:52310/api'
				}
			}
		})
	}
}
