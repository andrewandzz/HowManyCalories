import DOMElems from './dom';

export default class MenuView {
	constructor(model) {
		this.model = model;
	}

	render() {
		this.clear();

		const markup = this.model.items.reduce((string, itemTitle) => {
			const title = this.model.language.dictionary.menu[itemTitle];
			return string + `<li class="menu__item" data-type="${itemTitle}">${title}</li>`;
		}, '');

		DOMElems.menuList.insertAdjacentHTML('beforeend', markup);

		// set current items to be the first array's element
		this.model.current = this.model.items[0];
	}

	clear() {
		DOMElems.menuList.innerHTML = '';
	}

	async open() {
		// make items visible first
		DOMElems.menuList.classList.remove('hidden');
		// then open menu
		DOMElems.menuList.classList.add('open');
		this.model.isOpened = true;
	}

	close(newItemElem) {
		const hideItems = () => {
			DOMElems.menuList.removeEventListener('transitionend', hideItems);
			DOMElems.menuList.classList.add('hidden');

			// after menu closes rearrange its elements
			if (newItemElem) {
				this.rearrangeItems(newItemElem);
			}
		};

		if (newItemElem) {
			// set new z-index to the new item element
			newItemElem.style.zIndex = this.model.getNewZIndex();
			this.model.current = newItemElem.dataset.type;
		}

		DOMElems.menuList.addEventListener('transitionend', hideItems, false);
		DOMElems.menuList.classList.remove('open');
		this.model.isOpened = false;
	}

	rearrangeItems(newItemElem) {
		const newItemMarkup = newItemElem.outerHTML;
		DOMElems.menuList.insertAdjacentHTML('afterbegin', newItemMarkup);
		DOMElems.menuList.removeChild(newItemElem);
	}
}


