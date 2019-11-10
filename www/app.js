import '@vaadin/vaadin-app-layout'
import '@vaadin/vaadin-tabs'
import '@vaadin/vaadin-grid'
import '@vaadin/vaadin-grid/vaadin-grid-sorter.js'

import $ from 'jquery'

import pkg from './../package.json';

$(document).ready(() => {
	let pages = $('#navigation').find('vaadin-tab');
	pages.on('click', (e) => {
		console.log($(e.target).attr('id'));
		loadPage($(e.target).attr('id'));
	});
	pages[3].click();
})

function loadPage(page) {
	console.log($('#viewport'))
	document.title = page;
	$('#viewport').load(page);
	document.dispatchEvent(new CustomEvent('pageLoad', {}));
}

$.ajax('/version').done((version) => {
	console.log(`client: ${pkg.name}@${pkg.version}`);
	console.log(`server: ${pkg.name}@${version}`);
	// if(version !== pkg.version)console.log('version mismatch, please wait for a reload!');
})

// console.log(pkg);