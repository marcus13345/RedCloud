const WHY = require('why-is-node-running')
process.env.FORCE_COLOR = 1;
const {Collexion} = require('collexion');
const chalk = require('chalk');
const log = new (require('signale').Signale)({
	scope: '_APP'
});
try {
	const __options = require('./options.json') || {};
	global.__options = __options;

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
					eval: 'Eval',
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

	if (process.argv.indexOf('--disable-electron') > -1) {
		config['Electron'] = undefined;
	}

	const app = new Collexion(config)

	process.on('SIGINT', _ => {
		log.info(chalk.bgYellow.black('trying to shut down gracefully...'));
		for(const instanceName in app._instances) {
			const instance = app._instances[instanceName];
			try {
				log.info('stopping', instanceName);
				instance.stop();
			} catch (e) {

			}
		}
		// WHY();
		process.exit(0)
	})
	process.on( 'exit', function() {
		// sometimes you just gotta hard hard
		process.kill( process.pid, 'SIGTERM' );
	});
} catch (e) {
	console.log(e);
}