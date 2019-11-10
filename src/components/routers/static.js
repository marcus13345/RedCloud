const express = require('express');

module.exports = class VideosRouter {
	constructor(restServer) {
		this.restServer = restServer;
		this._router = express.Router();

		// Car brands page
		this._router.get('/', function(req, res) {
			res.send('Audi, BMW, Mercedes')
		});

		// Car models page
		// this._router.get('/add', function(req, res) {
		// 	res.send('Audi Q7, BMW X5, Mercedes GL')
		// });
	}

	connected() {
		console.log('videos router connected to restServer')
	}

	getRouter() {
		return this._router
	}
}