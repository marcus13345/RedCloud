const pornhub = require('./../lib/pornhub.js');
const nedb = require('nedb');
const express = require('express');
const {Signale} = require('signale');
const bodyParser = require('body-parser');
const log = new Signale({
	scope: 'SRCS'
});

module.exports = class PornhubAdapter {
	constructor() {
		this.sources = new nedb({
			filename: `sources.nedb`
		});
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
		})

		return router;
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
					switch(doc.type) {
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

		setTimeout(loop, 0);
	}
}