const uuid = require('uuid/v4');
const chaturbate = require('./../../lib/chaturbate.js')
const log = new (require('signale').Signale)({
	scope: 'CBCR'
});
const Video = require('./../../lib/Video.js');
const path = require('path');
const fs = require('fs');

const { spawn } = require('child_process');

module.exports = class ChaturbateCron {
	online = false;

	async stop() {
		try {
			this.currentRecorder.kill();
		} catch (e) {
			
		}
	}

	async start() {
		const username = this._data.data;
		try {
			fs.mkdirSync(`./vids/`);
		} catch (e) { ''; }
		try {
			fs.mkdirSync(`./temp/`);
		} catch (e) { ''; }
		try {
			fs.mkdirSync(`./temp/chaturbate/`);
		} catch (e) { ''; }
		try {
			fs.mkdirSync(`./temp/chaturbate/${username}/`);
		} catch (e) { ''; }
	}

	async connected () {
		const username = this._data.data;
		try {
			fs.readdir(`./temp/chaturbate/${username}/`, async (err, files) => {
				for(const file of files) {
					const vid = path.parse(file).name;
					const video = await this._links.Videos.videoFromVid('chaturbate', vid);
					// log.info(video)
					if(video === null) log.debug(vid)
					this.queueTranscode(video);
				}
			})
		} catch (e) {
			log.error(e);
		}
	}

	/**
	 * @param {Video} video
	 */
	async queueTranscode(video) {
		const inputFile = video.filepath;
		const outputFile = `vids/${path.parse(video.filepath).base}`;
		const success = await this._links.Util.transcode(inputFile, outputFile);

		if(!success) return;

		await this._links.Videos.update({
			'source.source': 'chaturbate',
			vid: video.vid
		}, doc => {
			const obj = {
				...doc,
				downloaded: true,
				filepath: outputFile
			}
			return obj;
		});

		fs.unlink(inputFile, _ => _);

		log.success('transcoded', video.title);
		// log.info(queueSize, 'videos left in the queue');
	}

	async * evoke() {
		while(true) {
			if(this.online) {
				// if we're online, were recording (probably) (i really hope)
				yield;
				continue;
			}

			const online = await chaturbate.online(this._data.data);

			if(online) {
				this.startRecording();
			}

			this.online = online;
			yield;
		}
	}

	async startRecording() {
		try {
			const username = this._data.data;

			const vid = uuid();
			const addedTimestamp = new Date();
			const title = `${username} - ${addedTimestamp.toLocaleString()}`;
			const filepath = `temp/chaturbate/${username}/${vid}.mp4`;
			const recorder = chaturbate.record(username, filepath);
			this.currentRecorder = recorder;

			const video = new Video({
				source: {
					source: 'chaturbate',
					type: 'stream',
					data: this._data.data
				},
				vid, title, duration: null,
				tags: null,
				thumb: null,
				html: null,
				downloaded: false,
				addedTimestamp: addedTimestamp.getTime(),
				filepath,
			});

			await this._links.Videos.addVideo(video)

			log.info('now recording ' + username);
			recorder.on('done', async () => {
				this.online = false;
				log.success('finished recording ' + username);

				this.queueTranscode(video)
			})

		} catch(e) {
			log.error(e);
			this.online = false;
		}
	}

	toString() {
		return `chaturbate:${this._data.type}/${this._data.data}`;
	}
}