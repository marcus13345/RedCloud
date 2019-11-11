const {Collexion} = require('collexion');

console.log('     ')
console.log(' ____________________ ')
console.log('/                    \\ ')
console.log('|      RedCloud      | ')
console.log('|    ' + require('./package.json').version.padStart(10, ' ') + '      | ')
console.log('\\____________________/')
console.log('     ');
console.log('     ');

new Collexion({
	Server: {
		Code: require('./src/components/RestServer.js'),
		Data: {
			routes: {
				videos: 'Videos',
				search: 'Search',
				sources: 'PorhubCron'
			}
		}
	},
	Videos: {
		Code: require('./src/components/videos.js')
	},
	Search: {
		Code: require('./src/components/search.js')
	},
	Details: {
		Code: require('./src/components/details.js')
	},
	Util: {
		Code: require('./src/components/util.js')
	},
	PorhubCron: {
		Code: require('./src/components/pornhub.js')
	}
})
