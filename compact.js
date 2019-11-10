const Datastore = require('nedb');
const fs = require('fs')

const db = new Datastore({
	filename: 'videos.nedb'
});

fs.copyFileSync('videos.nedb', `backups/videos-${new Date().getTime()}.nedb`)


;(async () => {

	// console.log('asdf');
	await new Promise(res => {
		db.loadDatabase(() => {
			res();
		});
	});
	// console.log('asdf');

	db.find({}, async (err, docs) => {
		for(const vid of docs) {
			// console.log(vid);
			if(!('filepath' in vid)) {
				// console.log(vid.title);
				// console.log('^^ shits broked AF');
				continue;
			}

			await new Promise(res => {
				let date = fs.statSync(vid.filepath).mtime;
				console.log(date);
				db.update({
					...vid,
				}, {
					$set: {
						addedTimestamp: date.getTime()
					}
				}, {}, _ => {
					res();
				});
			})
		}
	});
	// console.log('asdf');

})();