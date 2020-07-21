import $ from 'jquery'
import VideoItem from '../lib/VideoItem';
import { LitElement, html, css } from 'lit-element';

class Library extends LitElement {

	static get styles() {
		return css`
.content {
	text-align: center;
  padding: 8px 0px;
}
		`;
	}

	constructor() {
		super();
		this.videos = [];
		ajax('/videos').done((data) => {
			const videos = data;
			this.videos = videos;
			console.log(data);
		});
	}

	static get properties() {
		return {
			videos: { type: Array }
		}
	}

	render() {
		return html`
			<div class="content">${
				this.videos.map(video => {
					return new VideoItem(video);
				})
			}</div>
			<!-- <link rel="stylesheet" href="./library.css"> -->
		`;
	}
}


customElements.define('library-page', Library);