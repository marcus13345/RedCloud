import $ from 'jquery';

// $('#statePre').html("go fuck yourself jimmy");

function stringify(val, depth, replacer, space) {
	depth = isNaN(+depth) ? 1 : depth;
	function _build(key, val, depth, o, a) { // (JSON.stringify() has it's own rules, which we respect here by using it for property iteration)
		return !val || typeof val != 'object' ? val : (a=Array.isArray(val), JSON.stringify(val, function(k,v){ if (a || depth > 0) { if (replacer) v=replacer(k,v); if (!k) return (a=Array.isArray(v),val=v); !o && (o=a?[]:{}); o[k] = _build(k, v, a?depth:depth-1); } }), o||(a?[]:{}));
	}
	return JSON.stringify(_build('', val, depth), null, space);
}

function loop() {
	ajax('/inspector/').done(data => {
		console.log(data);
		// $('#statePre').html("go fuck yourself jimmy");
		$('#statePre').html(stringify(data, 4, null, 2));
	})
	setTimeout(loop, 1000);
}

setTimeout(loop, 1000);
