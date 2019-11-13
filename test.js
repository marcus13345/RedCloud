(async () => {

	const createSemaphore = require('./src/lib/semaphore.js');

	const semaphore = createSemaphore();
	const semaphore2 = createSemaphore();

	(async () => {
		await new Promise(res => setTimeout(res, 1000));
		console.log('1', semaphore.resolved)
		semaphore.resolve();
		console.log('1', semaphore.resolved)
		await new Promise(res => setTimeout(res, 1000));
		console.log('2', semaphore.resolved)
		semaphore2.resolve();
		console.log('2', semaphore.resolved)
	})();

	await semaphore;
	console.log('asdf')
	await semaphore2;
	console.log('asdf')
})()