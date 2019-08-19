export default class LanguageController {
	constructor(model, view) {
		this.model = model;
		this.view = view;
	}

	async setCurrent() {
		this.model.fetchLocalStorage();

		if (this.model.current === 'ru') this.model.loadRuFonts();

		await this.model.fetchDictionary();
	}

	async change(lang) {
		this.model.changeLanguage(lang);

		if (lang === 'ru') this.model.loadRuFonts();

		await this.model.fetchDictionary();
	}
}