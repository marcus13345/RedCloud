import {html, LitElement, css} from 'lit-element';

class VideoItem extends LitElement {
	// constructor() {
	// 	super();
	// 	// console.log('created VideoItem for', video)
	// }

	static get properties() {
		return {
			video: { type: Object }
		}
	}

	static get censor() {
		return redcloud.store.get('settings.censor');
	}

	updated() {
		this.title = this.video.title;
	}

	firstUpdated() {
		this.onmouseover = function(e) {
			const v = this.shadowRoot.querySelector('video')
			if(v.paused && v.readyState === 4)
				v.play()
		};
		this.onmouseleave = function(e) {
			const v = this.shadowRoot.querySelector('video')
			if(!v.paused && v.readyState === 4)
				v.pause()
		};
	}

	render() {
		let videoElement;
		if(VideoItem.censor) {
			videoElement = html`<img class="placeholder" src="https://via.placeholder.com/1600x900/b000b5/c0ffee?text=Hidden"></img>`;
		} else if (this.video.downloaded) {
			videoElement = html`
				<img class="thumbnail"
						src="${this.video.thumb || "https://via.placeholder.com/1600x900/000000/808080?text=Loading..."}">
				</img></div><!--
				--><video
						@loadstart="${evt => evt.target.volume = 0}"
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
			--><style>

:host {
	display: inline-block;
	cursor: pointer;
}

.videoItem:hover span.title {
	opacity: 1;
}

.videoItem {
	display: inline-block;
	width: 100%;
	height: 100%;
	/* height: auto; */
	/* background: red; */
	position: relative;
}

.videoItem > video {

	width: 100%;
	height: 100%;
	object-fit: cover;
	position: absolute;
	left: 0px;
	top: 0px;
}

.videoItem > img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	position: absolute;
	left: 0px;
	top: 0px;
}

span.title {
	opacity: 0;
	transition: opacity 200ms;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
	line-height: 30px;
	padding-bottom: 5px;
	padding-left: 16px;
	padding-right: 16px;
	padding-top: 50px;
	letter-spacing: 1px;
	color: var(--primary-color);
	font-weight: 700;
	background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
	position: absolute;
	bottom: 0px;
	width: 100%;
	box-sizing: border-box;
}

span.subtitle {
	font-size: 0.9em;
	color: #999;
}

.video {
	display: inline-block;
	width: 100%;
	height: 100%;
}


			</style><div
					class="video"><!-- 
				--><div class="videoItem">
					${videoElement}
					<span class="title">${this.video.title}</span>
					</div>
				</div><!--
			--></div><!--
		-->`;
	}

	click() {
		return;
		// console.log('here');
		// return console.log(this.video)
		if(this.video.downloaded) {
			history.pushState({page: 'watch', video: this.video}, 'title', '#');
			navigate('watch', {video: this.video});
		} else {
			ajax({
				url: '/videos/' + this.video.vid,
				method: 'POST'
			}).done(_ => {
				console.log('asdfasdf', this.video.vid)
			});
		}
	}
}

customElements.define('video-grid-thumb', VideoItem);