const Router = require('express').Router;
const bodyParser = require('body-parser');
const fss = require('fast-safe-stringify');
const log = new (require('signale').Signale)({
	scope: 'EVAL'
});

module.exports = class Eval {
	constructor() {}

	library = {};

	getRouter() {
		const router = Router();

		const that = this;

		router.post('/', bodyParser.text(), async (req, res) => {
			let str = `(function() {

				${Object.keys(this.library).map(v => `const ${v} = that.library.${v};`).join('\n')}
				
				return ${req.body}

			})()`;
			console.log(str);
			let output = eval(str);
			res.json(fss(output, null, 2));
		})

		return router;
	}

	async start() {}

	async connected() {
		for(const linkName in this._links) {
			const link = this._links[linkName];
			if('getLibrary' in link) {
				this.library = {
					...this.library,
					...link.getLibrary()
				}
			}
		}
		console.dir(this.library);
	}
}