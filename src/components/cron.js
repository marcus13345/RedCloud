const pornhub = require('../lib/pornhub.js');
const nedb = require('nedb');
const express = require('express');
const Video = require('./../lib/Video.js');
const {Signale} = require('signale');
const bodyParser = require('body-parser');
const createSemaphore = require('./../lib/semaphore.js')
const log = new Signale({
	scope: 'CRON'
});

module.exports = class PornhubAdapter {

	cronTasks = [];

	constructor() {
		this.sources = new nedb({
			filename: `sources.nedb`
		});
		this.pauseSemaphore = createSemaphore();
	}

	getLibrary() {
		return {
			cron: this
		}
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
		});
		// TODO remove this task from this.cronTasks
	}

	addSource(obj) {
		this.sources.insert(obj, async (err, doc) => {
			await this.addCronTask(obj.source, obj.type, obj.data)
			log.success('added source', obj);
		})
	}

	getSources() {
		return new Promise(res => {
			this.sources.find({}, (err, docs) => res(docs));
		})
	}

	// todo lol
	async addCronTask(source, type, data) {
		this._data.cron.types[source]
		this.cronTasks.push();
	}

	async connected () {
		log.info('Cron connected');

		// load database and set it to maintain itself
		await new Promise(res => this.sources.loadDatabase(res));
		this.sources.persistence.setAutocompactionInterval(10000);

		// contruct the list of cronTasks
		await new Promise((res) => {
			this.sources.find({}, async (err, sources) => {
				for(const source of sources) {
					const sourceType = source.source;
					const cronClass = this._data.cron.types[sourceType];
					const cronTask = await this._collexion.createInstance({
						Code: cronClass,
						Data: {
							data: source.data,
							type: source.type
						}
					});
					this.cronTasks.push(cronTask);
				}
				res();
			});
		});

		// unpause it, if we dont specify to disable cron
		if (process.argv.indexOf('--disable-cron') === -1)
			this.pauseSemaphore.resolve();

		// boot up the cron loop
		log.info(`cron starting (paused: ${!this.pauseSemaphore.resolved})`);
		setTimeout(this.cronLoop.bind(this), 0);
	}

	async cronLoop() {
		for(const task of this.cronTasks) {
			if(this.pauseSemaphore.resolved === false) {
				log.info('cron has been paused');
				await this.pauseSemaphore;
				log.info('cron unpaused');
			}

			// tell the task it should run
			await task.evoke();

			// give it a sec to cool down
			await new Promise(res => setTimeout(res, 1000));
		}
		
		setTimeout(this.cronLoop.bind(this), 0);
	}
}