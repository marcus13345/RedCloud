module.exports = function createErrorClass(name) {
	return class extends Error {
		constructor(msg) {
			super(name, msg)
		}
	}
}