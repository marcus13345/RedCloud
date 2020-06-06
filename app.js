process.env.FORCE_COLOR = 1;
process.yargv = require('yargs').argv;
const {Collexion} = require('collexion');
const chalk = require('chalk');
const log = new (require('signale').Signale)({
	scope: '_APP'
});
// log.debug('YARR', process.yargv);
try {
	const __options = require('./options') || {};
	global.__options = __options;

	let lines = [
		'',
		chalk.red(' ____________________ '),
		chalk.red('/                    \\ '),
		chalk.red('|') + '      \033[3mRed' + chalk.red('Cloud') + '\033[0m      ' + chalk.red('|'),
		chalk.red('|') + '    ' + chalk.grey(require('./package.json').version.padStart(10, ' ')) + '      ' + chalk.red('|') + ' ',
		chalk.red('\\____________________/'),
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

	const config = {
		Server: {
			Code: require('./src/components/RestServer.js'),
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
			Code: require('./src/components/eval.js')
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

	const app = new Collexion(config)

	// process.on( 'exit', function() {
	// 	// sometimes you just gotta hard hard
	// 	process.kill( process.pid, 'SIGTERM' );
	// });
} catch (e) {
	console.log(e);
}


// test