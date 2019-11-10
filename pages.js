

function runTest(pages) {
	// let pages = 45;
	function guess(page) {
		stats.apiCalls ++;
		return page <= pages;
	}

	let stats = {
		apiCalls: 0,
		up: 0,
		down: 0
	}

	pagesMin = 1, pagesMax = Infinity;

	while (pagesMin != pagesMax) {
		if(pagesMax == Infinity) {
			if(guess(pagesMin)) {
				// console.log(`range ${pagesMin} +`);
				pagesMin *= 2;
				stats.up ++;
			} else {
				pagesMax = pagesMin;
				pagesMin /= 2;
				// console.log(`range ${pagesMin} - ${pagesMax}`);
			}
		} else {
			let average = Math.floor((pagesMin + pagesMax) / 2);
			// pagesMin = pagesMax;

			if((pagesMax - pagesMin) < 2) {
				if(guess(pagesMax)) stats.number = pagesMax;
				else stats.number = pagesMin;
				return stats;
			}

			if(guess(average)) {
				pagesMin = average;
			} else {
				pagesMax = average;
			}

			stats.down ++;

			// console.log(`range ${pagesMin} - ${pagesMax}`);
		}
	}

}

for(let i = 1; i < 400; i ++) {
	let stats = runTest(i);
	console.log(`${stats.apiCalls}, ${stats.up}, ${stats.down}, ${stats.number}`)
}