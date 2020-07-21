import { LitElement, html, css } from 'lit-element';

class NotFound extends LitElement {
	static get styles() {
		return css`

		`;
	}

	render() {
		return html`
<h1>Hmmmmm... ? ? ?</h1>
<p> Not sure how you got here, or really even where here is.</p>
		`;
	}
}


customElements.define('not-found-page', NotFound);