const {Collexion} = require('collexion');

console.log('     ')
console.log(' ____________________ ')
console.log('/                    \\ ')
console.log('|       Pornhub      | ')
console.log('|    ' + require('./package.json').version.padStart(10, ' ') + '      | ')
console.log('\\____________________/')
console.log('     ');

new Collexion({
	Server: {
		Code: require('./src/components/RestServer.js'),
		Data: {
			routes: {
				videos: 'Videos'
			}
		}
	},
	Videos: {
		Code: require('./src/components/videos.js')
	},
	Details: {
		Code: require('./src/components/details.js')
	},
	Util: {
		Code: require('./src/components/util.js')
	},
})
