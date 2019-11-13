const pornhub = require('../lib/pornhub.js');
const nedb = require('nedb');
const express = require('express');
const {Signale} = require('signale');
const bodyParser = require('body-parser');
const createSemaphore = require('./../lib/semaphore.js')
const log = new Signale({
	scope: 'CRON'
});

module.exports = class PornhubAdapter {
	constructor() {
		this.sources = new nedb({
			filename: `sources.nedb`
		});
		this.pauseSemaphore = createSemaphore();
	}

	getRouter() {
		const router = express.Router();

		router.use( bodyParser.json() );

		router.get('/', async (req, res) => {
			const sources = await this.getSources();
			res.json(sources);
		});

		router.post('/', async (req, res) => {
			const obj = {
				source: req.body.source,
				type: req.body.type,
				data: req.body.data
			};

			this.addSource(obj);
		});

		router.get('/delete/:id', async (req, res) => {
			this.deleteSource(req.params.id);
		});

		router.get('/status', (req, res) => {
			res.json({running: this.pauseSemaphore.resolved});
		});

		router.get('/pause', (req, res) => {
			if(this.pauseSemaphore.resolved) {
				this.pauseSemaphore = createSemaphore();
			}
		});

		router.get('/unpause', (req, res) => {
			if(!this.pauseSemaphore.resolved) {
				this.pauseSemaphore.resolve();
			}
		});

		return router;
	}

	deleteSource(id) {
		this.sources.remove({_id: id}, {}, (err, doc) => {
			log.success('removed source', id, doc);
		})
	}

	addSource(obj) {
		this.sources.insert(obj, (err, doc) => {
			log.success('added source', obj);
		})
	}

	getSources() {
		return new Promise(res => {
			this.sources.find({}, (err, docs) => res(docs));
		})
	}

	async connected () {
		await new Promise(res => {
			this.sources.loadDatabase(() => {
				res();
			});
		});

		this.sources.persistence.setAutocompactionInterval(10000);

		const loop = async () => {
			// log.watch(`checking for new content...`);

			this.sources.find({}, async (err, docs) => {
				for(const doc of docs) {
					if(this.pauseSemaphore.resolved === false) {
						log.info('cron has been paused');
						await this.pauseSemaphore;
						log.info('cron unpaused');
					}
					log.info(`${doc.source}:${doc.type}:${doc.data}`)
					switch(doc.type) {
						case 'history':
						case 'user': {
							const username = doc.data;
							// log.watch('checking ' + username + ' recently viewed')
							const videos = (await pornhub.getRecentlyViewed(username));
							for(const vid of videos) {
								await this._links.Videos.addVideo(vid)
							}
							break;
						}
					}
				}
				
				setTimeout(loop, 1000);
			})
		};
		
		if(process.argv.indexOf('--disable-cron') === -1){
			//unpause it, if we're goin
			this.pauseSemaphore.resolve();
		}
		log.info('cron starting (paused: ' + !this.pauseSemaphore.resolved + ')')
		setTimeout(loop, 0);
	}
}