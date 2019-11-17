import $ from 'jquery';

$(document).ready(_ => {
	for(const property in redcloud.store.get('settings')) {
		$(`#viewport input[name=${property}]`).val(redcloud.store.get(`settings.${property}`))
	}

	$('#save').click(_ => {
		for(const elem of $('#viewport input')) {
			redcloud.store.set(`settings.${elem.name}`, elem.value);
		}
	})
})