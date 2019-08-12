import DOMElems from '../views/dom';

export default class CalculatorModel {
	constructor() {
		this.totalCalories = 0;
		this.items = [];
	}

	addItem(itemObj) {
		this.items.push({
			title: itemObj.title,
			calories: itemObj.calories,
			grams: 100
		});
	}

	deleteItem(title) {
		const index = this.items.findIndex(item => item.title === title);
		this.items.splice(index, 1);
	}

	calculateTotalCalories() {
		this.totalCalories = this.items.reduce((accum, item) => {
			return accum + item.calories;
		}, 0);
	}

	setGrams(itemObj, newGrams) {
		const title = itemObj.title;
		const item = this.items.find(item => item.title === title);

		// if there is no such item yet, then create
		if (!item) {
			const newCalories = +(newGrams * itemObj.calories / 100).toFixed(2);

			this.items.push({
				title: itemObj.title,
				calories: newCalories,
				grams: newGrams
			});
		} else {
			const newCalories = +(newGrams * item.calories / item.grams).toFixed(2);
			item.calories = newCalories;
			item.grams = newGrams;
		}
	}

	getCalories(title) {
		const item = this.items.find(item => item.title === title);
		return item.calories;
	}

	getGrams(title) {
		const item = this.items.find(item => item.title === title);
		return (!item) ? false : item.grams;
	}
}