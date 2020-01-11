import $ from 'jquery'
import VideoItem from './../lib/VideoItem';
import { LitElement, html, css } from 'lit-element';
import exporter from './../lib/exporter';

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
			console.log(data)
			const videos = data;
			this.videos = videos;
		});
	}

	static get properties() {
		return {
			videos: { type: Array }
		}
	}

	render() {
		console.log('rendering', this.videos)
		return html`
			<div class="content">${
				this.videos.map(video => {
					return new VideoItem(video);
					// return html;
				})
			}</div>
			<link rel="stylesheet" href="./library.css">
		`;
	}
}


export default exporter('library-page', Library);