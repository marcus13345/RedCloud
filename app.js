process.env.FORCE_COLOR = 1;
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
	Details: {
		Code: require('./src/components/details.js')
	},
	Util: {
		Code: require('./src/components/util.js')
	},
	Cron: {
		Code: require('./src/components/cron.js'),
		Data: {
			cron: {
				types: {
					pornhub: require('./src/components/cron/pornhub.js'),
					chaturbate: require('./src/components/cron/chaturbate.js'),
				}
			}
		}
	},
	Electron: {
		Code: require('./src/components/electron.js')
	}
};

if (process.argv.indexOf('--disable-electron') > -1) {
	config['Electron'] = undefined;
}

new Collexion(config)
