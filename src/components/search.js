const pornhub = require('./../lib/pornhub.js');
const express = require('express');
const {Signale} = require('signale');
const log = new Signale({
	scope: '🔍'
});

module.exports = class Search {
	getRouter() {
		const router = express.Router();

		router.get('/:search', async (req, res) => {
			let results = await this.search(req.params.search, req.query.page || 1);
			res.end(JSON.stringify(results, null, 2))
		})

		return router;
	}

	async connected() {
		log.info('Search connected')
	}

	async search(str, page) {
		return await new Promise(async (res) => {
			pornhub.search({
				search: str,
				page
			}, async (err, results) => {
				let arr = [], promises = [];
				for(const result of results) {
					promises.push(new Promise(async (res) => {
						let details = await this._links.Details.videoDetails(result.vid);

						this._links.Videos.database.findOne({_id: result.vid}, (err, doc) => {
							// console.log(err, doc)
							if(err || !doc || doc.length === 0) {
								details.downloaded = false;
							} else {
								details.downloaded = true;
							}
							arr.push(details);
							res();
						})
					}));
				}
				await Promise.all(promises);
				// console.log(arr.length)
				res(arr);
			})
		});
	}
}