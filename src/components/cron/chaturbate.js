const uuid = require('uuid/v4');
const chaturbate = require('./../../lib/chaturbate.js')
const log = new (require('signale').Signale)({
	scope: 'CBCR'
});
const Video = require('./../../lib/Video.js');
const path = require('path');
const fs = require('fs');

module.exports = class ChaturbateCron {
	online = false;

	async evoke() {

		const online = await chaturbate.online(this._data.data);

		if(online && !this.online) {
			this.startRecording();
		}

		this.online = online;
	}

	async startRecording() {
		try {
			try {
				fs.mkdirSync(`./vids/`);
			} catch (e) { ''; }
			try {
				fs.mkdirSync(`./vids/transcode/`);
			} catch (e) { ''; }

			const vid = uuid();
			const addedTimestamp = new Date().getTime();
			const title = `${this._data.data} - ${addedTimestamp.toLocaleString()}`;
			const filepath = `vids/transcode/${vid}.stream.mp4`;
			const recorder = chaturbate.record(this._data.data, filepath);

			try {
				const video = new Video({
					source: 'chaturbate',
					vid, title, duration: null,
					tags: null,
					thumb: null,
					html: null,
					downloaded: false,
					transcode: false,
					addedTimestamp,
					filepath,
				});

				await this._links.Videos.addVideo(video)
			} catch(e) {
				log.error(e);
			}

			log.debug('now recording ' + this._data.data);
			recorder.on('done', async () => {
				this.online = false;
				log.debug('finished recording ' + this._data.data);


			})

		} catch (e) {
			log.error(e);
			this.online = false;
		}
	}
	
}