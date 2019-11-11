const nedb = require('nedb');
const {Signale} = require('signale');
const log = new Signale({
	scope: 'VIDS'
});
const express = require('express');
const fs = require('fs');

// const progress = require('cli-progress');

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
			
			this._links.Videos.database.findOne({_id: req.params.vid}, (err, doc) => {
				if(err || !doc || doc.length == 0) {
					return res.end('Video Not Downloaded!')
				}
				const path = doc.filepath;
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

		console.log(__dirname);
		this.database = new nedb({
			filename: `videos.nedb`
		});
		await new Promise(res => {
			this.database.loadDatabase(() => {
				res();
			});
		});
		this.database.persistence.setAutocompactionInterval(10000);
		
	}

	async connected() {
		const videos = await new Promise(res => {
			this.database.find({}, (err, docs) => {
				res(docs.map(v => v._id));
			})
		});
		// log.info('here?????')
		// const startup = new progress.Bar({}, progress.Presets.rect);
		log.info(`sanity checking database...`);
		// startup.start(videos.length, 0);
		
		
		const startTime = new Date().getTime();
		let i = 0;
		for(const vid of videos) {
			await this.addVideo(vid);
			i ++;
			// startup.update(i);
		}
		log.success(`checked ${videos.length} videos ${(new Date().getTime() - startTime) / 1000}s`);
		// startup.stop();
	}

	getVideos(limit = Number.POSITIVE_INFINITY) {
		return new Promise(res => {
			this.database.find({}).sort({addedTimestamp: -1}).limit(limit).exec((err, docs) => {
				if(docs) res(docs);
				else rej('lol idk');
			})
		})
	}

	async addVideo(vid) {
		// console.dir(this)
		let details;
		try {
			details = await this._links.Details.videoDetails(vid);
		} catch (e) {
			//TODO the video was probably removed, or never existed if this fails. so its like,
			// PROBABLY not an issue.
			// log.error('50 ' + e)
			return;
		}
		
		// if it doesnt yet exist
		if(!(await new Promise((res => {
			this.database.findOne({
				_id: vid
			}, (err, doc) => {
				if(doc) res(true);
				else res(false);
			})
		})))) {
			//make it
			log.info('adding', vid)
			await new Promise((res, rej) => {
				this.database.insert({
					_id: vid,
					...details,
					addedTimestamp: new Date().getTime()
				}, (err, doc) => {
					if(err) return rej(err);
					else res(doc);
				});
			});
		}

		

		try {
			// this.Util.printVideo(vid);
			let filepath = await this._links.Util.downloadVideo(vid);
			await new Promise((res, rej) => {
				this.database.update({
					_id: vid
				}, {$set: {downloaded:true, filepath}}, {}, (err, count) => {
					if(err) return rej(err);
					else res(count);
				});
			});
		} catch(e) {
			log.error(e);
			// switch(e.constructor) {
			// 	case this.Util.E_VIDEO_PAID_PRIVATE_OR_DELETED: {
					
			// 		break;
			// 	}
			// 	case this.Util.E_UNEXPECTED_HTTP_403: {
					
			// 		break;
			// 	}
			// 	case this.Util.E_YOUTUBE_DL_UNEXPECTED_TERMINATION: {
					
			// 		break;
			// 	}
			// 	default: {
			// 		log.error(e)
			// 		break;
			// 	}
			// }
		}
	}

	
}