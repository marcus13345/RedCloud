import { LitElement, html, css } from 'lit-element';

class WatchPage extends LitElement {

	constructor() {
		super();
	}
	
	static get properties() {
		return {
			video: { type: Object }
		}
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

	updated() {
		console.log('asd')
		this.shadowRoot.querySelectorAll('video').forEach(v => v.load());
	}

	render() {
		if(!this.video) return html``;
		return html`
			<div id="video">
				<video style="" @loadstart="${evt => {
					evt.target.volume = 0;
					evt.target.controls = true;
				}}" autoplay>
						<source src="${
							redcloud.store.get('settings.apiBasePath')
						}/videos/stream/${this.video.vid}" type="video/mp4">
				</video>
				<div><!--
					--><div>
						<h1>${this.video.title}</h1>
					</div>
				</div>
			</div>
		`;
	}
}


customElements.define('redcloud-page-watch', WatchPage);

