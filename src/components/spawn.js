const { spawn } = require('child_process')

const { Signale } = require('signale');
const log = new Signale({
	scope: '🖥 '
});

class Spawn {
	processes = [];
	open = true;

	spawn(name, ...args) {
		if(!this.open) {
			throw Error(name + ' not spawned. Spawner is CLOSED')
		}
		// log.debug('spawning', name);

		let process = spawn(...args);
		this.processes.push(process);
		
		process.on('exit', _ => {
			// log.debug(name, 'has exitted');
			// this.prune();
			const index = this.processes.indexOf(process);
			if(index === -1) return lod.debug(name, 'exitted while not in the pool');
			this.processes.splice(index, 1);
		});

		return process;
		// process.
	}

	// prune() {
	// 	for(const process of this.processes) {
	// 		if(process.)
	// 	}
	// }

	async stop() {
		this.killAll();
	}

	killAll() {
		this.open = false;
		log.info('Stopping', this.processes.length, 'child processes');

		for(const process of this.processes) {
			process.kill('SIGKILL');
		}

		log.success('All child processes killed')
	}
}

module.exports = Spawn