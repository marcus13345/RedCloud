(async () => {
	const readline = require('readline');
	const _cliProgress = require('cli-progress');
	const bar1 = new _cliProgress.Bar({}, _cliProgress.Presets.rect);
	bar1.start(200, 0);
	for(let i = 0; i < 200; i ++) {
		bar1.update(i + 1);
		
		await new Promise(res => setTimeout(res, 500));
		if(Math.random() > .8) {
			console.log();
			const bar2 = new _cliProgress.Bar({}, _cliProgress.Presets.rect);
			bar2.start(100, 0);
			for(let j = 0; j < 100; j ++) {
				await new Promise(res => setTimeout(res, 17));
				bar2.update(j + 1);
			}
			bar2.stop();
			readline.moveCursor(process.stdout, 0, -1);
			readline.clearLine(process.stdout);
			readline.moveCursor(process.stdout, 0, -1);
		}
	}


	bar1.stop();
})();