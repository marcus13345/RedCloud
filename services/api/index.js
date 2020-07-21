// global.WHY = require('why-is-node-running');

process.env.FORCE_COLOR = 1;
const chalk = require('chalk');
header();
process.yargv = require('yargs').argv;
const {Collexion} = require('collexion');
// const { Duplex, Writable } = require('stream');
// const loggerProxy = new Writable();
// Writable.prototype._write = function(chunk, data){
// 	console.log(data);
// }
global.__signale = new (require('signale').Signale)({
	scope: 'PARENT',
	stream: {
		write(str) { console.log(str.trim()) }
	}
});

const __options = require('./options');
global.__options = __options;
const log = __signale.scope(__options.app.output.emoji ? '🕋' : '_APP');
// log.debug('YARR', process.yargv);
try {
	const config = {
		Server: {
			Code: require('./components/RestServer'),
			Data: {
				routes: {
					videos: 'Videos',
					search: 'Search',
					sources: 'Cron',
					util: 'Util'
				},
				port: __options.api.port
			}
		},
		Videos: {
			Code: require('./components/videos')
		},
		Search: {
			Code: require('./components/search')
		},
		Details: {
			Code: require('./components/details')
		},
		Util: {
			Code: require('./components/util')
		},
		Spawner: {
			Code: require('./components/spawn.js')
		},
		Cron: {
			Code: require('./components/cron'),
			Data: {
				cron: {
					types: {
						pornhub: require('./components/cron/pornhub'),
						chaturbate: require('./components/cron/chaturbate'),
					}
				}
			}
		},
		// Electron: {
		// 	Code: require('./src/components/electron')
		// },
		Tray: {
			Code: require('./components/Tray')
		},
		Readline: {
			Code: require('./components/Readline'),
			Data: {
				aliases: {
					'stop': 'Util shutdown'
				}
			}
		}
	};

	const app = new Collexion(config)

	// process.on( 'exit', function() {
	// 	// sometimes you just gotta hard hard
	// 	process.kill( process.pid, 'SIGTERM' );
	// });
} catch (e) {
	console.log(e);
}

function header() {
	let lines = [
		'',
		chalk.red('╭────────────────────╮'),
		chalk.red('│') + '      \033[3mRed' + chalk.red('Cloud') + '\033[0m      ' + chalk.red('│'),
		// chalk.red('|') + '    ' + chalk.grey(require('./package.json').version.padStart(10, ' ')) + '      ' + chalk.red('|') + ' ',
		chalk.red('╰────────────────────╯'),
		'',
		'',
	]

	let spacer = '';
	try {
		spacer = ' '.repeat((process.stdout.getWindowSize()[0] - lines[1].length) / 2 - 1);
	} catch (e) {
		spacer = '    ';
	}

	for(const line of lines) {
		console.log(spacer, line);
	}
}