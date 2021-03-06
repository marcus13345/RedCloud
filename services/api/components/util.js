const path = require('path');
// const {videoDetails, Errors: {E_VIDEO_NOT_FOUND}} = require('./details.js');
const cred = require('../cred.js');
const fs = require('fs');
// const options
const savePath = 'vids';
const createErrorClass = require('../customError.js')
const __options = require('../options');
const windowOptions = {
	// headless: false,
	// devtools: true
};
const { EventEmitter } = require('events');
const E_YOUTUBE_DL_UNEXPECTED_TERMINATION = createErrorClass('E_YOUTUBE_DL_UNEXPECTED_TERMINATION');
const E_VIDEO_PAID_PRIVATE_OR_DELETED = createErrorClass('E_VIDEO_PAID_PRIVATE_OR_DELETED');
const E_UNEXPECTED_HTTP_403 = createErrorClass('E_UNEXPECTED_HTTP_403');
const E_INVALID_VIDEO_ID = createErrorClass('E_INVALID_VIDEO_ID');

const log = __signale.scope(__options.app.output.emoji ? '🛠 ' : 'UTIL');
const logFile = require('../lib/LogFile.js');
const chalk = require('chalk');
const { Router } = require('express')

let handbrake = path.resolve(__dirname, './../../../tools/HandBrake/HandBrakeCLI.exe');
if(process.platform === 'darwin') {
	handbrake = path.resolve(__dirname, './../../../tools/macos/HandBrakeCLI');
}
let youtubedl = path.resolve(__dirname, `./../../../tools/youtube-dl/youtube-dl` + (process.platform == 'win32' ? '.exe' : ''));

log.info('youtubedl', youtubedl)
log.info('handbrake', handbrake)

module.exports = class Util {

	transcodeQueue = Promise.resolve();
	transcodeQueueSize = 0;
	transcoding = true;
	running = true;

	get errors() {
		return {
			E_YOUTUBE_DL_UNEXPECTED_TERMINATION,
			E_VIDEO_PAID_PRIVATE_OR_DELETED,
			E_UNEXPECTED_HTTP_403,
			E_INVALID_VIDEO_ID
		}
	}

	async stop() {
		this.running = false;
	}

	getRouter() {
		const router = new Router();

		router.get('/version', (req, res) => {
			res.end(require('../../../package.json').version);
		});

		router.get('/settings', (req, res) => {
			res.json(__options);
		})

		return router;
	}

	start() {
		this._queue = Promise.resolve();
		process.on('SIGINT', _ => {
			this.shutdown();
		})
	}

	async printVideo(vid) {
		try {
			let details = await this.Details.videoDetails(vid);
		} catch(e) {
			if(e instanceof E_VIDEO_NOT_FOUND) return;
			log.error(e);
		}
	}

	async shutdown() {
		if(!this.running) return;
		this.running = false;

		process.stdout.write('\r');
		log.info(chalk.bgYellow.black('trying to shut down gracefully. . .'));
		for(const instanceName in this._collexion.instances) {
			const instance = this._collexion.instances[instanceName];
			try {
				// log.time(instanceName);
				// log.info('stopping', instanceName);
				await instance.stop();
				// log.timeEnd(instanceName);
			} catch (e) {
				// log.warn('no stop function in', instanceName);
			}
		}
	}

	async downloadVideo(vid) {
		// this.printVideo(vid)

		// TODO split the filepath creation into its own method to allocate a filepath.
		// TODO then have download video be its own thing.
		return this._queue.then(async () => {
			try {
				fs.mkdirSync(`./${savePath}/`);
			} catch (e) { ''; }
			try {
				fs.mkdirSync(`./${savePath}/!VR!`);
			} catch (e) { ''; }

			let filepath = await new Promise(async (res, rej) => {

				let details;
				try {
					details = await this._links.Details.videoDetails(vid);
				} catch (e) {
					// TODO maybe do something about not being able to get the video, idk
					if(e instanceof this._links.Details.errors.E_VIDEO_NOT_FOUND) rej(new E_INVALID_VIDEO_ID())
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
				if(fs.existsSync(filepath)) {
					return res(filepath);
				}
				
				// * remove all instances of part files, because resuming downloads is for plebs
				try {
					// log.info('trying to remove part files...')
					let files = fs.readdirSync('vids');
					files = files.filter(v => {return v.endsWith('.part')});
					// console.dir(files)
					for(const file of files) {
						// log.info('removing part file ' + file)
						fs.unlinkSync('./vids/' + file);
					}
				} catch (e) {
					// console.log(e)
				}
				
				let args = [
					`--external-downloader`, `axel`, `--external-downloader-args`,
					`-n 20 -a`, `-o`, `${filepath}`, `-f`, `best`,
					`https://www.pornhub.com/view_video.php?viewkey=${vid}`
				];

				// log.info('downloading ' + details.title);
				let youtubedlProcess = this._links.Spawner.spawn(details.title, youtubedl, args, {
					env: {
						// ...process.env,
						PATH: process.env.PATH + ';' + path.resolve(__dirname, '../../tools/axel')
					},
					windowsHide: true,
					// detached: true,
					shell: false
				});
				let bufferOut = "";
				let bufferErr = "";
				const logStream = logFile.createStream('youtube-dl');
				youtubedlProcess.stdout.on('data', data => {
					// process.stdout.write(data);
					if(__options.tools.axel.output) process.stdout.write(data);
					bufferOut += (data.toString());
					logStream.write(data)
				})
				youtubedlProcess.stderr.on('data', data => {
					// process.stderr.write(data);
					if(__options.tools.axel.output) process.stdout.write(data);
					bufferErr += (data.toString());
					logStream.write(data);
				})
				
				// youtubedlProcess.stdout.pipe(logStream);
				// youtubedlProcess.stderr.pipe(logStream);

				youtubedlProcess.on('exit', async (code, signal) => {

					if(code !== 0) {
						if(bufferErr.indexOf('Unable to download webpage: HTTP Error 404: Not Found') > -1) {
							//THIS MEANS THE video is probably paid, private, or deleted.
							return rej(new E_VIDEO_PAID_PRIVATE_OR_DELETED());
						} else if (bufferOut.match(/HTTP\/1.[01] 403 Forbidden/)) {
							// not really sure what this means, as it seemed to happen
							// only once, with video ID: ph5cfa586b2b5a3
							// which at the time of documentation, is public, and free.
							return rej(new E_UNEXPECTED_HTTP_403());
						} else {
							return rej(new E_YOUTUBE_DL_UNEXPECTED_TERMINATION())
						}
					}

					try {
						const details = await this._links.Details.videoDetails(vid);
						log.success('downloaded', details.title);
					} catch (e) {
						log.success('downloaded');
						log.debug(e);
					}
					res(filepath);
				})

			});

			return filepath;

		}).catch();

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

	transcode(inputFile, outputFile) {
		this.transcodeQueueSize ++;
		return this.transcodeQueue = this.transcodeQueue.then(() => {
			return new Promise(async (res, rej) => {
				log.info('transcode starting', inputFile);

				const transcoder = this._links.Spawner.spawn('transcode ' + inputFile, handbrake, [
					'-i', inputFile,
					'-o', outputFile
				], {
					// stdio: 'inherit',
					windowsHide: true
				});
				let buffer = "";
				transcoder.stdout.on('data', function (data) {
					buffer += data
					if (__options.tools.handbrake.output) {
						process.stdout.write(data)
					}
				});
				transcoder.stderr.on('data', function (data) {
					buffer += data
					if (__options.tools.handbrake.output) {
						process.stdout.write(data)
					}
				});

				const exitCode = await new Promise(res => transcoder.once('exit', res));

				const logStream = logFile.createStream('transcode', inputFile);
				logStream.write(buffer);
				// log.success('transcode finished', `(queue size: ${this.transcodeQueueSize})`)

				this.transcodeQueueSize --;
				res(exitCode === 0);
			})
		})
	}

}
