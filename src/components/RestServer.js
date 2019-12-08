const express = require('express');
const log = new (require('signale').Signale)({
	scope: 'HTTP'
});
const fs = require('fs');

module.exports = class RestServer{
	constructor() {
	}

	async start() {
		log.info('Starting API on port ' + this._data.port);
	}

	async connected() {
		this.app = express();

		for(const route in this._data.routes) {
			const link = this._data.routes[route];
			const routePath = `/api/${route}`;

			if (!('getRouter' in this._links[link])) {
				log.warn('getRouter not defined for route ' + route);
				continue;
			}

			const router = this._links[link].getRouter();
			this.app.use(routePath, router);
			log.success('route ' + routePath)
		}

		const staticFolder = this._data.static || './dist';
		this.app.use(express.static(staticFolder, {
			"extensions": ["html"]
		}))


		this.app.listen(this._data.port);
	}
}