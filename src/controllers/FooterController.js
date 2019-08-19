export default class FooterController {
	constructor(model, view) {
		this.model = model;
		this.view = view;
	}

	render() {
		this.view.render();
	}

	open() {
		this.view.openMenu();
	}

	close(clear) {
		this.view.closeMenu(clear);
	}
}