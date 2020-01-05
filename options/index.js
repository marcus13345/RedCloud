const merge = require('deepmerge');

module.exports = merge (
	require('./defaults.json'),
	require('./local.json')
)