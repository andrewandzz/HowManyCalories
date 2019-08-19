export default class MenuController {
	constructor(model, view) {
		this.model = model;
		this.view = view;
	}

	render() {
		this.view.render();
	}

	open() {
		this.view.open();
	}

	close(newItemElem) {
		if (newItemElem) {
			this.model.rearrangeItems(newItemElem.dataset.type);
		}
		this.view.close(newItemElem);
	}
}