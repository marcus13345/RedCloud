const fs = require('fs');

module.exports.createStream = function createStream(scope, name) {
	const timestamp = new Date().getTime();
	const filename = name ? `${name}-${timestamp}.log`
											  : `${timestamp}.log`;
	const filepath = path.resolve(__dirname, 'logs', scope, filename);
	return fs.createWriteStream(filepath);
}