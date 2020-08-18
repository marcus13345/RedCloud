import { LitElement, html, css } from 'lit-element';

class PageIndex extends LitElement {

	static get styles() {
		return css`

.content {
	padding-top: 24px;
}


.grid {
	display: grid;
	/* margin: 0px auto;
	max-width: 1000px; */
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	grid-template-rows: auto;
	grid-auto-flow: dense;
	gap: 16px;
	padding: 16px;
}

.grid video-grid-thumb {
	width: 100%;
	height: 200px;
}

.header {
	display: inline-block;
	font-size: 20px;
	padding-top: 8px;
	padding-bottom: 8px;
}

.inner {
	padding-left: 16px;
	padding-right: 16px;
}

hr {
	border: none;
	border-top: 3px solid rgba(255, 255, 255, 0.1);
}

video-grid-thumb {
	border-radius: 10px;
}

		`;
	}

	constructor() {
		super();
		this.random = [];
		this.recent = [];
		this.reload();
	}

	async reload() {
		const recents = await ajax('/videos/recent?n=12');
		this.recent = [...await recents.json()];
		const randoms = await ajax('/videos/random?n=6');
		this.random = [...await randoms.json()];
	}

	static get properties() {
		return {
			recent: { type: Array },
			random: { type: Array }
		}
	}

	selectVideo(video) {
		this.dispatchEvent(new CustomEvent('queueVideo', {
			detail: video
		}))
	}

	render() {
		console.log('rendering')
		return html`
			<div class="content">
				<span class="inner header">Recent</span>
				<div class="grid">
					${this.recent.map(video => {return html`<!--
						--><video-grid-thumb @click=${this.selectVideo.bind(this, video)} .video=${video}></video-grid-thumb><!--
					-->`})}
				</div><div class="inner"><hr></div>
				<span class="inner header">Random</span>
				<div class="grid">
					${this.random.map(video => {return html`<!--
						--><video-grid-thumb @click=${this.selectVideo.bind(this, video)} .video=${video}></video-grid-thumb><!--
					-->`})}
				</div>
			</div>
			<!-- <link rel="stylesheet" href="./library.css"> -->
		`;
	}
}


customElements.define('redcloud-page-index', PageIndex);