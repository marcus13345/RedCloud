import { LitElement, html, css } from 'lit-element';
import VideoItem from '../lib/VideoItem'

class DiscoverPage extends LitElement {
	constructor({query: {searchText = 'porn'} = {}} = {}) {
		super();
		this.searchText = searchText;
		this.videos = [];
		this.page = 1;
		ajax(`/search/${this.searchText}?page=${this.page}`)
			.done((data) => {
			const videos = JSON.parse(data);
			this.videos = [...this.videos, ...videos];
			this.page ++;
		});
	}

	static get properties() {
		return {
			videos: { type: Array }
		};
	}

	static get styles() {
		return css`
.content {
	text-align: center;
  padding: 8px 0px;
}
		`;
	}

	render() {
		return html`
<div class="content">${
	this.videos.map(video => {
		return new VideoItem({
			...video,
			source: {
				source: 'pornhub',
				type: 'search',
				data: video.downloaded
						? 'In Library'
						: 'Download'
			}
		})
	})
}</div>
		`;
	}

	
}


customElements.define('discover-page', DiscoverPage);