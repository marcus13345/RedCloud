const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get('v');
const $ = require('jquery');

const elem = $(`

<video style="
    height: 80%;">
		<source src="api/videos/stream/${myParam}#t=20" type="video/mp4">
	</video>

`)


$('#video').append(elem);

elem[0].controls = true;