import $ from 'jquery'
const content = $('.content')
let searchText = "", page = 1;
import VideoItem from './lib/VideoItem';
const censor = redcloud.store.get('settings.censor');

function clear() {
	content.children().remove();
	page = 1;
}
// something else
function loadMore() {
	ajax(`/search/${searchText}?page=${page}`).done((data) => {
		
		const videos = JSON.parse(data);

		for(const vid of videos) {
			// const downloaded = vid.downloaded;
			// console.log(vid);

			content.append(new VideoItem({
				...vid,
				source: {
					source: 'pornhub',
					type: 'search',
					data: vid.downloaded
					      ? '📦 In Library'
								: '💾 Download'
				}
			}))
		}

		page ++;

	})
}

//test

content.on('click', 'img', e => {
	ajax({
		url: '/videos/' + $(e.target).parent().parent().attr('vid'),
		method: 'POST'
	}).done(_ => {
		// alert('asdfasdf')
	});
})

$('#searchButton').click(e => {
	searchText = $('#searchText').val();
	searchText = searchText.replace(/ /g, '%20');

	clear();

	loadMore();

})


$('#loadMore').click(_ => {
	loadMore();
});


// console.log('asdfasdfasdf');