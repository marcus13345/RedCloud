const log = new (require('signale').Signale)({
	scope: 'PHCR'
});
const pornhub = require('./../../lib/pornhub.js');
const Video = require('./../../lib/Video.js');

class PornhubCron {
	static cap = 10;

	async evoke() {
		const username = this._data.data;
		switch(this._data.type) {
			case 'history':
			case 'user': {
				let count = -1;
				let videos = [];
				for(let page = 1; count !== 0 && page < PornhubCron.cap; page ++) {
					let newVideos = await pornhub.getRecentlyViewed(username, {page});
					count = newVideos.length;
					videos.push(...newVideos);
				}
				for(const vid of videos) {
					await this.addVideo(vid);
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
				}
				for(const vid of videos) {
					await this._links.Videos.addVideoByVid(vid)
				}
				break;
			}
		}
	}

	async addVideo(vid) {
		try {
			const details = {
				...await this._links.Details.videoDetails(vid),
				source: 'pornhub',
				downloaded: false,
				filepath: null,
				addedTimestamp: new Date().getTime()
			};
			const video = new Video(details);

			await this._links.Videos.addVideo(video)
		} catch(e) {
			log.error(e);
		}
	}
}

module.exports = PornhubCron