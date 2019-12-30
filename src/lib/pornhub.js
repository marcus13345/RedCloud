const cheerio = require("cheerio"),
		https = require("https"),
		http = require("http"),
		qs = require("querystring"),
		URL = require("url");

const {Signale} = require('signale');
const log = new Signale({
	scope: 'PHUB'
});

var request = require('request');

const puppeteer = require('puppeteer');

var Entities = require('html-entities').XmlEntities;
 
var html_entities = new Entities();

var PornHub = module.exports;
var videoEmbedUrl = ({video_id}) => `http://www.pornhub.com/webmasters/video_embed_code?id=${video_id}`;
var videoInfoUrl = ({video_id, size}) => `http://www.pornhub.com/webmasters/video_by_id?id=${video_id}&thumbsize=${size}`;

PornHub.resolveId = function resolveId(id, cb) {
	if (typeof id !== "number") {
		return cb(Error("wrong type for id; expected number but got " + typeof id));
	}

	var get_info_url = videoInfoUrl({video_id: id, size: 'large_hd'});

	var req = http.get(get_info_url, function(res) {
		if (res.statusCode === 404) {
			return cb(Error("video not found"));
		}

		if (res.statusCode !== 301) {
			return cb(Error("incorrect status code; expected 301 but got " + res.statusCode));
		}

		return cb(null, res.headers.location);
	});

	req.once("error", cb);
};

PornHub.details = function details(url, cb) {
	var url_parsed = URL.parse(url, true);
	var video_id = url_parsed.query.viewkey;
	var url_opts = {
		video_id: video_id,
		size: 'large_hd'
	};

	var video_embed = videoInfoUrl(url_opts);
	
	var get_info_url = videoInfoUrl(url_opts);
	var get_embed_url = videoEmbedUrl(url_opts);

	request.get(get_info_url, function(err, res, body) {
			if (err) {
				return cb(err);
			}
			// console.log('res', res);
			if (res.statusCode === 404) {
				return cb(Error("pornhub: video not found"));
			}

			if (res.statusCode !== 200) {
				return cb(Error("pornhub: incorrect status code; expected 200 but got " + res.statusCode));
			}

			var data = body;
			if (typeof body === 'string') {
				data = JSON.parse(body);
			}

			// console.log('body', body);

			var title;
			if(!('video' in data)) return cb(new Error("unknown error"), null)
			title = data.video.title;

			var duration;
			duration = data.video.duration;

			var tags = [];
			for (var i = data.video.tags.length - 1; i >= 0; i--) {
				var tag = data.video.tags[i];
				tags.push(tag.tag_name);
			};

			var thumb;
			thumb = data.video.default_thumb;

			request.get(get_embed_url, function(err, res, body) {
				var data = body;
				if (typeof body === 'string') {
					data = JSON.parse(body);
				}

				// console.log("data", JSON.stringify(data, null, 2));

				var html;
				if (data.embed && data.embed.code) {
					html = html_entities.decode(data.embed.code);
				}
				return cb(null, {title: title, duration: duration, tags: tags, thumb: thumb, html: html}); 
			});

	});
};

PornHub.constructSearchUrl = function constructSearchUrl(parameters) {
	return "https://www.pornhub.com/webmasters/search?" + qs.stringify(parameters);
};

PornHub.search = function search(parameters, cb) {
	var req = https.get(this.constructSearchUrl(parameters), function(res) {
		var body = Buffer(0);

		res.on("readable", function() {
			var chunk;
			while (chunk = res.read()) {
				body = Buffer.concat([body, chunk]);
			}
		});


		if (res.statusCode !== 200) {
			return cb(Error("incorrect status code; expected 200 but got " + res.statusCode));
		}

		res.on("end", function() {
			body = body.toString("utf8");
			
			videos = JSON.parse(body).videos.map(v => { return {
				vid: v.video_id,
				title: v.title,
				tags: v.tags.map(v => v.tag_name),
				duration: v.duration,
				thumbnail: v.thumbs[0].src
			}})

			return cb(null, videos);
		});
	});

	req.once("error", cb);
};

PornHub.getRecentlyViewed = async function getRecentlyViewed(user, {authenticate = false, page: pageNumber = 1} = {}) {
	const browser = await puppeteer.launch({
		handleSIGINT: false
		// devtools: true
	});
	let videos = [];

	try {
		const page = await browser.newPage();
		await page.goto(`https://www.pornhub.com/users/${user}/videos/recent?page=${pageNumber}`);
		
		if(authenticate) {
			await page.waitForSelector('ul.videos#moreData');

			await page.evaluate(() => {
				let loginButton = document.querySelector('#headerLoginLink');
				loginButton.click();

			})

			await page.waitForNavigation();
			
			await page.waitForSelector('#submit');
			await page.evaluate(`
			let usernameInput = document.querySelector('#username');
			let passwordInput = document.querySelector('#password');
			usernameInput.value = '${cred.name}';
			passwordInput.value = '${cred.pass}';
			console.log('WAITING');
			setTimeout(() => {
				document.querySelector('#submit').click()
				console.log('CLICKED');
			}, 5000)`);
			// log.watch('logged in')
			await page.waitForNavigation();
		}

		try {
			await Promise.race([
				page.waitForSelector('ul.videos#moreData'),
				page.waitForSelector('.empty')
			]);

			// await new Promise(res => setTimeout(res, 10000))

			videos = await page.evaluate(() => {
				return (function map(children){
					let arr = [];
					for(let i = 0; i < children.length; i ++) {
						let e = children[i];
						arr.push(e.getAttribute('_vkey'))
					}
					return arr;
				})(document.querySelector('ul.videos#moreData').children)
			});
		} catch (e) {
			
		}

		// page.close();
	} catch (e) {
		log.error(e);
	}

	browser.close();

	await new Promise(res => {
		setTimeout(res, 3000);
	});
	return (videos);
}


PornHub.getUploads = async function getUploads(user, {authenticate = false, page: pageNumber = 1} = {}) {
	const browser = await puppeteer.launch({
		// devtools: true
	});
	let videos = [];

	try {
		const page = await browser.newPage();
		await page.goto(`https://www.pornhub.com/model/${user}/videos/upload?page=${pageNumber}`);
		
		if(authenticate) {
			await page.waitForSelector('ul.videos#moreData');

			await page.evaluate(() => {
				let loginButton = document.querySelector('#headerLoginLink');
				loginButton.click();

			})

			await page.waitForNavigation();
			
			await page.waitForSelector('#submit');
			await page.evaluate(`
			let usernameInput = document.querySelector('#username');
			let passwordInput = document.querySelector('#password');
			usernameInput.value = '${cred.name}';
			passwordInput.value = '${cred.pass}';
			console.log('WAITING');
			setTimeout(() => {
				document.querySelector('#submit').click()
				console.log('CLICKED');
			}, 5000)`);
			await page.waitForNavigation();
		}
		
		// log.watch('navigated to user');
		
		try {
			await Promise.race([
				page.waitForSelector('ul.videos#moreData'),
				page.waitForSelector('.empty'),
				page.waitForSelector('#streamContent')
			]);

			// await new Promise(res => setTimeout(res, 10000))

			videos = await page.evaluate(() => {
				return (function map(children){
					let arr = [];
					for(let i = 0; i < children.length; i ++) {
						let e = children[i];
						arr.push(e.getAttribute('_vkey'))
					}
					return arr;
				})(document.querySelector('ul.videos#moreData').children)
			});
		} catch (e) {
			
		}

	} catch (e) {
		log.error(e);
	}


	await new Promise(res => {
		setTimeout(res, 0);
	});
	browser.close();
	// log.watch(`waited 3 seconds`);

	return (videos);
}
PornHub.getPornstar = async function getPornstar(user, {authenticate = false, page: pageNumber = 1} = {}) {
	const browser = await puppeteer.launch({
		// devtools: true
	});
	let videos = [];

	try {
		const page = await browser.newPage();
		console.log("Searching for pro cum slut");
		await page.goto(`https://www.pornhub.com/pornstar/${user}/videos/upload?page=${pageNumber}`);
		
		if(authenticate) {
			await page.waitForSelector('ul.videos#moreData');

			await page.evaluate(() => {
				let loginButton = document.querySelector('#headerLoginLink');
				loginButton.click();

			})

			await page.waitForNavigation();
			
			await page.waitForSelector('#submit');
			await page.evaluate(`
			let usernameInput = document.querySelector('#username');
			let passwordInput = document.querySelector('#password');
			usernameInput.value = '${cred.name}';
			passwordInput.value = '${cred.pass}';
			console.log('WAITING');
			setTimeout(() => {
				document.querySelector('#submit').click()
				console.log('CLICKED');
			}, 5000)`);
			await page.waitForNavigation();
		}
		
		try {
			await Promise.race([
				page.waitForSelector('ul.videos#moreData'),
				page.waitForSelector('.empty'),
				page.waitForSelector('#streamContent')
			]);

			videos = await page.evaluate(() => {
				return (function map(children){
					let arr = [];
					for(let i = 0; i < children.length; i ++) {
						let e = children[i];
						arr.push(e.getAttribute('_vkey'))
					}
					return arr;
				})(document.querySelector('ul.videos#moreData').children)
			});
		} catch (e) {
			
		}
		

	} catch (e) {
		log.error(e);
	}


	await new Promise(res => {
		setTimeout(res, 0);
	});
	browser.close();

	return (videos);
}