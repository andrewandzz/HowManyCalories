import axios from 'axios';

export default class LanguageModel {
	constructor(STATE) {
		this.STATE = STATE;
		this.langs = ['en', 'ru'];
		this.current = null;
		this.dictionary = null;
	}

	fetchLocalStorage() {
		const language = window.localStorage.getItem('lang');
		
		if (!language) {
			this.current = 'en';
			window.localStorage.setItem('lang', 'en');
		} else {
			this.current = language;
		}
	}

	async fetchDictionary() {
		const response = await axios(`./data/lang/${this.current}.json`);
		this.dictionary = response.data;
	}

	changeLanguage(newLanguage) {
		window.localStorage.setItem('lang', newLanguage);
		this.current = newLanguage;
	}

	loadRuFonts() {
		if (document.getElementById('ru-font')) return;

		const linksMarkup = `
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300&display=swap" rel="stylesheet" id="ru-font">
<link href="https://fonts.googleapis.com/css?family=Roboto:300&display=swap" rel="stylesheet">`;

		document.head.insertAdjacentHTML('beforeend', linksMarkup);
	}
}


