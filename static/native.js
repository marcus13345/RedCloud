if (window && window.process && window.process.type) {
	const customTitlebar = require('custom-electron-titlebar');
	
	const titlebar = new customTitlebar.Titlebar({
		backgroundColor: customTitlebar.Color.fromHex('#000'),
		icon: '/logo.png',
		iconsTheme: customTitlebar.Themebar.win,
		menu: null
	});

	document.addEventListener('pageLoad', () => {
		titlebar.updateTitle();
	})
}
