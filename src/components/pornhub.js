module.exports = class PornhubAdapter {
	constructor() {
		this.aliasesdb = new nedb({
			filename: `aliases.nedb`
		});
		this.sources = new nedb({
			filename: `sources.nedb`
		});
	}

	async connected () {
		await new Promise(res => {
			this.aliasesdb.loadDatabase(() => {
				res();
			});
		});
		await new Promise(res => {
			this.sources.loadDatabase(() => {
				res();
			});
		});

		this.sources.persistence.setAutocompactionInterval(10000);
		this.aliasesdb.persistence.setAutocompactionInterval(10000);

		setTimeout(loop, 0)
		async function loop(_) {
			// log.watch(`checking for new content...`);

			this.sources.find({}, async (err, docs) => {
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
	}
}