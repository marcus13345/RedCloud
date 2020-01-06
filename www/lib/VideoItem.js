import {html, LitElement, css} from 'lit-element';
import exporter from './exporter.js';
const __options = require('./../../options.json')

class VideoItem extends LitElement {
	constructor(video) {
		super();
		this.video = video;
		// console.log('created VideoItem for', video)
	}

	static get styles() {
		return css`

:host {
	margin: 16px;
	display: inline-block;
}

.videoItem {
	border: 1px solid #555;
	display: inline-block;
	--video-size: 20;
	--width: calc(16px * var(--video-size));
	--height: calc(9px * var(--video-size));
	width: var(--width);
	height: var(--height);
	display: inline-block;
	border-radius: 20px;
	height: auto;
	padding-bottom: 14px;
	background: #222;
}

.videoItem > video {
	width: var(--width);
	height: var(--height);
	object-fit: cover;
	border-radius: 20px;
}

.videoItem > img {
	width: var(--width);
	height: var(--height);
	object-fit: cover;
	border-radius: 20px;
}

.videoItem > div.lazy {
	height:0px;
	overflow: visible;
}

.videoItem > div.lazy > img.lazy {
	display:block;
	width: var(--width);
	height: var(--height);
	border-radius: 20px;
}

.videoItem > img.placeholder {
	background: black;
	width: var(--width);
	height: var(--height);
}

.videoItem span {
	color: white;
	display:block;
	text-align: left;
	
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	
	padding-left: 3px;
}

span.title {
	padding-top: 8px;
}

span.subtitle {
	font-size: 0.9em;
	color: #999;
}

.video {
	display: inline-block;
}
		`;
	}

	render() {

		let videoElement;
		if(__options.content.censor) {
			videoElement = html`<img class="placeholder" src="https://via.placeholder.com/1600x900/333333/800000?text=Hidden"></img>`;
		} else if (this.video.downloaded) {
			videoElement = html`
				<div class="lazy"><img class="lazy" width="160"
						class="placeholder"
						height="90"
						src="${this.video.thumb || "https://via.placeholder.com/1600x900/000000/808080?text=Loading..."}">
				</img></div><!--
				--><video onloadstart="this.volume=0"
						volume="0"
						width="160"
						height="90"
						@mouseover=${function(e) {e.target.play()}}
						@mouseleave=${function(e) {e.target.pause()}}
						
						>
				<source src="${
						redcloud.store.get('settings.apiBasePath')
					}/videos/stream/${
						this.video.vid
					}#t=20"
					type="video/mp4">
			</video>`;
		} else if ('thumb' in this.video) {
		
			videoElement = html`
			<img width="160"
			     class="placeholder"
					 height="90"
					 src="${this.video.thumb}">
			</img>`;
		} else {
			videoElement = html`<img width="160" class="placeholder"  height="90" src="https://via.placeholder.com/1600x900/000000/808080?text=Unavailable"></img>`;
		}

	// content.on('mouseover', 'video', e => {e.target.play()})
	// content.on('mouseleave', 'video', e => {e.target.pause()})


		return html`<!--
			below is a hack to remove whitespace, html ugh
			--><div class="video">
			<a title="${this.video.title}" href="./watch.html?v=${this.video.vid}"><!-- 
				--><div class="videoItem">
					${videoElement}
					<br>
					${this.getTextLine()}
					<div style="clear:both"></div>
				</div><!--
			--></a>
			</div><!--
		-->`;
	}

	getTextLine() {
		const source = this.video.source.source || 'unknown';
		switch(source) {
			case 'pornhub': return html`
				${getSourceLogo(source)}
				<span class="title">${this.video.title}</span>
				<span class="subtitle">${this.video.source.data}</span>
			`;
			case 'chaturbate': return html`
				${getSourceLogo(source)}
				<span class="title">${this.video.title.split(' ')[0]}</span>
				<span class="subtitle">${new Date(this.video.addedTimestamp).toLocaleString()}</span>
			`;

		}
	}
}

export default exporter('video-item', VideoItem);

function getSourceLogo(name) {
	switch(name) {
		case 'pornhub': return html`<img src="./logos/pornhub.png" style="
    --size: 32px;
    width: var(--size);
    height: var(--size);
    background: white;
    object-fit: contain;
    display: block;
    float: left;
    border-radius: 5px;
		margin-top: 10px;
		margin-left: 12px;
		margin-right: 6px;
">
		`;
		case 'chaturbate': return html`<img src="./logos/chaturbate.jpg" style="
    --size: 32px;
    width: 100px;
    height: var(--size);
    background: white;
    object-fit: contain;
    display: block;
    float: left;
    border-radius: 5px;
		margin-top: 10px;
		margin-left: 12px;
		margin-right: 6px;
">
		`;
	}
}