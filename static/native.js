if (window && window.process && window.process.type) {
	const Store = require('electron-store');

	document.addEventListener('pageLoad', () => {
		// if(process.platform === 'win32')
		// 	window.titlebar.updateTitle();
	});

	// console.log('defining redcloud');
	window.redcloud = {
		store: new Store({
			defaults: {
				settings: {
					apiBasePath: 'http://localhost:3333/api',
					censor: true
				},
				navigation: {
					currentPage: 'library'
				}
			},
			name: require('./../options').app.id
		})
	};

	window.exec = async function exec(input) {
		if(typeof input === 'string') {
			return await new Promise(res => {
				ajax({
					method: 'POST',
					url: '/eval',
					data: input,
					contentType: 'text/plain'
				}).done((a) => {
					res(JSON.parse(a));
				})
			})
		} else { //function
			return await new Promise(res => {
				ajax({
					method: 'POST',
					url: '/eval',
					data: `(${input.toString()})()`,
					contentType: 'text/plain'
				}).done((a) => {
					res(JSON.parse(a));
				})
			})
		}


	}
}
