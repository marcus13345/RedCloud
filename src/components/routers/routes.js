const express = require('express');
const log = new (require('signale').Signale)({
	scope: 'HTTP'
});
const fs = require('fs');

module.exports = class Server {
	async connected() {
		
		this.app = express();
		const app = this.app;
		app.use('/videos', this._links.Videos.getRouter());
		
		await this.shutdownPreviousProcess();
		app.listen(80)
	}
	
	shutdownPreviousProcess() {
		return new Promise((res, rej) => {
			(function(port, fn) {
				var net = require('net')
				var tester = net.createServer()
				.once('error', function (err) {
					if (err.code != 'EADDRINUSE') return fn(err)
					fn(null, true)
				})
				.once('listening', function() {
					tester.once('close', function() { fn(null, false) })
					.close()
				})
				.listen(port)
			})(80, (_, serverRunning) => {
				if(!serverRunning) {
					log.info('no server running, moving on...');
					return res();
				}
				log.info('sending shutdown')
				https.get('http://localhost/shutdown', async (resp) => {
					log.info('shutdown callback')
					await new Promise(res => setTimeout(res, 1000));
					res();
				}).on('error', _ => _);
			});
		});
	}
}