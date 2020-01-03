const nedb = require('nedb');
const {Signale} = require('signale');
const log = new Signale({
	scope: 'VIDS'
});
const chalk = require('chalk')
const express = require('express');
const fs = require('fs');
const Video = require('./../lib/Video.js');

module.exports = class Videos {
	getRouter() {
		// this.restServer = restServer;
		const router = express.Router();

		// Car brands page
		router.get('/', async (req, res) => {
			res.json(await this.getVideos(20));
		});

		router.get('/stream/:vid', (req, res) => {
			res.setHeader("WWW-Authenticate", "Basic");
			// res.contentType = 'video/mp4'
			
			this._links.Videos.database.findOne({vid: req.params.vid}, (err, doc) => {
				try {
					if(err || !doc || doc.length == 0) {
						res.statusCode = 404;
						res.write('Video not found!\n\nERR: ');
						res.write(JSON.stringify(err, null, 2));
						res.write("\n\nDOC: ");
						res.write(JSON.stringify(doc, null, 2));
						return res.end();
					}
					const path = doc.filepath;
					if(!fs.existsSync(path)) {
						this._links.Videos.update({vid: req.params.vid}, doc => {
							return {
								...doc,
								downloaded: false
							}
						})
						res.statusCode = 204;
						return res.end();
					}
					const stat = fs.statSync(path);
					const fileSize = stat.size;
					const range = req.headers.range;
					if (range) {
						const parts = range.replace(/bytes=/, "").split("-")
						const start = parseInt(parts[0], 10);
						const end = parts[1] 
							? parseInt(parts[1], 10)
							: fileSize-1;
						const chunksize = (end-start)+1;
						const file = fs.createReadStream(path, {start, end});
						const head = {
							'Content-Range': `bytes ${start}-${end}/${fileSize}`,
							'Accept-Ranges': 'bytes',
							'Content-Length': chunksize,
							'Content-Type': 'video/mp4',
						}
						res.writeHead(206, head);
						file.pipe(res);
					} else {
						const head = {
							'Content-Length': fileSize,
							'Content-Type': 'video/mp4',
						};
						res.writeHead(200, head);
						fs.createReadStream(path).pipe(res);
					}
				
				} catch (e) {
					res.statusCode = 500;
					res.write(JSON.stringify(err, null, 2));
					res.write("\n\n");
					res.write(JSON.stringify(doc, null, 2));
					res.write("\n\n");
					res.end(e.stack);
				}

			});
		});

		router.post('/:vid', (req, res) => {
			this.addVideo(req.params.vid);
			res.json({});
		})

		return router;
	}

	async start() {
		// await new Promise(res => setTimeout(res, 3000));

		// console.log(__dirname);
		this.database = new nedb({
			filename: `videos.nedb`
		});
		await new Promise(res => {
			this.database.loadDatabase(() => {
				res();
			});
		});
		
	}

	async migrate(search, transform) {

		let videos = await new Promise(res => {
			this.database.find(search, (err, docs) => {
				res(docs);
			})
		})

		videos = videos.map(transform).map(doc => {
			return {
				...doc,
				_id: undefined
			}
		});

		for(let video of videos) {
			await new Promise(res => {
				this.database.insert(video, _ => res());
			})
		}

		await new Promise(res => {
			this.database.remove(search, {multi: true}, _ => res())
		});

		await this.database.persistence.compactDatafile();

		if(videos.length > 0)
			log.success(chalk.blue('migrated ' + videos.length + ' videos'), search);
		else
			log.note('migrated ' + videos.length + ' videos', search);

	}

	async update(search, transform) {

		let videos = await new Promise(res => {
			this.database.find(search, (err, docs) => {
				res(docs);
			})
		})

		const oldIds = videos.map(video => video._id);

		videos = videos.map(transform).map(doc => {
			return {
				...doc,
				_id: undefined
			}
		});

		for(let video of videos) {
			await new Promise(res => {
				this.database.insert(video, _ => res());
			})
		}

		await new Promise(res => {
			this.database.remove({
				_id: { $in: oldIds }
			}, {multi: true}, _ => res())
		});

		await this.database.persistence.compactDatafile();

		log.success('updated ' + videos.length + ' videos', search);

	}

	async connected() {
		(async () => {
			log.info(`sanity checking database...`);
			const startTime = new Date().getTime();
			// const vids = await new Promise(res => {
			// 	this.database.find({}, (err, docs) => {
			// 		res(docs.map(v => v._id));
			// 	})
			// });
			//UPDATE VID VALUE TO _ID VALUE, REPLACE OLD ID, AND ADD SOURCE
			
			await this.migrate({
				vid: {$exists: false}
			}, doc => {
				return {
					...doc,
					vid: doc._id
				}
			})
			// NORMALIZE THE DOWNLOADED PARAMETER
			await this.migrate({
				filepath: null,
				downloaded: true
			}, doc => {
				return {
					...doc,
					downloaded: false
				}
			})
			await this.migrate({
				addedTimestamp: {$exists: false}
			}, doc => {
				return {
					...doc,
					addedTimestamp: new Date().getTime()
				}
			})
			await this.migrate({
				filepath: {$exists: false}
			}, doc => {
				return {
					...doc,
					filepath: null
				}
			})
			await this.migrate({
				downloaded: {$exists: false}
			}, doc => {
				return {
					...doc,
					downloaded: !!doc.filepath
				}
			})
			await this.migrate({
				source: {$exists: false}
			}, doc => {
				return {
					...doc,
					source: {
						source: 'pornhub',
						type: 'unknown',
						data: 'unknown'
					}
				}
			})
			await this.migrate({
				source: 'pornhub'
			}, doc => {
				return {
					...doc,
					source: {
						source: 'pornhub',
						type: 'unknown',
						data: 'unknown'
					}
				}
			})
			await this.migrate({
				source: 'chaturbate'
			}, doc => {
				return {
					...doc,
					source: {
						source: 'chaturbate',
						type: 'unknown',
						data: 'unknown'
					}
				}
			})
			await this.migrate({
				transcode: {$exists: true}
			}, doc => {
				return {
					...doc,
					transcode: undefined
				}
			})

			const videos = await this.getVideos();
			
			// const videos = await this.getVideos();
			// log.info('here?????')
			// const startup = new progress.Bar({}, progress.Presets.rect);
			// startup.start(vids.length, 0);
			
			// for(const doc of videos) {
			// 	const newDoc = {
			// 		...doc
			// 	}
			// 	newDoc.vid = doc._id;
			// 	newDoc.source = 'pornhub';
			// 	newDoc._id = undefined;
			// 	await new Promise(res => {
			// 		this.database.insert(newDoc, (err, doc) => {
			// 			res();
			// 		});
			// 	});
			// }
			

			// for(const video of videos) {
			// 	await this.addVideo(video);
			// }
			log.success(`checked ${videos.length} vids ${(new Date().getTime() - startTime) / 1000}s`);
		})();
		// startup.stop();
	}

	async videoFromVid(source, vid) {
		return (await new Promise((res => {
			this.database.findOne({
				vid
			}, (err, doc) => {
				if(doc) res(new Video(doc));
				else res(null);
			})
		})));
	}

	async getVideos(limit = Number.POSITIVE_INFINITY) {
		return await new Promise(res => {
			this.database.find({
				source: {$exists: true},
				vid: {$exists: true},
				downloaded: true,
				// source: 'chaturbate'
			}).sort({addedTimestamp: -1}).limit(limit).exec((err, docs) => {

				if(!err && docs) res(docs.map(doc => {
					return new Video(doc);
				}));
				else {
					log.error('y\'alls muthafuckas need jesus', err)
					rej(null);
				}
			})
		})
	}

	async exists(source, vid) {
		return (await new Promise((res => {
			this.database.findOne({
				vid,
				source
			}, (err, doc) => {
				if(doc) res(true);
				else res(false);
			})
		})));
	}

	async addVideo(video) {
		{ // TYPECHECKING
			if(video === null) throw new TypeError('expected Video, got null');
			if(typeof video !== 'object') throw new TypeError('expected Video, got ' + typeof video);
			if(!(video instanceof Video)) throw new TypeError('expected Video, got ' + video.__proto__.constructor.name);
		}


		// if it doesnt yet exist
		if(!(await this.exists(video.source, video.vid))) {
			//make it

			await new Promise((res, rej) => {
				this.database.insert(video, (err, doc) => {
					if(err) return rej(err);
					else res(doc);
				});
			});
		}

		if(video.downloaded || video.filepath) return;

		// try {
		// this.Util.printVideo(vid);
		// TODO why does this try to download AGAIN???
		// lol no this is the downloader, GOTEM
		let filepath;
		try {
			filepath = await this._links.Util.downloadVideo(video.vid);
			// if(typeof filepath === 'string') {
			// 	log.debug('downloaded', video.title);
			// }
			await new Promise((res, rej) => {
				this.database.update(
					video,
					{
						$set: {
							downloaded:true,
							filepath
						}
					},
					{},
					(err) => {
						if(err) return rej(err);
						else res();
					}
				);
			});
		} catch(e) {
			if(e instanceof this._links.Util.errors.E_VIDEO_PAID_PRIVATE_OR_DELETED) {
				log.error(video.title + ' got DELeTED');
			} else if (e instanceof this._links.Util.errors.E_INVALID_VIDEO_ID) {
				log.error(video.title + ' inVALID');
			} else if (e instanceof this._links.Util.errors.E_UNEXPECTED_HTTP_403) {
				log.error('403\'d on ' + video.title)
			} else if (e instanceof this._links.Util.errors.E_YOUTUBE_DL_UNEXPECTED_TERMINATION) {
				log.error('literally no idea what happened to ' + video.title);
			} else {
				log.error(e)
			}
		}

	}

	async stop() {
		this.database.persistence.compactDatafile()
		await new Promise(res => this.database.once('compaction.done', res));
	}
	// } catch(e) {
	// 	// log.error(e);
}

	
