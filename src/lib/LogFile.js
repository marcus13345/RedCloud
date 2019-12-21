const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

module.exports.createStream = function createStream(scope, name) {
	const timestamp = new Date().getTime();
	const filename = name ? `${name}-${timestamp}.log`
											  : `${timestamp}.log`;
	const filepath = path.resolve('logs', scope, filename);
	// console.log(filepath);
	fse.ensureFileSync(filepath);
	return fs.createWriteStream(filepath);
}