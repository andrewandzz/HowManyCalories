export default class FoodsController {
	constructor(model, view) {
		this.model = model;
		this.view = view;
	}

	async openFoodsSet(type, clear = true, page = 1) {
		if (!this.model.contains(type)) {
			this.view.showLoading();
			await this.model.fetchFoodsSet(type);
			this.view.hideLoading();
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
			const itemObj = this.model.STATE.Calculator.model.items[this.model.STATE.Calculator.model.items.length - 1];
			this.model.handIsDemonstrated = true;
			window.sessionStorage.setItem('handIsDemonstrated', 'true');

			setTimeout(() => {
				this.view.showHandTooltip(itemObj);
			}, 1000);
		}
	}
}




