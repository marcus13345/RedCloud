const Datastore = require('nedb');
const log = __signale.scope('COMP');

class Component {

	start() {
		this._databaseName = this.constructor.name.toLowerCase();
		this.db = new Datastore({
			filename: 'db/' + this._databaseName + '.nedb',
			autoload: true
		});
	}

}

module.exports = Component;
