import $ from 'jquery'

$.ajax('/api/videos').done((data) => {
	const videos = data;
  
  // $('vaadin-grid#videoTable')[0].items = listsArr;

	const content = $('.content')

	for(const vid of videos) {
		if(vid.downloaded) {
			content.append(`<a href="/watch?v=${vid._id}"><div class="videoItem"><video volume="0" width="160" height="90">
		<source src="api/videos/stream/${vid._id}#t=20" type="video/mp4">
	</video></div></a>`)

			// content.append(`<div class="videoItem"><img width="160" height="90" src="https://via.placeholder.com/1600x900/000000/808080?text=Video"></img></div>`)
		} else {
			content.append(`<img width="160" height="90" src="https://via.placeholder.com/1600x900/000000/808080?text=Downloading"></img>`)
		}
	}

	content.on('mouseover', 'video', e => {e.target.play()})
	content.on('mouseleave', 'video', e => {e.target.pause()})
	
  // console.dir(listsArr)
})

//test