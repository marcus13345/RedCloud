document.write('<script src="http://localhost:35729/livereload.js" async></script>')

import './lib/native'
import './pages'
import './elements';

import css from './global.css'
import html from './global.html'
import pkg from './../../package.json';
import './lib/native';

import $ from 'jquery'
import axios from 'axios';

window.ajax = function ajax(url) {
	if(typeof url === 'string') {
		const fullUrl = redcloud.store.get('settings.apiBasePath') + url;
		return $.ajax(fullUrl);
	} else {
		const options = { ...url };
		options.url = undefined;
		url = url.url;
		const fullUrl = redcloud.store.get('settings.apiBasePath') + url;
		return $.ajax({
			...options,
			url: fullUrl
		});
	}
}

document.write(`
<style>${css}</style>
${html}
<redcloud-root></redcloud-root>
`);
// function router(page) {
// 	switch(page) {
// 		case 'library': return LibraryPage;
// 		case 'watch': return WatchPage;
// 		case 'discover': return DiscoverPage;
// 		case 'sources': return SourcesPage;
// 		case 'settings': return SettingsPage;
// 		default: return NotFoundPage;
// 	}
// }

// $(document).ready(() => {
// 	setTimeout(_ => {
// 		let pages = $('#navigation').find('vaadin-tab');
// 		pages.on('click', (e) => {
// 			// console.log($(e.target).attr('id'));
// 			navigate($(e.target).attr('id'));
// 		});
		
// 		ajax('/util/version').done((version) => {
// 			console.log(`client: ${pkg.name}@${pkg.version}`);
// 			console.log(`server: ${pkg.name}@${version}`);
// 			// if(version !== pkg.version)console.log('version mismatch, please wait for a reload!');
// 		})
// 	}, 0);

// 	navigate(
// 		redcloud.store.get('navigation.currentPage'),
// 		redcloud.store.get('navigation.pageData')
// 	);
// })

// window.addEventListener('popstate', e => {
// 	if (!e.data) return;
// 	const {data: {url, data = {}}} = e;
// 	navigate(url, data);
// });

// window.navigate = function navigate(page, data = {}) {
// 	console.log('navigating', page, data);
// 	redcloud.store.set('navigation.currentPage', page);
// 	redcloud.store.set('navigation.pageData', data);
// 	window.pageData = data;
// 	const pages = $('#navigation').find('vaadin-tab');
// 	const pageNames = pages.toArray().map(v => $(v).attr('id'));
// 	document.title = page;
// 	setTimeout(_ => {
// 		// $('#viewport').load(page + '.html');
// 		$('#viewport').children().remove();
// 		// $('#viewport').append(new (router(page))(data))
// 	}, 0);
// 	redcloud.store.set('navigation.currentPage', page)
// 	document.dispatchEvent(new CustomEvent('pageLoad', {}));
// 	const pageIndex = pageNames.indexOf(page);
// 	if($('#navigation')[0].selected != pageIndex)
// 		$('#navigation')[0].selected = pageIndex;
// }