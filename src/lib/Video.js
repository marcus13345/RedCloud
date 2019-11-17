
/**
 * this is only a struct dont ever put living code in here.
 * derived properties, are a maybe, but never state changing code
 * ! D E A D A S S !
 */

const Struct = require('./Struct.js');

/**
 * @typedef {object} Video
 * @property {string} vid
 * @property {string} source
 * @property {string} title
 * @property {string} duration
 * @property {object} tags
 * @property {string} thumb
 * @property {string} html
 * @property {boolean} downloaded
*/
class Video extends Struct{
	//TODO figure out how to make this static
	properties() {
		return {
			source: 'string',
			vid: 'string',
			title: 'string',
			duration: 'string',
			tags: 'object',
			thumb: 'string',
			html: 'string',
			downloaded: 'boolean',
			addedTimestamp: 'number',
			filepath: 'string'
		}
	}
}

module.exports = Video;