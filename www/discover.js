import $ from 'jquery'
const content = $('.content')
let searchText = "", page = 1;
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
			const downloaded = vid.downloaded;
			console.log(vid);
			if (censor) {
				vid.thumb = 'https://via.placeholder.com/1600x900/000000/808080?text=Hidden';
			} else if (downloaded) {
				content.append(`<a href="/api/videos/stream/${vid.vid}" vid="${vid.vid}"><div class="videoItem">
					<img width="160" height="90" src="${vid.thumb}" style="border: 3px solid #A7C168"></img>
				</div></a>`)
			} else {
				content.append(`<a href="#" vid="${vid.vid}"><div class="videoItem">
					<img width="160" height="90" src="${vid.thumb}" style="border: 3px solid #FE9766"></img>
				</div></a>`)
			}
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