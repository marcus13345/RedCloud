
export default function exporter(name, _class) {
	let exported;
	try {
		customElements.define(name, _class)
		exported = _class;
	} catch (e) {
		exported = customElements.get(name);
	}
	return exported
}