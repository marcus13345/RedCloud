import $ from 'jquery';

$(document).ready(_ => {
	$("#repl").on('keyup', async function (e) {
		if (e.keyCode === 13) {
			let query = $('#repl').val();
			$('#repl').val('');
			console.log(query);
			let response = await exec(query);
			if(typeof response === 'object')
				response = JSON.stringify(response, null, 2);
			$('#output').html(response + '\n\n\n' + $('#output').html())
		}
	});
});
