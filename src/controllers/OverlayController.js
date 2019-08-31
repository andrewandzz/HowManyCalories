export default class OverlayController {
	constructor(model, view) {
		this.model = model;
		this.view = view;
	}

	openSetGrams(itemElem) {
		this.model.setItem(itemElem);
		this.view.openOverlay();
		this.view.openSetGrams();

		this.model.isSetGramsOpened = true;
	}

	async closeSetGrams() {
		this.view.closeSetGrams();
		await this.view.closeOverlay();
		this.model.isSetGramsOpened = false;
	}

	validateGramsInput() {
		const value = this.model.itemData.grams;

		if (!value || isNaN(parseInt(value)) || +value === 0) {
			this.view.showGramsInvalidInput();
			return false;
		} else {
			this.model.itemData.grams = +value;
			return true;
		}
	}

	increaseGrams() {
		let grams = +this.model.itemData.grams;

		if (!grams || +grams === 0) {
			grams = 50;
		} else if (grams === 999999) {
			return;
		} else if (grams === 999950) {
			grams = 999999;
		} else {
			if (grams % 50 === 0) {
				grams += 50;
			} else {
				// if 240, then 240 + (50 - 40)
				const diff = grams % 50;
				grams = grams + (50 - diff);
			}
		}

		this.model.itemData.grams = grams;
		this.view.renderGramsNumber(grams);
		this.view.focusInput();
		this.view.animateImgChangeSize(1);
	}

	decreaseGrams() {
		let grams = this.model.itemData.grams;

		if (!grams || +grams === 0 || grams === 50) {
			grams = 1;
		} else if (grams === 1) {
			return;
		} else {
			if (grams % 50 === 0) {
				grams -= 50;
			} else {
				// if 240, then 240 - 40
				const diff = grams % 50;
				grams = grams - diff;
			}
		}

		this.model.itemData.grams = grams;
		this.view.renderGramsNumber(grams);
		this.view.focusInput();
		this.view.animateImgChangeSize(0);
	}

	isGramsInputChanged() {
		return this.model.firstValue !== this.model.itemData.grams;
	}

	openContact() {
		if (!this.model.contactElem) {
			this.view.renderContact();
			this.setupContactListeners();
		}
		this.view.openOverlay();
		this.view.openContact();

		this.model.isContactOpened = true;
	}

	async closeContact() {
		if (this.model.isThanksOpened) return;

		this.model.isContactOpened = false;
		this.view.closeContact();
		await this.view.closeOverlay();
	}

	async sendMessage() {
		window.location.href = 'mailto:andrewandzz1@gmail.com?subject=Msg&body=Hello';

		await this.view.showContactThanks();
		await this.closeContact();		
		this.view.clearContact();
	}


	async handleOverlayGramsClose(save) {
		const itemElem = this.model.itemElem;
		const type = this.model.STATE.Menu.model.current;
		const title = this.model.itemData.title;

		if (save) {
			const Calculator = this.model.STATE.Calculator;
			const Foods = this.model.STATE.Foods;

			if (itemElem.classList.contains('hover')) {
				// if it was NOT selected
				if (this.validateGramsInput()) {
					const grams = this.model.itemData.grams;
					
					await this.closeSetGrams();

					Calculator.setGrams(Foods.model.sets[type].getItemObj(title), grams);
					Foods.view.selectItem(itemElem);
					Foods.view.setItemGrams(itemElem, grams);

					itemElem.classList.remove('hover');
				}

			} else {
				// if it WAS selected
				if (this.isGramsInputChanged()) {
					// something changed, check
					if (this.validateGramsInput()) {
						const grams = this.model.itemData.grams;

						await this.closeSetGrams();

						Calculator.setGrams(Foods.model.sets[type].getItemObj(title), grams);
						Foods.view.setItemGrams(itemElem, grams);
					}

				} else {
					// nothing changed, just close
					this.closeSetGrams();
				}
			}

		} else {
			// if we don't want to save, then we don't care
			await this.closeSetGrams();
			itemElem.classList.remove('hover');
		}
	}


	


	setupContactListeners() {
		this.model.contactElem.form.addEventListener('submit', event => {
			event.preventDefault();
			this.sendMessage();
		});

		this.model.contactElem.email.addEventListener('invalid', event => {
			event.preventDefault();
			this.sendMessage();
		});

		this.model.contactElem.message.addEventListener('invalid', event => {
			event.preventDefault();
			this.view.showContactInvalidMessage();
		});
	}
}




