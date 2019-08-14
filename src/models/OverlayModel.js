import DOMElems from '../views/dom';


export default class OverlayModel {
	constructor(calculator) {
		this.calculator = calculator;
		this.imgSize = 0; /* for img inc/dec animation */
	}

	setItem(itemElem) {
		this.itemElem = itemElem;
		const origImg	= itemElem.querySelector('.foods__page__list__item__image img'),
			  origImgCoords = origImg.getBoundingClientRect(),
			  title	= origImg.id,
			  type	= DOMElems.mainContainer.getAttribute('theme'),
			  grams	= this.calculator.getGrams(title) || 100;

		this.firstValue = grams;
		this.onFocusValue = -1;
		this.imgSize = 0;
		this.itemData = { origImg, origImgCoords, title, type, grams };
	}

	formatInputGrams(grams) {
		/*
			return 23.554, 5.340, 1.300
		*/
		if (!grams) return '';
		let result = grams.toString().split('').reverse().join('');
		result = result.match(/\d{1,3}/g).join('.');
		return result.split('').reverse().join('');
	}
}