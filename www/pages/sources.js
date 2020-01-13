import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import exporter from './../lib/exporter';
import $ from 'jquery';

const config = {
	sources: {
		pornhub: {
			name: 'Pornhub',
			sources: [
				{
					name: 'history',
					friendlyName: 'History',
				},
				{
					name: 'favorites',
					friendlyName: 'Favorites',
				},
				{
					name: 'uploads',
					friendlyName: 'Uploads',
				},
				{
					name: 'user',
					friendlyName: 'History',
					hidden: true
				}
			]
		},
		chaturbate: {
			name: 'Chaturbate',
			sources: [
				{
					name: 'stream',
					friendlyName: 'Record Stream'
				}
			]
		}
	}
}

class SourcesPage extends LitElement {
	constructor() {
		super();
		this.refreshSources();
	}

	refreshSources() {
		ajax('/sources').done(data => {
			this.sources = data;
		});
	}

	static get styles() {
		return css`

.content {
	margin-top: 24px;
	--comf: 24px;
}

.content table {
	margin: 0px auto;
	width: 100%;
	max-width: 800px;
	min-width: 500px;
	border-spacing: 0px;
	background: #222;
	border-radius: 20px;
	table-layout: fixed;
}

table thead th {
	padding: var(--comf);
	font-weight: 500;
}

td {
	padding: var(--comf);
}

tr td {
	border-top: 1px solid #2f2f2f;
	font-size: 36px;
	font-weight: 100;
}

.new {
	transition: height 400ms;
	text-align: center;
	cursor: pointer;
	font-size: 24px;
	height: 28px;
	vertical-align: top;
}

.service.options {
	margin-top: 16px;
}

.service.options div {
	display: inline;
}

.service.options img {
	margin: 8px;
	cursor: pointer;
}

.source.options {

}

td.expanded.service > div {
	display: inline;
	cursor: pointer;
}

.expanded {
	transition: height 400ms;
	height: 200px;
	cursor: initial;
}

.expanded.smaller {
	height: 100px;
}

tr.service {
	width: 175px;
}

.escape {
	display: inline-block;
	float: right;
	font-size: 24px;
	cursor: pointer;
	height: 100%;
}

.new.name .escape {
	height: initial;
}

.logo.left {
	display: inline-block;
	float: left;
	cursor: pointer;
}

.source.button {
	padding: 16px 8px;
	cursor: pointer;
	display: inline-block;
	margin: 8px;
	border-radius: 10px;
	padding: 12px 16px;
}

.source.button:hover {
	background: #333;
}

.source.button:active {
	background: #444;
}

input.name {
	width: 100%;
	background: inherit;
	border: none;
	font-size: 36px;
	font-weight: lighter;
	border-bottom: 1px solid grey;
	padding-bottom: 1px;
	color: white;
	transition: padding-bottom 500ms;
	padding-top: 50px;
	padding-bottom: 8px;
}

input.name:focus, input.name:active {
	border-bottom: 2px solid white;
	outline: none;
	padding-bottom: 2px;
}

.add.source.button {
	font-size: 24px;
	font-weight: 200;
	background: inherit;
	border-radius: 10px;
	padding: 16px 8px;
	cursor: pointer;
	display: inline-block;
	margin: 8px;
	border-radius: 10px;
	padding: 12px 16px;
	position: absolute;
	bottom: 16px;
	right: 16px;
	color: white;
	border: none;
}

.add.source.button:hover {
	background: #333;
}

.add.source.button:active {
	background: #444;
	outline: none;
}
.add.source.button:focus {
	outline: none;
}

td.name {
	position: relative;
}

		`;
	}

	static get properties() {
		return {
			sources: { type: Array },
			addNew: { type: Boolean },
			service: { type: String },
			source: { type: String }
		}
	}

	toggleAddNew() {
		this.addNew = !this.addNew;
		if(!this.addNew) {
			this.service = '';
			this.source = '';
			this.name = '';
		}
	}

	render() {
		const escape = html`
			<div
				class="escape"
				@click=${(e) => {
					this.toggleAddNew();
					e.stopPropagation();
					// e.bubble = false;
					// e.preventDefault();
					return false;
				}}
			>&#x2715;<div>
		`;
		return html`
		<!--
<h3>Sources</h3>

<input type="text" id="source">
<input type="text" id="type">
<input type="text" id="data">
<input type="button" value="Add Source" id="addSource">
<br>

<span>Cron status: <span id="status"></span></span><br>
<button id="pause">pause</button> <button id="unpause">unpause</button>

<br>
-->

<div class="content">



	<table>
		<thead>
			<tr>
				<th>Service</th>
				<th>Source</th>
				<th>Name</th>
			</tr>
		</thead>
		<tbody id="sourcesTable">
			<tr class="newRow">
				<td 
					class="${classMap({
						new: !this.service,
						expanded: this.addNew,
						smaller: !!this.service && !this.source,
						service: this.service
					})}"
					@click=${() => { if(!this.addNew) this.toggleAddNew() }}
					colspan="${
						!this.service ? 3 : 1
					}">${(() => {
						if(!this.addNew) return 'Add New Source';
						
						if(!this.service) {
							const options = Object.entries(config.sources).map(([v, k]) => {
								return html`
									<div
										@click=${() => { this.service = v }}
									>${getSourceLogo(v)}</div>
								`;
							});
							return [
								// html`Add New Source<br>`,
								escape,
								'Select a Service',
								html`
									<div class="service options">
										${options}
									</div>
								`
							]
						} else {
							return html`
								<div @click=${() => {
									this.service = '';
									this.source = '';
								}}>
									${getSourceLogo(this.service)}
								</div>
							`;
						}
					})()}</td>

					${this.service ? html`
						<td colspan="${!this.source ? 2 : 1}" class="${classMap({
						new: !this.source,
					})}">
						${(() => {
							if (!this.source) {
								const options = config.sources[this.service].sources.map(({
									name,
									friendlyName,
									hidden
								}) => {
									if (hidden) return '';
									return html`
										<div class="source button"
											@click=${() => { this.source = name }}>
											${friendlyName}
										</div>`;
									});
									return [
										escape,
										html`Select a Source<br>`,
										options
									];
								} else {
									return html`
										<div @click=${() => {
											this.source = '';
										}}>
											${config.sources[this.service].sources.filter(a => a.name === this.source)[0].friendlyName}
										</div>
									`;
								}
							})()}
						</td>
					` : ''}

					${this.source ? html`
						<td class="new name">
							${escape}
							<input type="text" class="name" placeholder="Username"></input>
							<br>
							<button 
								@click=${() => {
									const service = this.service;
									const source = this.source;
									const name = $(this.shadowRoot).find('input.name').val();

									const obj = {
										source: service,
										type: source,
										data: name
									};

									ajax({
										url: '/sources',
										method: 'POST',
										contentType: "application/json; charset=utf-8",
										dataType: "json",
										data: JSON.stringify(obj)
									}).done(_ => {
										this.service = '';
										this.source = '';
										this.toggleAddNew();
										this.refreshSources();
									})
								}}
								class="add source button">ADD SOURCE</button>
						</td>
					` : ''}

			</tr>
			${this.sources.map(source => {
				return html`
					<tr>
						<td class="service">${getSourceLogo(source.source, 16)}</td>
						<td class="source">${(() => {
							const configSource = config.sources[source.source].sources.filter(a => a.name === source.type)[0];
							if(configSource) return configSource.friendlyName;
							else return source.type;
						})()}</td>
						<td class="name">${source.data}</td>
					</tr>
				`
			})}
		</tbody>
	</table>
</div>
		`;
	}
}

export default exporter('sources-page', SourcesPage);


function getSourceLogo(name, size = 32) {
	switch(name) {
		case 'pornhub': return html`<img src="./logos/pornhub.png" style="
    --size: 64px;
    width: var(--size);
    height: var(--size);
    background: white;
    object-fit: contain;
    display: inline-block;
    border-radius: 5px;
">
		`;
		case 'chaturbate': return html`<img src="./logos/chaturbate.jpg" style="
    --size: 64px;
		--aspect: 2.5;
    width: calc(var(--size) * var(--aspect));
    height: var(--size);
    background: white;
    object-fit: contain;
    display: inline-block;
    border-radius: 5px;
">
		`;
	}
}