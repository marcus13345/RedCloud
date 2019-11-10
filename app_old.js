


const log = require('signale');
const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const __options = minimist(process.argv);
// const store = new (require('./JSONStore.js').JSONStore)(__options.store || 'store.json');

const {videoDetails, Errors: {E_VIDEO_NOT_FOUND}} = require('./src/details.js');
process.env.PATH += ';' + path.join(__dirname, 'phantomjs', 'bin')
process.env.PATH += ';' + path.join(__dirname, 'axel')

const {search} = require('./src/search.js');


const https = require('http');
// poop


async function addVideo(vid) {

	let details;
	try {
		details = await videoDetails(vid);
	} catch (e) {
		log.error(e)
		return;
	}
	
	// if it doesnt yet exist
	if(!(await new Promise((res => {
		database.findOne({
			_id: vid
		}, (err, doc) => {
			if(doc) res(true);
			else res(false);
		})
	})))) {
		//make it
		await new Promise((res, rej) => {
			database.insert({
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
		let filepath = await downloadVideo(vid);
		await new Promise((res, rej) => {
			database.update({
				_id: vid
			}, {$set: {downloaded:true, filepath}}, {}, (err, count) => {
				if(err) return rej(err);
				else res(count);
			});
		});
	} catch(e) {
		switch(e.constructor) {
			case E_VIDEO_PAID_PRIVATE_OR_DELETED: {
				
				break;
			}
			case E_UNEXPECTED_HTTP_403: {
				
				break;
			}
			case E_YOUTUBE_DL_UNEXPECTED_TERMINATION: {
				
				break;
			}
		}
	}
}



// begin run startup, and begin the store updating loop!!
;(async () => {

	await new Promise(res => {
		aliasesdb.loadDatabase(() => {
			res();
		});
	});
	await new Promise(res => {
		sources.loadDatabase(() => {
			res();
		});
	});
	
// log.info('here?????')
	

	sources.persistence.setAutocompactionInterval(10000);
	aliasesdb.persistence.setAutocompactionInterval(10000);

	setTimeout(loop, 0)
	async function loop(_) {
		// log.watch(`checking for new content...`);

		sources.find({}, async (err, docs) => {
			for(const doc of docs) {
				switch(doc.type) {
					case 'user': {
						const username = doc.username;
						// log.watch('checking ' + username + ' recently viewed')
						const videos = (await getRecentlyViewed(username));
						for(const vid of videos) {
							await addVideo(vid)
						}
						break;
					}
				}
			}
			setTimeout(loop, 1000);
		})
	}

})().catch((e) => {
	console.log()
	log.error(e);
})