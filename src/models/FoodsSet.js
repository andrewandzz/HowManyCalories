export default class FoodsSet {
	constructor(itemsArr) {
		this.items = itemsArr;
	}

	getItemObj(title) {
		return this.items.find(item => item.title === title);
	}
}