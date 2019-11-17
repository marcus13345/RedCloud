module.exports = class Struct {
	constructor(data) {
		const propertiesTemplate = this.properties();
		for(const property in propertiesTemplate) {
			const inputValue = data[property];
			const expectedType = propertiesTemplate[property];
			const foundType = typeof inputValue;
			if(foundType !== expectedType)
				if(inputValue !== null)
					throw new TypeError(`expected ${expectedType}, got ${foundType} on ${property}`);
			this[property] = inputValue;
		}
	}
}