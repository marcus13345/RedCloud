import './lib/native'
import './pages'
import './elements';

import css from './global.css'
import html from './global.html'
import pkg from './../../package.json';
import './lib/native';

// import $ from 'jquery'
// import axios from 'axios';

window.ajax = function ajax(url) {
	const fullUrl = redcloud.store.get('settings.apiBasePath') + url
	console.log('ajaxing', url);
	return fetch(fullUrl);
}

document.write(`
<style>${css}</style>
${html}
<redcloud-root></redcloud-root>
`);