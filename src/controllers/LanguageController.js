export default class LanguageController {
	constructor(model, view) {
		this.model = model;
		this.view = view;
	}

	async setLanguage(newLanguage) {
		if (!newLanguage) {
			this.model.fetchLocalStorage();
		} else {
			this.model.changeLanguage(newLanguage);
		}
		
		if (this.model.current === 'ru') {
			this.model.loadRuFonts();
			this.model.STATE.Menu.view.ruMenu();

		} else {
			this.model.STATE.Menu.view.enMenu();
		}

		await this.model.fetchDictionary();
	}
}