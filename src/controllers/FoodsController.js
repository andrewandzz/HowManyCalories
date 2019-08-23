export default class FoodsController {
	constructor(model, view) {
		this.model = model;
		this.view = view;
	}

	async openFoodsSet(type, clear = true, page = 1) {
		if (!this.model.contains(type)) {
			await this.model.fetchFoodsSet(type);
		}

		if (clear) this.view.clearFoodsPages();

		this.model.curPage = page;
		this.model.curType = type;
		this.view.renderFoodsPages(page);
	}

	async changeFoodsSet(type) {
		this.view.clearAroundPages();
		await this.openFoodsSet(type, false);
		this.view.renderPagesButtons();
		await this.view._scroll();
		this.view.clearZeroPage();
	}

	scrollToPrevPage() {
		this.view.scrollToPrevPage();
	}

	scrollToNextPage() {
		this.view.scrollToNextPage();
	}

	showPressAndHoldTooltip() {
		if (!this.model.handIsDemonstrated) {
			setTimeout(() => {
				this.view.showHandTooltip();
			}, 1000);
		}
	}
}




