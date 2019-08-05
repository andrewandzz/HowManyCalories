export default class Menu {
	constructor(elem, items) {
		this.elem = elem;
		this._zIndex = elem.querySelectorAll('.menu__item').length;
	}

	open() {
		this.showItems();
		this.elem.classList.add('opened');
	}

	close(newItem = null) {
		const rearrange = () => {
			// get reed of the listener
			this.elem.removeEventListener('transitionend', rearrange);

			const markup = newItem.outerHTML;
			this.elem.insertAdjacentHTML('afterbegin', markup);

			this.elem.removeChild(newItem);
		};

		const hideItems = () => {
			// get reed of the listener
			this.elem.removeEventListener('transitionend', hideItems);

			this.elem.classList.add('hidden');
		};

		if (newItem) {
			this.elem.addEventListener('transitionend', rearrange);

			this.elem.classList.remove('opened');
		}

		this.elem.addEventListener('transitionend', hideItems);
		this.elem.classList.remove('opened');
	}

	getNewZIndex() {
		return this._zIndex = ++this._zIndex;
	}

	showItems() {
		this.elem.classList.remove('hidden');
	}

	isOpened() {
		return this.elem.classList.contains('opened');
	}
}