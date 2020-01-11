import { LitElement, html, css } from 'lit-element';
import exporter from './../lib/exporter';

class Library extends LitElement {
	static styles() {
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


export default exporter('library-page', Library);