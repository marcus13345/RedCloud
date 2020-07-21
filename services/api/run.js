(async () => {
	const chokidar = require('chokidar');
	const webpack = require('webpack');
	const {spawn} = require('child_process');
	let proc;

	await pack();
	restartProcess();

	chokidar.watch('webpack.config.js').on('change', async _ => {
		console.log('webpack file modified');
		delete require.cache[require.resolve('./webpack.config.js')];
		await pack();
		restartProcess();
	});

	function restartProcess() {
		if(proc) proc.kill();

		proc = spawn('node.exe', ['app.js'])
		
		proc.stdout.on('data', data => {
			// console.log('data?')
			process.stdout.write(data);
		})
		proc.stderr.on('data', data => {
			// console.log('data?')
			process.stdout.write(data);
		})
	}

	function pack() {
		return new Promise(res => {
			console.log()
			let config = require('../webpack.config.js');
			config.watch = true;
			const compile = webpack(config, (err, stats) => {
				console.log(`Error: ${err}`);
				// console.dir(stats);
				res();
			});
		})
	}
})();