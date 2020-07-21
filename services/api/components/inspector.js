const { Router } = require('express');
const fss = require('fast-safe-stringify');

module.exports = class Inspector {
	getRouter() {
		const router = new Router();

		router.get('/', (req, res) => {
			res.set('Content-Type', 'application/json');
			res.send(fss(this._collexion));
		});

		return router;
	}
}