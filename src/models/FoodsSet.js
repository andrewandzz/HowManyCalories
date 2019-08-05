export default class FoodsSet {
	constructor(newItems) {
		this.items = newItems.map(item => {
			return {
				...item,
				grams: 100,
				selected: false
			};
		});
		
	}

	getItem(title) {
		return this.items.find(item => item.title === title);
	}

	setSelected(title, bool) {
		const item = this.items.find(item => item.title === title);
		item.selected = bool;
	}

	isSelected(title) {
		const item = this.items.find(item => item.title === title);
		return item.selected;
	}
}