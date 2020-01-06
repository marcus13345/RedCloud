import $ from 'jquery';

$(document).ready(_ => {
	// load settings
	loadSettings();

	$('#save').click(_ => {
		saveSettings();
	})
})

function loadSettings() {
	// loop through values in settings
	console.log('=== Loading Settings ===');
	for(const property in redcloud.store.get('settings')) {
		const value = redcloud.store.get(`settings.${property}`);
		const type = typeof value;
		console.log(property, type, value);
		if(type === 'string')
			$(`#viewport input[name=${property}]`).val(value);
		else if (type === 'boolean')
			$(`#viewport input[name=${property}]`)[0].checked = value;
	}

	ajax('/util/settings').done(data => {
		$('#serverSettings').html(JSON.stringify(data, null, 2));
		// console.log(data);
	})
}

function saveSettings() {
	console.log('=== Saving Settings ===')
	for(const elem of $('#viewport input')) {
		const inputType = $(elem).attr('type');

		// convert input types to json types
		const type = inputType === 'text' // if text
									? 'string' // its string
									: inputType === 'checkbox' // if checkbox
									? 'boolean' // its boolean
									: 'string' // otherwise, catch all, its a string, sure
		const property = elem.name;

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