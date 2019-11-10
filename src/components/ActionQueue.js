module.exports = class ActionQueue {
	constructor() {
		this._queue = Promise.resolve();
	}

	then(fn) {
		//push the function to the queue
		this._queue = this._queue.then(fn);

		// return the part in the queue chain where this added promise resides
		return this._queue;
	}
}