const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const log = new (require('signale').Signale)({
	scope: 'CHBT'
});
let streamlink = path.resolve(__dirname, './../../tools/streamlink/Streamlink_Portable/Streamlink.exe');
if(process.platform === 'darwin') {
	streamlink = path.resolve(__dirname, './../../tools/macos/streamlink/streamlink');
}
const { EventEmitter } = require('events');
const logFile = require('./../lib/LogFile');
const __options = require('../../options.json');

module.exports.online = function online(username) {
	log.debug('calling chaturbate API')
	return new Promise(async (res) => {
		const proc = spawn(streamlink, [`https://chaturbate.com/${username}`]);
		proc.on('exit', code => {
			return res(code === 0)
		});
	});
}

module.exports.record = function record(username, filepath) {
	const eventEmitter = new EventEmitter();

	log.debug('calling chaturbate API from record!')
	const proc = spawn(streamlink, [
		`https://chaturbate.com/${username}`,
		'-o', filepath,
		'--default-stream', 'best'
	]);

	buffer = "";

	proc.stdout.on('data', data => {
		buffer += data;
		if(__options.tools.streamlink.output) process.stdout.write(data);
	})

	proc.stderr.on('data', data => {
		buffer += data;
		if (__options.tools.streamlink.output) process.stdout.write(data);
	})
	
	proc.on('exit', code => {

		const logStream = logFile.createStream(`chaturbate/record/${username}/`);
		logStream.write(buffer);
		eventEmitter.emit('done', code);
	})

	eventEmitter.kill = function kill() {
		proc.kill(0);
	}

	return eventEmitter;
}