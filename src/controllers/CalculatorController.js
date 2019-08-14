import DOMElems from '../views/dom';

export default class CalculatorController {
	constructor(model, view) {
		this.model = model;
		this.view = view;
	}

	addItem(itemObj) {
		this.model.addItem(itemObj);
		this.view.renderCaloriesPopup(itemObj.title);
		this.calculateTotalCalories();
	}

	deleteItem(title) {
		this.model.deleteItem(title);
		this.calculateTotalCalories();
	}

	calculateTotalCalories() {
		this.model.calculateTotalCalories();
		this.view.renderTotalCalories();
	}

	setGrams(itemObj, grams) {
		this.model.setGrams(itemObj, grams);
		this.view.renderCaloriesPopup(itemObj.title);
		this.calculateTotalCalories();
	}

	includes(title) {
		const index = this.model.items.findIndex(item => item.title === title);
		return index >= 0;
	}
}