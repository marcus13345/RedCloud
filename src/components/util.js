const path = require('path');
const {execSync, exec, spawn} = require('child_process');
// const {videoDetails, Errors: {E_VIDEO_NOT_FOUND}} = require('./details.js');
const cred = require('./../cred.js');
const fs = require('fs');
const savePath = 'vids';
const createErrorClass = require('./../customError.js')
const windowOptions = {
	// headless: false,
	// devtools: true
};
const E_YOUTUBE_DL_UNEXPECTED_TERMINATION = createErrorClass('E_YOUTUBE_DL_UNEXPECTED_TERMINATION');
const E_VIDEO_PAID_PRIVATE_OR_DELETED = createErrorClass('E_VIDEO_PAID_PRIVATE_OR_DELETED');
const E_UNEXPECTED_HTTP_403 = createErrorClass('E_UNEXPECTED_HTTP_403');
const E_INVALID_VIDEO_ID = createErrorClass('E_INVALID_VIDEO_ID');
const {Signale} = require('signale');
const log = new Signale({
	scope: 'UTIL'
});

// module.exports = {
// 	printVideo,
// 	downloadVideo,
// 	getVideosInPlaylist,
// 	getRecentlyViewed,
// }

module.exports = class Util {
	start() {
		this.Errors = {
			E_YOUTUBE_DL_UNEXPECTED_TERMINATION,
			E_VIDEO_PAID_PRIVATE_OR_DELETED,
			E_UNEXPECTED_HTTP_403,
			E_INVALID_VIDEO_ID
		}
	}

	async printVideo(vid) {
		try {
			let details = await this.Details.videoDetails(vid);
			console.log(details.title)
		} catch(e) {
			if(e instanceof E_VIDEO_NOT_FOUND) return;
			console.error(e);
		}
	}

	async downloadVideo(vid) {
		// console.log()
		try {
			fs.mkdirSync(`./${savePath}/`);
		} catch (e) { ''; }
		try {
			fs.mkdirSync(`./${savePath}/!VR!`);
		} catch (e) { ''; }

		// * remove all instances of part files, because resuming downloads if for plebs
		try {
			// log.info('trying to remove part files...')
			let files = fs.readdirSync('vids');
			files = files.filter(v => {return v.endsWith('.part')});
			// console.dir(files)
			for(const file of files) {
				log.info('removing part file ' + file)
				fs.unlinkSync('./vids/' + file);
			}
		} catch (e) {
			console.log(e)
		}

		
		let filepath = await new Promise(async (res, rej) => {

			let details;
			// log.info(vid)
			try {
				details = await this._links.Details.videoDetails(vid);
				// log.info(details.title)
				// this.printVideo(vid)
			} catch (e) {
				log.error(e)
				// TODO maybe do something about not being able to get the video, idk
				if(e instanceof this.Details.E_VIDEO_NOT_FOUND) rej(new E_INVALID_VIDEO_ID())
				else rej (e)
				return;
			}
			// console.dir(details)
			let filepath = `${details.title.replace(/[\/\\:\|\!\"\?\*\%]/g, '_')}.mp4`;
			if(details.tags.indexOf('vr') > -1 ||
				details.tags.indexOf('Virtual Reality') > -1) {
				filepath = path.join(savePath, '!VR!', filepath);
			} else {
				filepath = path.join(savePath, filepath)
			}
			// TODO lol hax
			if(fs.existsSync(filepath)) return res(filepath);
			
			let program = `youtube-dl.exe`;
			let args = [
				`--external-downloader`, `axel`, `--external-downloader-args`,
				`-n 20 -a`, `-o`, `${filepath}`, `-f`, `best`,
				`https://www.pornhub.com/view_video.php?viewkey=${vid}`
			];

			log.info('downloading ' + details.title);
			let youtubedlProcess = spawn(program, args, {
				windowsHide: true,
				detached: true,
				shell: false
			});
			let bufferOut = "";
			let bufferErr = ""
			youtubedlProcess.stdout.on('data', data => {
				bufferOut += (data.toString());
			})
			youtubedlProcess.stderr.on('data', data => {
				bufferErr += (data.toString());
			})
			youtubedlProcess.on('exit', (code, signal) => {
				if(code != 0) {
					if(bufferErr.indexOf('Unable to download webpage: HTTP Error 404: Not Found') > -1) {
						//THIS MEANS THE video is probably paid, private, or deleted.
						return rej(new E_VIDEO_PAID_PRIVATE_OR_DELETED());
					} else if (bufferOut.match(/HTTP\/1.[01] 403 Forbidden/)) {
						// not really sure what this means, as it seemed to happen
						// only once, with video ID: ph5cfa586b2b5a3
						// which at the time of documentation, is public, and free.
						return rej(new E_UNEXPECTED_HTTP_403());
					}
					// console.log()
					// console.log()
					// console.log('=========================')
					// console.error(bufferOut);
					// console.log('=========================')
					// console.error(bufferErr);
					// console.log('=========================')
					return rej(new E_YOUTUBE_DL_UNEXPECTED_TERMINATION())
				}

				log.success('finished');
				res(filepath);
			})

		});

		return filepath;
	}

	async getVideosInPlaylist(playlistId) {
		const puppeteer = require('puppeteer');
		const browser = await puppeteer.launch({
			// headless: false,
			// devtools: true
		});
		const page = await browser.newPage();
		await page.goto(`https://www.pornhub.com/playlist/${playlistId}`);
		await page.waitForSelector('#videoPlaylist');

		let videos = await page.evaluate(() => {
			return (function map(children){
				let arr = [];
				for(let i = 0; i < children.length; i ++) {
					let e = children[i];
					arr.push(e.getAttribute('_vkey'))
				}
				return arr;
			})(document.querySelector('#videoPlaylist').children)
		});

		// page.close();
		browser.close()

		return (videos);
	}


	async getRecentlyViewed(user, {authenticate = false} = {}) {
		const puppeteer = require('puppeteer');
		const browser = await puppeteer.launch(windowOptions);
		let videos = [];


		try {
			const page = await browser.newPage();
			await page.goto(`https://www.pornhub.com/users/${user}/videos/recent`);
			
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

			
			// log.watch('navigated to user');

			await page.waitForSelector('ul.videos#moreData');
			// log.watch('videos loaded');

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
			
			// console.dir(videos)


			// log.watch(`${videos.length} videos obtained`);


			// page.close();
		} catch (e) {
			console.log('FUCK', e.name);
			console.dir(e);
			
			
		}


		await new Promise(res => {
			setTimeout(res, 3000);
		});
		browser.close();
		// log.watch(`waited 3 seconds`);

		return (videos);
	}

}