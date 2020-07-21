const log = __signale.scope(__options.app.output.emoji ? '📗' : 'READ');
function res(...strs) {
	console.log('<', ...strs)
}

class Readline {
	start() {
	}

	connected() {
		if (!process.stdout.isTTY) return;
		this.serverline = require('serverline')
		
		this.serverline.init()
		
		this.serverline.setPrompt('> ')
		
		this.serverline.on('line', (line) => {
			// console.log("\"", typeof line, "\"");
			this.processCommand(line.trim());
		});
		
		this.serverline.on('SIGINT', (a) => {
			this._links.Util.shutdown();
		});
		this.aliases = this._data.aliases || {};
		this.serverline.setCompletion([
			'help',
			...Object.keys(this.aliases),
			...Object.keys(this._links)
		]);
	}

	processCommand(commandString = '') {
		// empty command
		if(commandString === '') return;
		
		// log.debug(this.aliases);

		// expand aliases
		if(commandString in this.aliases) {
			log.debug(this.aliases[commandString]);
			log.debug(commandString);
			return this.processCommand(this.aliases[commandString]);
		}
		
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