import FoodsSet from './FoodsSet';
import axios from 'axios';

export default class FoodsModel {
	constructor(STATE) {
		this.STATE = STATE;
		this.itemsPerPage;
		this.curPage;
		this.curType;
		this.sets = {};
	}

	async fetchFoodsSet(type) {
		const result = await axios(`./data/${type}.json`);
		const items = result.data;

		this.sets[type] = new FoodsSet(items);
	}

	contains(type) {
		return !!(this.sets[type]);
	}

	formatGrams(grams) {
		const gTitle = this.STATE.language.dictionary.foods.g;

		if (grams < 1000) return `${grams}<span> ${gTitle}</span>`;

		const kgTitle = this.STATE.language.dictionary.foods.kg;

		const reverse = grams.toString().split('').reverse().join('');
		let [g, kg] = reverse.match(/\d{1,3}/g);
		g = g.split('').reverse().join('');
		kg = kg.split('').reverse().join('');

		// if it's equal thousands
		if (grams % 1000 === 0) return `${kg}<span> ${kgTitle}</span>`;

		return `${kg},${g}<span> ${gTitle}</span>`
	}
}




