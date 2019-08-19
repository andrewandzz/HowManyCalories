export default class MenuModel {
	constructor(language) {
		const zIndex = () => {
			let index = this.items.length;

			return function() {
				return ++index;
			}
		}
		
		this.language = language;
		this.items = [
			'fruits',
			'vegetables',
			'milk',
			'fast-food',
			'drinks',
			'meat',
			'sea-food',
			'desserts',
			'bread'
		];
		this.current = null;
		this.isOpened = false;
		this.getNewZIndex = zIndex();
	}

	rearrangeItems(newItemTitle) {
		const index = this.items.indexOf(newItemTitle);
		this.items.splice(index, 1);
		this.items.unshift(newItemTitle);
	}
}




