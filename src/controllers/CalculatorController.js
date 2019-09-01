import DOMElems from '../views/dom';

export default class CalculatorController {
	constructor(model, view) {
		this.model = model;
		this.view = view;
	}

	addItem(itemObj) {
		this.model.addItem(itemObj);
		this.view.showCaloriesPopup(itemObj.title);
		this.calculateTotalCalories();
	}

	deleteItem(title) {
		this.model.deleteItem(title);
		this.calculateTotalCalories();
	}

	calculateTotalCalories() {
		this.model.calculateTotalCalories();
		this.view.renderTotalCalories();

		if (this.model.items.length === 2 && !this.model.trashIsDemonstrated) {
			this.view.demonstrateTrashAnimation();
			return;
		}

		// do we need the trash to be active
		this.checkTrashActive();
		this.view.setupTrashEventListeners();
	}

	setGrams(itemObj, grams) {
		this.model.setGrams(itemObj, grams);
		this.view.showCaloriesPopup(itemObj.title);
		this.calculateTotalCalories();
	}

	includes(title) {
		const index = this.model.items.findIndex(item => item.title === title);
		return index >= 0;
	}

	clearTotalCalories() {
		this.model.clearTotalCalories();
		this.view.clearTotalCalories();
	}

	checkTrashActive() {
		if (this.model.totalCalories === 0) {
			this.view.trashActive(false);
		} else if (this.model.totalCalories > 0) {
			this.view.trashActive(true);
		}
	}
}





