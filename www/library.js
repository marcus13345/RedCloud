import $ from 'jquery'
const __options = require('../options');
console.log(__options)

ajax('/videos').done((data) => {
	const videos = data;
  
  // $('vaadin-grid#videoTable')[0].items = listsArr;

	const content = $('.content')

	for(const vid of videos) {
		if(__options.content.censor) {
			content.append(`<div class="videoItem"><img class="placeholder" width="160" height="90" src="https://via.placeholder.com/1600x900/000000/808080?text=Hidden"></img></div>`)
		} else if(vid.downloaded) {
			content.append(`<!--
				below is a hack to remove whitespace, html ugh
				--><div class="video">
				<a" title="${vid.title}" href="./watch.html?v=${vid.vid}"><!-- 
					--><div class="videoItem">
						<video onloadstart="this.volume=0"
									volume="0"
									width="160"
									height="90">
							<source src="${
									redcloud.store.get('settings.apiBasePath')
								}/videos/stream/${
									vid.vid
								}#t=20"
								type="video/mp4">
						</video>
						<br>
						${getSourceLogo(vid.source.source)}
						<span class="title">${vid.title}</span>
						<span class="subtitle">${vid.source.data}</span>
					</div><!--
				--></a>
				</div><!--
			-->`)

			// content.append(`<div class="videoItem"><img width="160" height="90" src="https://via.placeholder.com/1600x900/000000/808080?text=Video"></img></div>`)
		} else {
			content.append(`<div class="videoItem"><img width="160" class="placeholder"  height="90" src="https://via.placeholder.com/1600x900/000000/808080?text=Unavailable"></img></div>`)
		}
	}

	
	// const videoElems = $('.content video');
	// for(const videoElem of videoElems) videoElem.volume = 0;


	content.on('mouseover', 'video', e => {e.target.play()})
	content.on('mouseleave', 'video', e => {e.target.pause()})
	
  // console.dir(listsArr)
})



function getSourceLogo(name) {
	switch(name) {
		case 'pornhub': return `<img src="./logos/pornhub.png" style="
    --size: 32px;
    width: var(--size);
    height: var(--size);
    background: white;
    object-fit: contain;
    display: block;
    float: left;
    border-radius: 5px;
    margin: 5px 6px 0px 6px;
">
		`
	}
}