const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const log = new (require('signale').Signale)({
	scope: 'CHBT'
});
const streamlink = path.resolve(__dirname, './../../tools/chaturbate/Streamlink_Portable/Streamlink.exe');
const { EventEmitter } = require('events');

module.exports.online = function online(username) {
	return new Promise(async (res) => {
		const proc = spawn(streamlink, [`https://chaturbate.com/${username}`]);
		proc.on('exit', code => {
			return res(code === 0)
		});
	});
}

module.exports.record = function record(username, filepath) {
	const eventEmitter = new EventEmitter();

	const proc = spawn(streamlink, [
		`https://chaturbate.com/${username}`,
		'-o', filepath,
		'--default-stream', 'best'
	]);

	buffer = "";
	proc.stdout.on('data', data => {buffer += data});
	proc.stderr.on('data', data => {buffer += data});
	
	proc.on('exit', code => {
		if(code !== 0) {
			try {
				fs.mkdirSync(`./logs/`);
			} catch (e) { ''; }
			fs.writeFile('logs/chaturbate-' + username + '-' + new Date().getTime() + '.log', buffer, _ => _);
		}
		eventEmitter.emit('done', code);
	})

	eventEmitter.kill = function kill() {
		proc.kill(0);
	}

	return eventEmitter;
}