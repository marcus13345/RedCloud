import { LitElement, html, css } from 'lit-element';
import exporter from '../lib/exporter';

class WatchPage extends LitElement {

	constructor({video}) {
		super();
		this.video = video;
	}

	static get styles() {
		return css`
#video {
	height: 100%;
	display: block;
	overflow: hidden;
	box-sizing: border-box;
}

#video video {
	width: 100%;
	height: calc(100% - 130px);
	/* height: 10px; */
	background: black;
}

#video h1 {
	font-weight: 200;
	vertical-align: top;
	margin-top: 40px;
	display: inline-block;
}

#video img {
	display: inline;
}
		`;
	}

	render() {
		const video = this.video;
		return html`
			<div id="video">
				<video style="" onloadstart="this.volume=0;this.controls=true;" autoplay>
						<source src="${
							redcloud.store.get('settings.apiBasePath')
						}/videos/stream/${video.vid}" type="video/mp4">
				</video>
				<div><!--
					--><div>${this.getSourceLogo(video.source.source)}
						<h1>${video.title}<h1>
					</div>
				</div>
			</div>
		`;
	}


	getSourceLogo(name) {
		switch(name) {
			case 'pornhub': return html`<img src="./logos/pornhub.png" style="
			--size: 64px;
			width: var(--size);
			height: var(--size);
			background: white;
			object-fit: contain;
			border-radius: 5px;
			margin:30px;
	">
			`;
			case 'chaturbate': return html`<img src="./logos/chaturbate.jpg" style="
			--size: 64px;
			--aspect: 2.5;
			width: calc(var(--size) * var(--aspect));
			height: var(--size);
			background: white;
			object-fit: contain;
			border-radius: 5px;
			margin: 30px
	">
			`;
		}
	}
}


export default exporter('watch-page', WatchPage);

