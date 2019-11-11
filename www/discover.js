import $ from 'jquery'
const content = $('.content')
let searchText = "", page = 1;

function clear() {
	content.children().remove();
	page = 1;
}
// something else
function loadMore() {
	$.ajax(`/api/search/${searchText}?page=${page}`).done((data) => {
		
		const videos = JSON.parse(data);

		for(const vid of videos) {
			const downloaded = vid.downloaded;
			console.log(vid)
			if (downloaded) {
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
	$.ajax({
		url: '/api/videos/' + $(e.target).parent().parent().attr('vid'),
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