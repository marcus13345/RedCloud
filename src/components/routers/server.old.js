
const express = require('express');
const log = new (require('signale').Signale)({
	scope: 'HTTP'
});
const fs = require('fs');

module.exports = class Server {
	async connected() {
		this.app = express();
		const app = this.app;

		app.use('/videos', this._links.Videos.getRouter())

		app.get('/', (req, res) => {
			res.redirect('/index')
		});

		app.get('/version', (req, res) => {
			res.end(require('./../../package.json').version);
		});

		app.get('/sources/new', (req, res) => {
			sources.insert({}, (err, doc) => {
				res.end(doc._id)
			})
		});

		app.get('/sources/modify', (req, res) => {

		});

		app.get('/sources', (req, res) => {
			sources.find({}, (err, docs) => {
				res.end(JSON.stringify(docs));
			});
		});


		app.get('/aliases', (req, res) => {
			aliasesdb.find({}, (err, docs) => {
				res.end(JSON.stringify(docs))
			})
		});

		app.get('/tagAliases', async (req, res) => {
			
			let data = await new Promise (res => {
				database.find({}, (err, docs) => {
					res(docs)
				})
			})
			

			let lists = {};

			for (const video of data) {
				// console.log(video)
				for (const tag of video.tags) {
					if (tag in lists) lists[tag].push(video);
					else lists[tag] = [video];
				}
			}

			let listsArr = [];
			for (let tag in lists) {
				if(lists[tag].length <= 5) continue;


				let aliases = await new Promise (res => {
					aliasesdb.find({tag}, (err, docs) => {
						res(docs)
					})
				})

				listsArr.push({
					name: tag,
					videos: lists[tag],
					aliases
				});
			}
			
			// console.dir(listsArr)

			res.end(JSON.stringify(listsArr))
		})

		app.get('/search/:search', async (req, res) => {
			// console.log(req.params.search);
			let results = await search(req.params.search, req.query.page || 1, database);
			res.end(JSON.stringify(results, null, 2))
		})

		app.get('/add/:vid', (req, res) => {
			log.info(`adding video id: ${req.params.vid}`)
			addVideo(req.params.vid);
			res.statusCode = 200;
			res.end('');
		});

		app.get('/shutdown', (req, res) => {
			log.info('shutting down');
			res.end();
			process.exit(0);
		})


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
