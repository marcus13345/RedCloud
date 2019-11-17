const {Collexion} = require('collexion');

console.log('     ');
console.log(' ____________________ ');
console.log('/                    \\ ');
console.log('|      RedCloud      | ');
console.log('|    ' + require('./package.json').version.padStart(10, ' ') + '      | ');
console.log('\\____________________/');
console.log('     ');
console.log('     ');

const config = {
	Server: {
		Code: require('./src/components/RestServer.js'),
		Data: {
			routes: {
				videos: 'Videos',
				search: 'Search',
				sources: 'Cron'
			}
		}
	},
	Videos: {
		Code: require('./src/components/videos.js')
	},
	Search: {
		Code: require('./src/components/search.js')
	},
	Cron: {
		Code: require('./src/components/cron.js')
	},
	Details: {
		Code: require('./src/components/details.js')
	},
	Util: {
		Code: require('./src/components/util.js')
	},
};

if (typeof require('electron') !== 'string') {
	
	config['Electron'] = {
		Code: require('./src/components/electron.js')
	}
}

new Collexion(config)
