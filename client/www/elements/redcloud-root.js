import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
const store = redcloud.store;

const VIEWS = {
	HOME: 'home',
	SEARCH: 'search',
	WATCH: 'watch',
	SETTINGS: 'settings'
}

class RedcloudRoot extends LitElement {

	view = store.get('app.view') || VIEWS.HOME;
	video = store.get('app.video') || null;
	// video = store.get('app.video');
	tags = [];

	static get properties() {
		return {
			videos: { type: Array },
			view: { type: String },
			tags: { type: Array },
			video: { type: Object },
		};
	}

	updated() {
		store.set('app.view', this.view);
		store.set('app.video', this.video);
		//refresh
	}

	async firstUpdated() {
		const res = await (await ajax('/videos/tags')).json();
		
		const min = Math.min(...Object.values(res));
		const max = Math.max(...Object.values(res));
		const tags = Object.entries(res).map(([key, val]) => {
			return { tag: key, count: val };
		}).sort((a, b) => {
			return b.count - a.count;
		}).slice(0, 10);

		this.tags = tags;

		console.log(tags)
	}

//coral
// cornflowerblue
//crimson
	static get styles() {
		return css`

[hidden] {
	display: none;
}

.viewport {
	/* background: blueviolet; */
	height: 100%;
	overflow-y: auto;
}

/* width */
::-webkit-scrollbar {
	width: 4px;
}

/* Track */
::-webkit-scrollbar-track {
	background: transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
	background: coral;
}

/* Handle on hover */
/* ::-webkit-scrollbar-thumb:hover {
	background: ;
} */

.root {
	display: grid;
	grid-template-columns: min-content 1fr;
	grid-template-rows: 50px 1fr;
	height: 100%;
	overflow: hidden;
}

.navbar {
	grid-column: span 3;
	background: #333;
}

.sidebar {
	grid-column: span 0;
	transition: width 200ms;
	width: 300px;
}

.sidebar[size=hidden] {
	width: 0px;
}

.sidebar[size=mini] {
	width: 50px;
}

.sidebar:hover {
	width: 300px;
}

.sidebar > ul {
	/* position: relative; */
	list-style: none;
	padding: 0px;
}

ul li {
	padding-left: 16px;
	padding-right: 16px;
	line-height: 40px;
	font-size: 15px;
	cursor: pointer;
}

ul li:hover {
	background: rgba(255, 255, 255, 0.2);
}

ul li[selected] {
	background: rgba(255, 255, 255, 0.2);
	font-weight: 700;
}

ul li.indent {
	text-indent: 16px;
}


		`;
	}

	navigate(evt) {
		const view = evt.target.getAttribute('view');
		if(this.view != view) {
			this.view = view;
		} else {
			switch(view) {
				case VIEWS.HOME: {
					this.shadowRoot.querySelector('redcloud-page-index').reload();
					break;
				}
			}
		}
	}

	render() {
		return html`
		
		<div class="root">

			<div class="navbar">
				<button
					@click=${evt => this.shadowRoot.querySelector('.sidebar').setAttribute('size', 'hidden')}
				>HIDE</button>
				<button
					@click=${evt => this.shadowRoot.querySelector('.sidebar').setAttribute('size', 'mini')}
				>MINI</button>
				<button
					@click=${evt => this.shadowRoot.querySelector('.sidebar').setAttribute('size', 'normal')}
				>NORMAL</button>
			</div>
			<div
				class="sidebar"
				size="${
					this.view === VIEWS.WATCH ?
						'mini' :
						'normal'
				
				}">
				<ul @click=${this.navigate}>
					<li ?selected=${this.view === VIEWS.HOME} view="${VIEWS.HOME}">Home</li>
					<li>Recommended</li>
					<li>Tags</li>
					${this.tags.map(({tag, count}) => html`
						<li class="indent">${tag} (${count})</li>
					`)}
					<br>
					<li ?selected=${this.view === VIEWS.SETTINGS} view="${VIEWS.SETTINGS}">Settings</li>
				</ul>
			</div>
			<div class="viewport">
				<redcloud-page-index
					@queueVideo=${evt => {this.video = evt.detail; this.view = VIEWS.WATCH}}
					?hidden=${this.view !== VIEWS.HOME}
				></redcloud-page-index>
				<redcloud-page-watch
					?hidden=${!(this.view === VIEWS.WATCH)}
					.video=${this.video}
				></redcloud-page-watch>
			</div>
		</div>
		`;
	}
}


customElements.define('redcloud-root', RedcloudRoot);