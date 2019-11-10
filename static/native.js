if (window && window.process && window.process.type) {
	// const ElectronTitlebarWindows = require('electron-titlebar-windows');
	const remote = require('electron').remote;
	const browserWindow = remote.getCurrentWindow();


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


	// console.log(browserWindow.isMaximized())
	// const titlebar = new ElectronTitlebarWindows({
	// 	draggable: true,
	// 	fullscreen: false
	// });
	// titlebar.on('close', function(e) {
	// 	var browserWindow = remote.getCurrentWindow();
	// 	browserWindow.close();
	// });
	// titlebar.on('minimize', function(e) {
	// 	var browserWindow = remote.getCurrentWindow();
	// 	browserWindow.minimize(); 
	// });
	// titlebar.on('maximize', function(e) {
	// 	var browserWindow = remote.getCurrentWindow();
	// 	if (!browserWindow.isMaximized()) {
	// 		browserWindow.maximize();
	// 	} else {
	// 		browserWindow.unmaximize();
	// 	}
	// });
	// titlebar.on('fullscreen', function(e) {
	// 	var browserWindow = remote.getCurrentWindow();
	// 	if (!browserWindow.isMaximized()) {
	// 		browserWindow.maximize();
	// 	} else {
	// 		browserWindow.unmaximize();
	// 	}
	// });
	// // titlebar.on()
	// // titlebar.on('fullscreen', function(e) {
	// // 	var window = remote.getCurrentWindow();
	// // 	window.close();
	// // });
	// titlebar.appendTo(document.querySelector('#bar'));
}
