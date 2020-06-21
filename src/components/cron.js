const pornhub = require('../lib/pornhub.js');
const nedb = require('nedb');
const express = require('express');
const Video = require('./../lib/Video.js');
const bodyParser = require('body-parser');
const createSemaphore = require('./../lib/semaphore.js');
const __options = require('../../options');
const disableCron = !__options.app.cron;
const log = __signale.scope(__options.app.output.emoji ? '⏰' : 'CRON');
const uuid = require('uuid').v4;

module.exports = class Cron extends require('./component') {

	cronTasks = {};
	generators = {};

	constructor() {
		super();
		this.db = new nedb({
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

			res.json({});
		});

		router.get('/delete/:id', async (req, res) => {
			this.deleteSource(req.params.id);
		});

		router.get('/status', (req, res) => {
			res.json({running: this.pauseSemaphore.resolved});
		});

		router.get('/pause', (req, res) => this.pauseSemaphore.bind(this));

		router.get('/unpause', (req, res) => {
			if(!this.pauseSemaphore.resolved) {
				this.pauseSemaphore.resolve();
			}
		});

		return router;
	}

	deleteSource(id) {
		this.db.remove({_id: id}, {}, (err, doc) => {
			log.success('removed source', id, doc);
		});
		// TODO remove this task from this.cronTasks
	}

	addSource(obj) {
		this.db.insert(obj, async (err, doc) => {
			await this.createJob(obj.source, obj.type, obj.data)
			log.success('added source', obj);
		})
	}

	getSources() {
		return new Promise(res => {
			this.db.find({}, (err, docs) => res(docs));
		})
	}

	// todo lol
	// WHY LOL????? NO SERIOUSLY. WHY LOL.
	// FUCKING CHRIST PAST ME, E X P L A I N Y O U R S E L F
	async createJob(source, type, data) {
		const id = uuid();
		
		// make sure we can handle the cron type
		const sourceType = source;
		if(!(sourceType in this._data.cron.types)) {
			log.warn('unknown source', source);
			return null
		}

		// obtain the cron job code, and create a collexion instance.
		const cronClass = this._data.cron.types[sourceType];
		const cronTask = await this._collexion.createInstance({
			Code: cronClass,
			Data: {
				data: data,
				type: type
			}
		});

		// add the instance to our cron tasks for tracking.
		this.cronTasks[id] = cronTask;

		// get the generator, and track it as well
		const generator = cronTask.evoke()
		this.generators[id] = generator;

		return id;
	}

	async connected () {

		// load database and set it to maintain itself
		// in what way is this setting the database to maintain itself?
		await new Promise(res => this.db.loadDatabase(res));

		// contruct the list of cronTasks
		const sources = await new Promise((res) => {
			this.db.find({}, async (err, sources) => {
				res(sources);
			});
		});

		for(const source of sources) {
			await this.createJob(source.source, source.type, source.data)
		}

		// log.debug('YARR', process.yargv);
		// unpause it, if we dont specify to disable cron
		if (!disableCron)
			this.pauseSemaphore.resolve();

		// boot up the cron loop
		log.info(`cron starting (paused: ${!this.pauseSemaphore.resolved})`);
		setTimeout(this.cronLoop.bind(this), 0);
	}

	// await this method to signify a stopping point for pausing
	async pausePoint() {
		if(this.pauseSemaphore.resolved === false) {
			log.success('cron has been paused');
			// this.emitter.emit('paused');
			await this.pauseSemaphore;
			log.success('cron unpaused');
		}
	}

	async cronLoop() {
		await this.pausePoint();
		for(const id in this.generators) {
			await this.pausePoint();
			const generator = this.generators[id];
			const taskInstance = this.cronTasks[id];

			// this wont save infinite loops, but in cases where
			// it gets stuck on a required event or some other async
			// issue, thisll pop after 10 seconds waiting on the 
			// task generator
			const timeout = setTimeout(_ => {
				log.warn('cron task taking too long', taskInstance._data)
			}, 10 * 10000);

			// tell the task it should run
			await generator.next();

			// cancel the timeout error from popping
			clearTimeout(timeout);

			// give it a sec to cool down
			// await new Promise(res => setTimeout(res, 1000));
		}

		setTimeout(this.cronLoop.bind(this), 0);
	}

	pause() {
		log.info('cron pause signal sent')
		if(this.pauseSemaphore.resolved) {
			this.pauseSemaphore = createSemaphore();
		} else {
		}
	}

	async stop() {
		this.pause();
		for(const job of this.cronTasks) {
			await job.stop();
		}
		this.db.persistence.compactDatafile()
		await new Promise(res => this.db.once('compaction.done', res));
	}
}