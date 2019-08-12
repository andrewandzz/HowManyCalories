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
}