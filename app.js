process.env.FORCE_COLOR = 1;
const {Collexion} = require('collexion');
const chalk = require('chalk');

console.log('     ');
console.log(chalk.red(' ____________________ '));
console.log(chalk.red('/                    \\ '));
console.log(chalk.red('|') + '      Red' + chalk.red('Cloud') + '      ' + chalk.red('|'));
console.log(chalk.red('|') + '    ' + require('./package.json').version.padStart(10, ' ') + '      ' + chalk.red('|') + ' ');
console.log(chalk.red('\\____________________/'));
console.log('     ');
console.log('     ');

const config = {
	Server: {
		Code: require('./src/components/RestServer.js'),
		Data: {
			routes: {
				videos: 'Videos',
				search: 'Search',
				sources: 'Cron',
				inspector: 'Inspector',
			}
		}
	},
	Inspector: {
		Code: require('./src/components/inspector.js')
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
