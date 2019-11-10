const fs = require('fs')

module.exports.JSONStore = class JSONStore {
	constructor(path) {
		this._path = path;
		this._obj = [];
		this.load();
		this.save();
	}

	get length() {
		return this._obj.length;
	}

	_removeDuplicates() {
		let arr = []
		this._obj.forEach(v => {
			if(arr.indexOf(v) === -1) {
				arr.push(v)
			}
		});
		this._obj = arr;
		this.save();
	}

	load() {
		if(fs.existsSync(this._path)) {
			let str = fs.readFileSync(this._path)
			let obj = JSON.parse(str);
			this._obj.push(...obj);
		}
	}

	push(...vals) {
		const saved = [];
		// console.dir(vals)
		for(let val of vals) {
			if(this._obj.indexOf(val) === -1) {
				saved.push(val);
			}
		}
		this._obj.push(...vals);
		this._removeDuplicates();
		this.save();
		return saved;
	}

	get() {
		return this._obj;
	}

	save() {
		try {
			fs.writeFileSync(this._path, JSON.stringify(this._obj))
		} catch (e) {
			//wtvr
			console.error(e);
		}
	}
}