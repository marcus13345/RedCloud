import $ from 'jquery'
const __options = require('../options.json');
console.log(__options)

ajax('/videos').done((data) => {
	const videos = data;
  
  // $('vaadin-grid#videoTable')[0].items = listsArr;

	const content = $('.content')

	for(const vid of videos) {
		if(__options.content.censor) {
			content.append(`<div class="videoItem"><img width="160" height="90" src="https://via.placeholder.com/1600x900/000000/808080?text=Hidden"></img></div>`)
		} else if(vid.downloaded) {
			content.append(`<a href="./watch.html?v=${vid.vid}"><div class="videoItem"><video onloadstart="this.volume=0" volume="0" width="160" height="90">
		<source src="${redcloud.store.get('settings.apiBasePath')}/videos/stream/${vid.vid}#t=20" type="video/mp4">
	</video></div></a>`)

			// content.append(`<div class="videoItem"><img width="160" height="90" src="https://via.placeholder.com/1600x900/000000/808080?text=Video"></img></div>`)
		} else {
			content.append(`<div class="videoItem"><img width="160" height="90" src="https://via.placeholder.com/1600x900/000000/808080?text=Downloading"></img></div>`)
		}
	}

	
	// const videoElems = $('.content video');
	// for(const videoElem of videoElems) videoElem.volume = 0;


	content.on('mouseover', 'video', e => {e.target.play()})
	content.on('mouseleave', 'video', e => {e.target.pause()})
	
  // console.dir(listsArr)
})

//test