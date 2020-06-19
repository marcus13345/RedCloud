const log = __signale.scope(__options.app.output.emoji ? '📗' : 'READ');
function res(...strs) {
	console.log('<', ...strs)
}

class Readline {
	start() {
		// this.logger = setInterval(log.debug.bind(log, 'test'), 1000);
		// this.buffer = '';
		// process.stdin.on('data', (data) => {
		// 	this.buffer += data.toString();
		// 	this.processBuffer();
		// });


		
		this.serverline = require('serverline')
		
		this.serverline.init()
		
		this.serverline.setPrompt('> ')
		
		this.serverline.on('line', (line) => {
			this.processCommand(line);
		})
		
		this.serverline.on('SIGINT', (a) => {
			this._links.Util.shutdown();
		})
	}

	connected() {
		// log.debug('this happens right?');
		this.serverline.setCompletion(['help', ...Object.keys(this._links)]);
	}

	processCommand(commandString) {
		const parts = commandString.split(' ');
		const [module, fn, ...args] = parts;
		if(parts.length === 0) return;
		else if (parts.length === 1) {
			if(module === 'help') {
				log.info('Available commands: ' + Object.keys(this._links).join(', '))
			} else {
				log.info(module + ' commands: ' + Object.keys(this._links[module]).join(', '))
			}
			return;
		} else {
			try {
				const thing = this._links[module][fn];
				switch(typeof thing) {
					case 'function': {
						thing.call(this._links[module], ...args);
						break;
					}
					default: {
						log.info(thing);
						break;
					}
				}
			} catch (e) {
				log.error(e);
			}
		}
	}

	stop() {
		// clearInterval(this.logger);
		this.serverline.close();
	}
}

module.exports = Readline;