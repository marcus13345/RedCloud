import $ from 'jquery'
import VideoItem from './lib/VideoItem';

ajax('/videos').done((data) => {
	const videos = data;
  
  // $('vaadin-grid#videoTable')[0].items = listsArr;

	const content = $('.content')

	for(const vid of videos) {

		let videoElement;

		// content.append('<hr>')
		content.append(new VideoItem(vid))
	}

	
	// const videoElems = $('.content video');
	// for(const videoElem of videoElems) videoElem.volume = 0;


	
  // console.dir(listsArr)
})
