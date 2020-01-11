(function() {
	const vid = window.pageData.video.vid;
	const video = window.pageData.video;
	const $ = require('jquery');

	const elem = $(`

	<video style="" onloadstart="this.volume=0" autoplay>
			<source src="${redcloud.store.get('settings.apiBasePath')}/videos/stream/${vid}" type="video/mp4">
		</video>

	`)


	$('#video').append(elem);
	$('#video').append(`
	
	<div>

		<div>
			${getSourceLogo(video.source.source)}
			<h1>${video.title}<h1>
		<div>

	</div>
	
	`);

	elem[0].controls = true;


	function getSourceLogo(name) {
		switch(name) {
			case 'pornhub': return `<img src="./logos/pornhub.png" style="
			--size: 64px;
			width: var(--size);
			height: var(--size);
			background: white;
			object-fit: contain;
			border-radius: 5px;
			margin:30px;
	">
			`;
			case 'chaturbate': return `<img src="./logos/chaturbate.jpg" style="
			--size: 64px;
			--aspect: 2.5;
			width: calc(var(--size) * var(--aspect));
			height: var(--size);
			background: white;
			object-fit: contain;
			border-radius: 5px;
			margin: 30px
	">
			`;
		}
	}
})()


