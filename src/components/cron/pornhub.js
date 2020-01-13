const log = new (require('signale').Signale)({
	scope: 'PHCR'
});
const pornhub = require('./../../lib/pornhub.js');
const Video = require('./../../lib/Video.js');

class PornhubCron {
	static cap = 2;

	async stop() {
		
	}

	async * evoke() {
		const username = this._data.data;
		switch(this._data.type) {
			case 'history':
			case 'views':
			case 'user': {
				while(true) {
					let count = -1;
					let videos = [];
					for(let page = 1; count !== 0 && page < PornhubCron.cap; page ++) {
						let newVideos = await pornhub.getRecentlyViewed(username, {page});
						count = newVideos.length;
						videos.push(...newVideos);
						yield;
					}
					for(const vid of videos) {
						await this.addVideo(vid);
						yield;
					}
				}
				break;
			}
			case 'uploads': {
				let count = -1;
				let videos = [];
				for(let page = 1; count !== 0 && page < PornhubCron.cap; page ++) {
					// log.info('page', page);
					let newVideos = await pornhub.getUploads(username, {page});
					count = newVideos.length;
					videos.push(...newVideos);
					yield;
				}
				for (const vid of videos) {
					await this.addVideo(vid)
					yield;
				}
				break;
			}
		}
	}

	async addVideo(vid) {
		try {
			const details = {
				...await this._links.Details.videoDetails(vid),
				source: {
					source: 'pornhub',
					type: this._data.type,
					data: this._data.data
				},
				downloaded: false,
				filepath: null,
				addedTimestamp: new Date().getTime()
			};
			const video = new Video(details);

			await this._links.Videos.addVideo(video)
		} catch(e) {
			if(e instanceof this._links.Details.errors.E_VIDEO_NOT_FOUND) {
				// TODO figure out why these fail. like, paid? private? deleted?
				return;
			}
			log.error(e);
		}
	}

	toString() {
		return `pornhub:${this._data.type}/${this._data.data}`;
	}
}

module.exports = PornhubCron