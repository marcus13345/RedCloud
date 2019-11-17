import $ from 'jquery';
import { html } from 'lit-element';

$(document).ready(_ => {
	ajax('/sources').done(data => {
		for(const source of data) {
			$('#sourcesTable').append(`
				<tr>
					<td><a href="/api/sources/delete/${source._id}">delete</a></td>
					<td>${source.source}</td>
					<td>${source.type}</td>
					<td>${source.data}</td>
				</tr>
			`)
		}
	});

	$('#addSource').click(_ => {
		const obj = {
			source: $('#source').val(),
			type: $('#type').val(),
			data: $('#data').val()
		};

		ajax({
			url: '/sources',
			method: 'POST',
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			data: JSON.stringify(obj)
		})
	});



	ajax('/sources/status').done(data => {
		$('#status').html(data.running ? 'up' : 'paused')
	});

	$('#pause').click(_ => {
		ajax('/sources/pause').done(_ => _);
	});
	
	$('#unpause').click(_ => {
		ajax('/sources/unpause').done(_ => _);
	});


});