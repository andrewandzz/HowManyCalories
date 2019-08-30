import DOMElems from './dom';

export default class OverlayView {
	constructor(model) {
		this.model = model;
		this.cursorPosition = -1;
		this.isImgAnimating = false;
	}


	openOverlay() {
		DOMElems.overlay.classList.add('display');

		// little hack to prevent adding class 'visible' before getting class 'display'
		void DOMElems.overlay.offsetWidth;

		DOMElems.overlay.classList.add('visible');
		DOMElems.container.classList.add('blur');
	}


	closeOverlay() {
		return new Promise(resolve => {
			const handleOverlayClose = () => {
				DOMElems.container.removeEventListener('transitionend', handleOverlayClose);
				DOMElems.overlay.classList.remove('display');
				resolve();
			}

			// listen on 'container', not on 'overlay'
			DOMElems.container.addEventListener('transitionend', handleOverlayClose, false);
			DOMElems.overlay.classList.remove('visible');
			DOMElems.container.classList.remove('blur');
		});
	}


	openSetGrams() {
		const itemData = this.model.itemData;

		DOMElems.setGramsWrapper.dataset.type = itemData.type;
		DOMElems.setGramsImg.id = itemData.title;
		DOMElems.setGramsImgPseudo.id = itemData.title;

		/*
			here we need to position the new image firstly WITHOUT animation,
			and then, before setting new top/left, add class 'animate'.
			after the image replaced, we need to remove 'animate' class
		*/
		const imgObserver = new MutationObserver(() => {
			// listen for assigning 'top' and 'left'
			imgObserver.disconnect();
			DOMElems.setGramsImg.classList.add('move');
			adjustOverlayGramsImgPos();
			// remove class 'move'
			DOMElems.setGramsImg.addEventListener('transitionend', handleImgOnOverlay, false);
		});
		imgObserver.observe(DOMElems.setGramsImg, { attributes: true });

		DOMElems.setGramsImg.classList.add('display');
		DOMElems.setGramsImg.style.top = itemData.origImgCoords.top + 'px';
		DOMElems.setGramsImg.style.left = itemData.origImgCoords.left + 'px';

		itemData.origImg.classList.add('hidden');

		const overlayObserver = new MutationObserver(() => {
			// listen for 'display: flex'
			overlayObserver.disconnect();
			DOMElems.setGramsContainer.classList.add('visible');
			this.renderGramsNumber(itemData.grams);
			this.focusInput();
		});
		overlayObserver.observe(DOMElems.setGramsContainer, { attributes: true });
		DOMElems.setGramsContainer.classList.add('display');

		window.addEventListener('resize', adjustOverlayGramsImgPos, false);


		// this function captures on keydown
		const preventNotNumber = event => {
			if (event.ctrlKey || event.metaKey || event.keyCode === 13) return;

			if (itemData.grams.toString().length === 6) {
				if (event.keyCode !== 8 && event.keyCode !== 37 && event.keyCode !== 39 && event.keyCode !== 40) {
					event.preventDefault();
				}
			}

			if (event.keyCode === 69) {
				event.preventDefault();
			}

			if (event.keyCode === 38) {
				event.preventDefault();
				if (itemData.grams < 999999) {
					this.renderGramsNumber(++itemData.grams);
				}
			} 

			if (event.keyCode === 40) {
				event.preventDefault();
				if (itemData.grams > 1) {
					this.renderGramsNumber(--itemData.grams);
				}
			}
		}


		// whilest this function formats GOOD (after previous function) number
		const updateGrams = () => {
			itemData.grams = DOMElems.setGramsInputNumber.value.replace('.', '');
			this.renderGramsNumber(itemData.grams);
		}


		DOMElems.setGramsInputNumber.onkeydown = preventNotNumber;
		DOMElems.setGramsInputNumber.oninput = updateGrams;


		function handleImgOnOverlay() {
			DOMElems.setGramsImg.removeEventListener('transitionend', handleImgOnOverlay);
			DOMElems.setGramsImg.classList.remove('move');
		}


		function adjustOverlayGramsImgPos() {
			const pseudoImgCoords = DOMElems.setGramsImgPseudo.getBoundingClientRect();
			DOMElems.setGramsImg.style.top = pseudoImgCoords.top + 'px';
			DOMElems.setGramsImg.style.left = pseudoImgCoords.left + 'px';
		}
	}



	closeSetGrams() {
		const itemData = this.model.itemData;

		const handleContainerClose = () => {
			DOMElems.container.removeEventListener('transitionend', handleContainerClose);
			DOMElems.setGramsContainer.classList.remove('display')
			itemData.origImg.classList.remove('hidden');
		}

		/*
			we listen on 'container', because button's transition for :active
			fires transitionend event, so the overlay closes early.
		*/
		DOMElems.container.addEventListener('transitionend', handleContainerClose, false);
		DOMElems.setGramsContainer.classList.remove('visible');
		DOMElems.setGramsImg.style.transform = 'scale(1)';


		/* the same as before */
		const imgObserver = new MutationObserver(() => {
			imgObserver.disconnect();
			DOMElems.setGramsImg.style.top = itemData.origImgCoords.top + 'px';
			DOMElems.setGramsImg.style.left = itemData.origImgCoords.left + 'px';

			DOMElems.setGramsImg.addEventListener('transitionend', handleImgIsBack, false);
		});
		imgObserver.observe(DOMElems.setGramsImg, { attributes: true });

		DOMElems.setGramsImg.classList.add('move');

		
		function handleImgIsBack() {
			DOMElems.setGramsImg.removeEventListener('transitionend', handleImgIsBack);
			DOMElems.setGramsImg.classList.remove('move');
			DOMElems.setGramsImg.classList.remove('display');
			DOMElems.setGramsImg.style.top = '';
			DOMElems.setGramsImg.style.left = '';
		}
	}


	showGramsInvalidInput() {
		const removeInvalid = () => {
			DOMElems.setGramsInputContainer.removeEventListener('animationend', removeInvalid);
			DOMElems.setGramsInputContainer.classList.remove('invalid');
		}

		DOMElems.setGramsInputContainer.addEventListener('animationend', removeInvalid);
		DOMElems.setGramsInputContainer.classList.add('invalid');
		this.focusInput();
	}


	renderGramsNumber(grams) {
		const formattedGrams = this.model.formatInputGrams(grams);
		const g = this.model.STATE.language.dictionary.foods.g;

		DOMElems.setGramsInputNumber.value = formattedGrams;
		DOMElems.setGramsInputSymbol.innerHTML = formattedGrams + `<span>${g}</span>`;
	}


	focusInput() {
		DOMElems.setGramsInputNumber.focus();
	}


	animateImgChangeSize(type) {
		/*
		type === 1 => increase,
		type === 0 => decrease
		*/
		if (type === 1 && this.model.imgSize + 1 >= 10) return;
		if (type === 0 && this.model.imgSize - 1 <= -10) return;

		let styleElem = document.getElementById('overlay-img-style');

		if (!styleElem) {
			styleElem = document.createElement('style');
			styleElem.type = 'text/css';
			styleElem.id = 'overlay-img-style';
			document.head.appendChild(styleElem);
		}

		let animationType = '';

		if (type === 1) animationType = 'animate-increase';
		else if (type === 0) animationType = 'animate-decrease';


		const img = DOMElems.setGramsImg;		

		if (this.isImgAnimating) {
			img.classList.remove(animationType);
			this.isImgAnimating = false;
		}


		let incScale0, incScale50, incScale100,
			decScale0, decScale50, decScale100;

		
		incScale0 = (1 + this.model.imgSize / 50).toFixed(2);
		incScale50 = (1 +.05 + this.model.imgSize / 50).toFixed(2);
		incScale100 = (1 + .02 + this.model.imgSize / 50).toFixed(2);
	
		decScale0 = (1 + this.model.imgSize / 50).toFixed(2);
		decScale50 = (1 - .05 + this.model.imgSize / 50).toFixed(2);
		decScale100 = (1 - .02 + this.model.imgSize / 50).toFixed(2);
		

		styleElem.innerHTML = `
@keyframes animate-increase {
	0% {
		transform: scale(${incScale0});
	}
	50% {
		transform: scale(${incScale50});
	}
	100% {
		transform: scale(${incScale100});
	}
}

@keyframes animate-decrease {
	0% {
		transform: scale(${decScale0});
	}
	50% {
		transform: scale(${decScale50});
	}
	100% {
		transform: scale(${decScale100});
	}
}`;
		
		img.addEventListener('animationend', removeImgAnimate, false);

		if (type === 1) this.model.imgSize++;
		else if (type === 0) this.model.imgSize--; 

		img.classList.add(animationType);
		this.isImgAnimating = true;

		function removeImgAnimate() {
			img.removeEventListener('animationend', removeImgAnimate);

			img.classList.remove(animationType);
			img.style.transform = `scale(${
				(type === 1) ? incScale100 : decScale100})`;
			this.isImgAnimating = false;
		}
	}


	renderContact() {
		const contactMarkup = `
<div class="overlay__contact__container">
	<form class="overlay__contact__form visible" action="./send-message.php" method="post">
		<input class="overlay__contact--input" type="text" name="name" placeholder="" tabindex="1">
		<input class="overlay__contact--input" type="email" name="email" placeholder="" tabindex="2">
		<textarea class="overlay__contact--input" rows="6" placeholder="" required="required" tabindex="3" name="message"></textarea>
		<button class="overlay__contact--btn" type="submit" tabindex="4">Send</button>
	</form>
	<div class="overlay__contact__thanks"></div>
</div>`;
		
		DOMElems.overlay.insertAdjacentHTML('beforeend', contactMarkup);

		this.model.contactElem = {};
		this.model.contactElem.container = DOMElems.overlay.querySelector('.overlay__contact__container');
		this.model.contactElem.form = this.model.contactElem.container.querySelector('.overlay__contact__form');
		this.model.contactElem.name = this.model.contactElem.form.querySelector('.overlay__contact--input[name="name"]');
		this.model.contactElem.email = this.model.contactElem.form.querySelector('.overlay__contact--input[name="email"]');
		this.model.contactElem.message = this.model.contactElem.form.querySelector('textarea.overlay__contact--input');
		this.model.contactElem.btn = this.model.contactElem.form.querySelector('.overlay__contact--btn');
		this.model.contactElem.thanks = this.model.contactElem.container.querySelector('.overlay__contact__thanks');
	}


	openContact() {
		this.renderContactPlaceholders();
		this.renderThanksText();

		this.model.contactElem.container.classList.add('display');
		this.model.contactElem.container.classList.add('form');
		this.model.contactElem.form.classList.add('visible');
		this.model.contactElem.name.focus();
		// little hack to add class 'visible' just after class 'display'
		void this.model.contactElem.container.offsetWidth;
		this.model.contactElem.container.classList.add('visible');
	}
	

	closeContact() {
		const removeDisplay = () => {
			DOMElems.container.removeEventListener('transitionend', removeDisplay);
			this.model.contactElem.container.classList.remove('display');
			this.model.contactElem.container.classList.remove('thanks');
			this.model.contactElem.container.classList.remove('ru');
		}

		/* we listen on 'container', not on 'contact__container' */
		DOMElems.container.addEventListener('transitionend', removeDisplay);
		this.model.contactElem.container.classList.remove('visible');
	}


	renderContactPlaceholders() {
		const namePlaceholder = this.model.STATE.language.dictionary.contact.name;
		const emailPlaceholder = this.model.STATE.language.dictionary.contact.email;
		const messagePlaceholder = this.model.STATE.language.dictionary.contact.message;
		const btnTitle = this.model.STATE.language.dictionary.contact.send;

		this.model.contactElem.name.placeholder = namePlaceholder;
		this.model.contactElem.email.placeholder = emailPlaceholder;
		this.model.contactElem.message.placeholder = messagePlaceholder;
		this.model.contactElem.btn.textContent = btnTitle;
	}

	renderThanksText() {
		const text = this.model.STATE.language.dictionary.contact.thanks;
		this.model.contactElem.thanks.textContent = text;
	}


	clearContact() {
		this.model.contactElem.name.value = '';
		this.model.contactElem.email.value = '';
		this.model.contactElem.message.value = '';
	}


	showContactInvalidMessage() {
		const removeInvalid = () => {
			this.model.contactElem.message.removeEventListener('animationend', removeInvalid);
			this.model.contactElem.message.classList.remove('invalid');
		}

		this.model.contactElem.message.addEventListener('animationend', removeInvalid);
		this.model.contactElem.message.classList.add('invalid');
		this.model.contactElem.message.focus();
	}


	showContactThanks() {
		return new Promise(resolve => {
			const closeThanks = () => {
				this.model.contactElem.thanks.removeEventListener('animationend', closeThanks);
				this.model.isThanksOpened = false;
				// now we demonstrated 'thanks' and are ready to be closed
				resolve();
			};

			const changeToThanks = () => {
				this.model.contactElem.form.removeEventListener('transitionend', changeToThanks);
				this.model.contactElem.container.classList.remove('form');

				this.model.contactElem.thanks.addEventListener('animationend', closeThanks);
				this.model.contactElem.container.classList.add('thanks');
			};

			this.model.isThanksOpened = true;
			this.model.contactElem.form.addEventListener('transitionend', changeToThanks);
			this.model.contactElem.form.classList.remove('visible');

			if (this.model.STATE.language.current === 'ru') {
				this.model.contactElem.container.classList.add('ru');
			}
		});
	}
}







