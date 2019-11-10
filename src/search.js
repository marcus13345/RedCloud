const pornhub = require('./pornhub.js');
const {videoDetails} = require('./details.js')

module.exports = {
	search: async function search(str, page, videsdb) {
		return await new Promise(async (res) => {
			pornhub.search({
				search: str,
				page
			}, async (err, results) => {
				let arr = [], promises = [];
				for(const result of results) {
					promises.push(new Promise(async (res) => {
						let details = await videoDetails(result.vid);

						videsdb.findOne({_id: result.vid}, (err, doc) => {
							console.log(err, doc)
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

