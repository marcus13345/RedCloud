const urlParams = new URLSearchParams(window.location.search);
console.log(window.location.search, urlParams);
const vid = urlParams.get('v');
const $ = require('jquery');

const elem = $(`

<video style="
    height: 80%;" onloadstart="this.volume=0" autoplay>
		<source src="${redcloud.store.get('settings.apiBasePath')}/videos/stream/${vid}" type="video/mp4">
	</video>

`)


$('#video').append(elem);

elem[0].controls = true;