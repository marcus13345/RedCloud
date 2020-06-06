const merge = require('deepmerge');
const yargs = require('yargs').argv;
const log = __signale.scope('OPTS');
// console.dir(yargs);

// careful, this gets modified by the map function
// through some global scopiness!!!
const localOptions = merge(
	require('./defaults.json'),
	require('./local.json')
);

// map CLI arguments to their options.json location
const argMappings = [
	[ 'boolean',    'electron',    'app.electron.enabled' ],
	[ 'boolean',    'devtools',    'app.electron.devtools' ],
	[ 'string',     'id',          'app.id' ],
	[ 'number',     'port',        'api.port' ],
]

//execute the mappings!
// map through the mappings, accumulating on localOptions
	// console.log('here')
const overriddenOptions = argMappings.reduce((acc, [type, cliName, jsonName]) => {
	if (cliName in yargs) {// if opt is present, create an object withit, and merge it!
		// console.log(typify(yargs[cliName], type));
		const value = typify(yargs[cliName], type);
		log.note(`${cliName}: ${value}`);
		return merge(acc, createNestedObject(jsonName, value));
	}
	return acc;
}, localOptions);

function typify(val, type) {
	switch(type) {
		case 'number': return Number(val);
		case 'boolean': return val.toLowerCase() === 'true';
		default: return val;
	}
}
// f('a', 5) == {a: 5}, f('a.b.c', 5) => {a: {b: {c: 5}}}
function createNestedObject(name, value) {
	const parts = name.split('.');
	const first = parts.shift();
	const rest = parts;
	if (rest.length === 0) {
		return {
			[first]: value
		};
	} else {
		return {
			[first]: createNestedObject(rest.join('.'), value)
		};
	}
}

// console.dir(overriddenOptions);

module.exports = overriddenOptions;