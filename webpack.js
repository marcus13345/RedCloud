const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const webpack = require('webpack');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const glob = require('glob');

// default true, unless --watch specified
const watch = process.argv.indexOf('--watch') >= 0;
console.log('watching', watch)

let queue = Promise.resolve();

if(!watch) {

	glob('./www/*.js', (err, files) => {
		for(const filepath of files) {
			queueCompile(filepath);
		}
	});
	
	glob('./static/**/*.*', (evt, files) => {
		for(const filepath of files) {
			copy(filepath)
		}
	});
} else {
	
	require('livereload')
		.createServer()
		.watch(__dirname + "/dist");

	chokidar.watch('./www/*.js', {
		persistent: true
	}).on('all', (evt, filepath) => {
		if(evt === 'add') {
			console.log(`${evt}: ${filepath}`);
			queueCompile(filepath);
		}
	});

	chokidar.watch('./static/**/*.*', {
		persistent: true
	}).on('all', (evt, filepath) => {
		// console.log(`${evt}: ${filepath}`);
		copy(filepath)
	});
}


// livereload

async function copy(filepath) {
	const newpath = path.join('./dist', path.relative('./static', filepath));
	fse.ensureDirSync(path.parse(newpath).dir);
	console.log('copy', filepath.padEnd(30), '=>', newpath)
	fs.copyFile(filepath, newpath, _ => _);
}

async function queueCompile(filepath) {
	// await queue;
	queue = queue.then(async function() {
		console.log('-'.repeat(process.stdout.columns));
		console.log(filepath);
		console.time(filepath)
		await compile(filepath);
		console.timeEnd(filepath)
	});
}

function compile(filepath) {
	return new Promise ((res) => {
		const name = path.parse(filepath).name;
		webpack({
			mode: 'production',
			devtool: 'source-map',
			entry: {
				[name]: `./${filepath}`
			},
			performance: { hints: false },
			watch,
			output: {
				filename: '[name].bundle.js', 
			},
			plugins: [
				new FriendlyErrorsWebpackPlugin({
					clearConsole: false
				}),
				// new LiveReloadPlugin({}),
				// new CopyPlugin([
				//   { from: './static', to: './' },
				// ]),
			]
		}, (err, stats) => {
			res();
		});
	})
}

// Something to use when events are received.
// const log = console.log.bind(console);
// // Add event listeners.
// watcher
//   .on('add', path => log(`File ${path} has been added`))
//   .on('change', path => log(`File ${path} has been changed`))
//   .on('unlink', path => log(`File ${path} has been removed`));

// // More possible events.
// watcher
//   .on('addDir', path => log(`Directory ${path} has been added`))
//   .on('unlinkDir', path => log(`Directory ${path} has been removed`))
//   .on('error', error => log(`Watcher error: ${error}`))
//   .on('ready', () => log('Initial scan complete. Ready for changes'))
//   .on('raw', (event, path, details) => { // internal
//     log('Raw event info:', event, path, details);
//   });

// // 'add', 'addDir' and 'change' events also receive stat() results as second
// // argument when available: https://nodejs.org/api/fs.html#fs_class_fs_stats
// watcher.on('change', (path, stats) => {
//   if (stats) console.log(`File ${path} changed size to ${stats.size}`);
// });

// Watch new files.
// watcher.add('new-file');
// watcher.add(['new-file-2', 'new-file-3', '**/other-file*']);

// // Get list of actual paths being watched on the filesystem
// var watchedPaths = watcher.getWatched();

// // Un-watch some files.
// watcher.unwatch('new-file*');

// // Stop watching.
// // The method is async!
// watcher.close().then(() => console.log('closed'));

// // Full list of options. See below for descriptions.
// // Do not use this example!
// chokidar.watch('file', {
//   persistent: true,

//   ignored: '*.txt',
//   ignoreInitial: false,
//   followSymlinks: true,
//   cwd: '.',
//   disableGlobbing: false,

//   usePolling: false,
//   interval: 100,
//   binaryInterval: 300,
//   alwaysStat: false,
//   depth: 99,
//   awaitWriteFinish: {
//     stabilityThreshold: 2000,
//     pollInterval: 100
//   },

//   ignorePermissionErrors: false,
//   atomic: true // or a custom 'atomicity delay', in milliseconds (default 100)
// });