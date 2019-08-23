import DOMElems from './dom';

export default class FooterView {
	constructor(model) {
		this.model = model;
	}

	render() {
		this.clear();

		const currentLanguage = this.model.STATE.language.current;
		const language = this.model.STATE.language.dictionary.footer[currentLanguage];
		const contact = this.model.STATE.language.dictionary.footer.contact;
		const markup = `
<li class="bottom__menu--language">${language}</li>
<li class="separator">|</li>
<li class="bottom__menu--contact">${contact}</li>`;

		DOMElems.footerMenu.insertAdjacentHTML('afterbegin', markup);
	}

	changeTheme() {
		DOMElems.footerBlock.setAttribute('theme', this.model.STATE.Menu.model.current);
	}

	clear() {
		DOMElems.footerMenu.innerHTML = '';
	}

	openMenu() {
		// render flag icons if there are no yet
		if (!DOMElems.footerLangList.querySelector('.bottom__flags__item')) {
			// arrange flag icons so that current language be the last
			this.renderFlags(this.model.STATE.language.current);
		}

		// open
		DOMElems.footerMenu.classList.remove('visible');

		DOMElems.footerLangList.classList.add('display');
		setTimeout(() => {
			DOMElems.footerLangList.classList.add('visible');
		}, 10);
		DOMElems.footerBlock.classList.add('open');
		
		this.model.isOpened = true;
	}

	closeMenu(clear) {
		const removeDisplay = () => {
			DOMElems.footerLangList.removeEventListener('transitionend', removeDisplay);
			DOMElems.footerLangList.classList.remove('display');

			if (clear) {
				this.clearFlags();
			}
		}


		DOMElems.footerBlock.classList.remove('open');

		DOMElems.footerLangList.addEventListener('transitionend', removeDisplay, false);
		DOMElems.footerLangList.classList.remove('visible');
		DOMElems.footerMenu.classList.add('visible');

		this.model.isOpened = false;
	}

	clearFlags() {
		// we need this when change language
		DOMElems.footerLangList.innerHTML = '';
	}

	renderFlags(current) {
		// copying original langs array to be able manipulate the data
		const flags = [...this.model.STATE.language.langs];
		const currentFlagIndex = flags.indexOf(current);
		flags.splice(currentFlagIndex, 1);

		const currentFlagMarkup = renderFlag(current, false);

		const restFlagsMarkup = flags.reduce((string, lang) => {
			return string + renderFlag(lang);
		}, '');


		DOMElems.footerLangList.insertAdjacentHTML('afterbegin', restFlagsMarkup + currentFlagMarkup);



		function renderFlag(lang, clickable = true) {
			return `
<li class="bottom__flags__item ${(!!clickable) ? 'clickable' : ''}" data-lang="${lang}">
	<svg class="bottom__flags__item--icon">
		<use xlink:href="./images/flags-icons.svg#${lang}"></use>
	</svg>
</li>`;
		}
	}
}