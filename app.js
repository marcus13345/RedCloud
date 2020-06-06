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
		write: (str) =>	console.log(str.trim())
	}
});
const __options = require('./options') || {};
global.__options = __options;
const log = __signale.scope(__options.app.output.emoji ? '🕋' : '_APP');
// log.debug('YARR', process.yargv);
try {
	const config = {
		Server: {
			Code: require('./src/components/RestServer'),
			Data: {
				routes: {
					videos: 'Videos',
					search: 'Search',
					sources: 'Cron',
					eval: 'Eval',
					util: 'Util'
				},
				port: __options.api.port
			}
		},
		Eval: {
			Code: require('./src/components/eval')
		},
		Videos: {
			Code: require('./src/components/videos')
		},
		Search: {
			Code: require('./src/components/search')
		},
		Details: {
			Code: require('./src/components/details')
		},
		Util: {
			Code: require('./src/components/util')
		},
		Spawner: {
			Code: require('./src/components/spawn.js')
		},
		Cron: {
			Code: require('./src/components/cron'),
			Data: {
				cron: {
					types: {
						pornhub: require('./src/components/cron/pornhub'),
						chaturbate: require('./src/components/cron/chaturbate'),
					}
				}
			}
		},
		Electron: {
			Code: require('./src/components/electron')
		},
		Tray: {
			Code: require('./src/components/Tray')
		},
		Readline: {
			Code: require('./src/components/Readline')
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