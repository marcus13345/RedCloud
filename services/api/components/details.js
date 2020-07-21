const pornhub = require('../lib/pornhub.js');
const Database = require('nedb');
const log = __signale.scope(__options.app.output.emoji ? '📋' : 'DTLS');
const createErrorClass = require('../customError.js')
const E_VIDEO_NOT_FOUND = createErrorClass('E_VIDEO_NOT_FOUND');

// TODO this whole thing should be a lib, supporting pornhub deatils
// not its own top level entity...

module.exports = class Details extends require('./component') {
	get errors(){
		return {
			E_VIDEO_NOT_FOUND
		}
	}

	async videoDetails(vid) {
		// await new Promise(res => setTimeout(res, 10));
		// log.info('asdfasdfasdfasdf')

		let cacheDetails = await new Promise(res => {
			this.db.findOne({
				vid
			}, (err, doc) => {
				res(doc);
			})
		});
// log.info('asdfasdfasdfasdf')
		if(cacheDetails) {
			//TODO this is probably not the right check lol. maybe check if title is there or somethin
			if(Object.keys(cacheDetails).length <= 2) {
				// console.log('we throwin')
				throw new E_VIDEO_NOT_FOUND();
			}
			else {
				// console.log('cache is there ' + cacheDetails.title);
				// console.dir(cacheDetails)
				return cacheDetails;
			}
		}

		const url = `https://www.pornhub.com/view_video.php?viewkey=${vid}`;

		try {
			let details = await new Promise((res, rej) => {
				pornhub.details(url, (err, details) => {
					// console.dir(details)
					if(err) {
						// console.log(`Failed to get details for ${vid}`);
						return rej(new E_VIDEO_NOT_FOUND());
					}
					// log.info(`cached [[${details.title}]]`)
					// log.info('asdfasdfasdfasdf')
					this.db.update({_id: vid}, {
						_id: vid,
						vid,
						...details
					}, {upsert: true}, _ => {
						res({
							...details,
							vid
						});
					})
				});

			});
			// log.info('asdfasdfasdfasdf')
			if(Object.keys(details).length < 2) throw new E_VIDEO_NOT_FOUND()
			return details;
		}catch(e) {
			throw e;
		}


	}
}

		// Errors: {
		// 	E_VIDEO_NOT_FOUND
		// }