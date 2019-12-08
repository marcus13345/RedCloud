import '@vaadin/vaadin-app-layout'
import '@vaadin/vaadin-tabs'
import '@vaadin/vaadin-grid'
import '@vaadin/vaadin-grid/vaadin-grid-sorter.js'

import $ from 'jquery'

import pkg from './../package.json';

window.ajax = function ajax(url) {
	if(typeof url === 'string')
		return $.ajax(redcloud.store.get('settings.apiBasePath') + url)
	else {
		const options = {...url};
		options.url = undefined;
		url = url.url;
		return $.ajax({
			...options,
			url: redcloud.store.get('settings.apiBasePath') + url
		});
	}
}

$(document).ready(() => {
	setTimeout(_ => {
		let pages = $('#navigation').find('vaadin-tab');
		pages.on('click', (e) => {
			// console.log($(e.target).attr('id'));
			loadPage($(e.target).attr('id'));
		});
		pages[0].click();
		
		ajax('/version').done((version) => {
			console.log(`client: ${pkg.name}@${pkg.version}`);
			console.log(`server: ${pkg.name}@${version}`);
			// if(version !== pkg.version)console.log('version mismatch, please wait for a reload!');
		})
	}, 0)
})

function loadPage(page) {
	// console.log($('#viewport'))
	document.title = page;
	setTimeout(_ => {
		$('#viewport').load(page + '.html');
	}, 0)
	document.dispatchEvent(new CustomEvent('pageLoad', {}));
}


// console.log(pkg);