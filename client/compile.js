const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const webpack = require('webpack');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
let queue = Promise.resolve();
const yargv = require('yargs').argv;
const watch = yargv.watch && yargv.watch === 'true'
const glob = require('glob');
const log = require('signale');
const notifier = require('node-notifier');
const ICON = path.join(__dirname, 'icon.png');

//these're tested, aight?
const sources = __dirname.replace(/\\/g, '/') + '/www/';
const static  = __dirname.replace(/\\/g, '/') + '/static/';
const outPath = __dirname + '/dist';

log.info('hot reload:', !!watch)

if(!watch) {
	glob(sources + '*.js', (err, files) => {
		for(const filepath of files) {
			queueCompile(filepath);
		}
	});
	
	glob(static + '**/*.*', (evt, files) => {
		for(const filepath of files) {
			copy(filepath)
		}
	});
} else {
	require('livereload')
		.createServer()
		.watch(outPath);

	log.info('livereload running on', outPath)

	chokidar.watch(sources + '*.js', {
		persistent: true
	}).on('all', (evt, filepath) => {
		if(evt !== 'add') return;

		// console.log(`${evt}: ${filepath}`);
		queueCompile(filepath, { watch: true });
	});

	chokidar.watch(static + '**/*.*', {
		persistent: true
	}).on('all', (evt, filepath) => {
		// console.log(`${evt}: ${filepath}`);
		copy(filepath)
	});
}


// livereload

async function copy(filepath) {
	const newpath = path.join(outPath, path.relative(static, filepath));
	fse.ensureDirSync(path.parse(newpath).dir);
	// log.info('COPYING', filepath.padEnd(30), '=>', newpath)
	try {
		await new Promise((res, rej) => {
			fs.copyFile(filepath, newpath, (err) => {
				if(err) rej(err);
				else res();
			});
		});
		log.success('copied', filepath.padEnd(30), '=>', newpath)
	} catch (e) {
		log.error('failed to copy', filepath.padEnd(30), '=>', newpath)
	}
}

async function queueCompile(filepath, { watch = false } = {}) {
	// await queue;
	queue = queue.then(async () => {
		await compile(filepath, { watch });
	});
}

function compile(filepath, { watch = false } = {}) {
	return new Promise ((res) => {
		const name = path.parse(filepath).name;
		webpack({
			mode: 'production',
			devtool: 'source-map',
			entry: {
				[name]: `${filepath}`
			},
			performance: { hints: false },
			watch,
			output: {
				path: outPath,
				filename: '[name].bundle.js', 
			},
			plugins: [
				{
					apply: (compiler) => {
						compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
							log.success('webpack compiled ', filepath);
						});
					}
				}
			]
		}, (err, stats) => {
			res();
		});
	})
}
