export default class FoodsController {
	constructor(model, view) {
		this.model = model;
		this.view = view;
	}

	async openFoodsSet(type) {
		if (!this.model.contains(type)) {
			await this.model.fetchFoodsSet(type);
		}
		this.view.clearFoodsPages();
		this.model.curPage = 1;
		this.model.curType = type;
		this.view.renderFoodsPages();
		this.view.setGradient();
		/* draw gradient every time the new set loads,
		because we need to set gradient colors depending on the set type */
	}

	scrollToPrevPage() {
		this.view.scrollToPrevPage();
	}

	scrollToNextPage() {
		this.view.scrollToNextPage();
	}
}