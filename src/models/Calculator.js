export default class Calculator {
	constructor() {
		this.calories = 0;
		this.items = [];
	}

	addItem(item) {
		this.items.push(item);
	}

	deleteItem(title) {
		const index = this.items.findIndex(item => item.title === title);
		this.items.splice(index, 1);
	}

	setGrams(title, newGrams) {
		const item = this.items.find(item => item.title === title);
		const newCalories = +(newGrams * item.calories / item.grams).toFixed(2);
		item.calories = newCalories;
		item.grams = newGrams;
	}

	calcCalories() {
		this.calories = this.items.reduce((accum, item) => {
			return accum + item.calories;
		}, 0);
	}

	getCalories() {
		return this.calories;
	}
}