import { LitElement, html, css } from 'lit-element';
import exporter from './../lib/exporter';
import $ from 'jquery';

class SettingsPage extends LitElement {
	constructor() {
		super();
		this.settings = [];
		this.loadSettings();
	}

	saveSettings() {
		console.log('=== Saving Settings ===');
		const elems = $(this.shadowRoot).find('input');
		// console.log(elems, this);
		for(const elem of elems) {
			const inputType = $(elem).attr('type');

			// console.log(inputType)
			// convert input types to json types
			const type = inputType === 'text' // if text
										? 'string' // its string
										: inputType === 'checkbox' // if checkbox
										? 'boolean' // its boolean
										: 'string' // otherwise, catch all, its a string, sure
			const property = elem.name;
			// console.log(type, property)

			//grab related value property (switching on inputType to get correct property)
			const value = inputType === 'text' // if text
										? elem.value // use value
										: inputType === 'checkbox' // if checkbox
										? elem.checked // use checked
										: elem.value // catch all idk, its a string

			// console.log(elem);

			console.log(property, type, value);

			redcloud.store.set(`settings.${property}`, value);
		}
	}

	static get styles() {
		return css`

h1 {
	padding-left: 24px;
	font-weight: normal;
}

.left {
	width: 200px;
	text-align: right;
	padding: 8px 24px;
	display: inline-block;
}

.right {
	display: inline-block;
}

input[type=text] {
	background-color: inherit;
	font-size: inherit;
	border: none;
	color: white;
	width: 500px;
	border-bottom: 1px solid grey;
	padding: 4px 24px;
	letter-spacing: 1px;
}

input[type=text]:focus {
	border-bottom: 2px solid white;
	padding-bottom: 3px;
	outline: none;
}
		`;
	}

	static get properties() {
		return {
			settings: { type: Array },
			serverSettings: { type: Object }
		}
	}

	loadSettings() {
		// loop through values in settings
		console.log('=== Loading Settings ===');
		for(const property in redcloud.store.get('settings')) {
			const value = redcloud.store.get(`settings.${property}`);
			const type = typeof value;
			console.log(property, type, value);
			this.settings = [...this.settings, {
				property,
				type,
				value
			}]
		}

		ajax('/util/settings').done(data => {
			this.serverSettings = data
		});
	}

	render() {
		return html`
<h1>Client Settings</h1>

${
	this.settings.map(setting => {
		switch(setting.type) {
			case 'string': return html`
<label class="left" for="${setting.property}">${setting.property}</label>
<input class="right" type="text" value="${setting.value}" name="${setting.property}" id="${setting.property}">
<br>
			`;
			case 'boolean': return html`
<div class="left"><input type="checkbox" .checked=${setting.value} name="${setting.property}" id="${setting.property}"></div>
<label class="right" for="${setting.property}">${setting.property}</label>
<br>
			`;
		}
	})
}

<div class="left"></div><div class="right">
<button
	@click=${this.saveSettings}
	id="save"
	>Save</button>
</div>

<br><hr><br>
<pre>
${JSON.stringify(this.serverSettings, null, 2)}
</pre>

<script src="./settings.bundle.js"></script>
`;
	}
}

export default exporter('settings-page', SettingsPage);