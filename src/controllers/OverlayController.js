export default class OverlayController {
	constructor(model, view) {
		this.model = model;
		this.view = view;
	}

	open(itemElem) {
		/* if itemElem, then open 'set-grams' */
		if (itemElem) {
			this.model.setItem(itemElem);
			this.view.openOverlay();
			this.view.openSetGrams();
		}
	}

	async close() {
		// if SetGrams opened, then close SetGrams too <=== TO DO
		this.view.closeSetGrams();
		await this.view.closeOverlay();
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
}




