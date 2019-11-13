module.exports = function () {
	return (function () {
		const _promise = new Promise((resolve) => {
			Object.defineProperty(this, "resolved", {
				set: value => {
					this.__resolved = value;
					if(value) {
						// console.log('resolveing', this.id)
						resolve()
					}
				},
				get: _ => {
					return this.__resolved || false;
				}
			});
		});
		_promise.resolve = _ => {
			this.resolved = true;
		}
		Object.defineProperty(_promise, 'resolved', {
			get: _ => {
				return this.resolved;
			}
		})
		return _promise;
	}).bind({id: Math.floor(Math.random() * 1000)})();
}