import DOMElems from '../views/dom';


export default class OverlayModel {
	constructor() {

	}

	setItem(itemElem) {
		this.itemElem = itemElem;
		const origImg	= itemElem.querySelector('.foods__page__list__item__image img'),
			  origImgCoords = origImg.getBoundingClientRect(),
			  title	= origImg.id,
			  type	= DOMElems.mainContainer.getAttribute('theme'),
			  grams	= parseInt(itemElem.querySelector('.foods__page__list__item__text--grams').textContent);
		this.firstValue = grams;
		
		this.itemData = { origImg, origImgCoords, title, type, grams };
	}
}