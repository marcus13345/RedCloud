// functional code
function makePromiseBetter(promise) {
	if ('isResolved' in promise) return promise;
	let isPending = true;
	const newPromise = promise.then(
		(v) => isPending = false,
		(e) => isPending = false
	);
	Object.defineProperty(newPromise, 'isPending', {
		get: () => isPending
	})
	return newPromise;
}


module.exports.TaskPool = class TaskPool {
	// tasks is an array of async functions to be completed
	constructor(tasks, __options) {
		this.tasks = tasks;
		this.threadPool = [];
		this.threadLimit = 1;
		this.running = false;
		this._startRunning();
	}

	/// so await this to wait for all tasks to finish
	get finish() {
		return this._finishPromise;
	}

	/**
	 * clean resolved task promises from the current thread pool
	 */
	_cleanThreads() {
		for(let i = 0; i < this.threadPool.length; i ++) {
			if(!this.threadPool[i].isPending) {
				this.threadPool.splice(i, 1);
				i --;
			}
		}
	}

	_startRunning() {
		this._finishPromise = new Promise(async (res) => {
			for(const task of this.tasks) {
				if(this.threadPool.length < this.threadLimit) {
					// console.log('starting task')
					this._startTask(task);
				} else {
					// console.log('waiting')
					await Promise.race(this.threadPool);
					// console.log('finished task')
					this._cleanThreads();
					// console.log(this.threadPool.length)
					this._startTask(task)
				}
			}
		})
	}

	/**
	 * 
	 * @param {async () => {}} taskFn 
	 */
	_startTask(taskFn) {
		// console.log('started task')
		let promise = taskFn();
		promise = makePromiseBetter(promise);
		this.threadPool.push(promise);
	}
}