import DOMElems from './dom';

export default class OverlayView {
	constructor(model) {
		this.model = model;
		this.cursorPosition = -1;
		this.isImgAnimating = false;
	}


	openOverlay() {
		const observer = new MutationObserver(mutations => {
			// listen for 'display: flex'
			if (mutations) {
				observer.disconnect();
				DOMElems.overlay.classList.add('visible');
			}
		});
		observer.observe(DOMElems.overlay, { attributes: true });

		DOMElems.overlay.style.display = 'flex';

		DOMElems.container.classList.add('blur');
	}


	closeOverlay() {
		return new Promise(resolve => {
			// listen on 'container', not on 'overlay'
			DOMElems.container.addEventListener('transitionend', handleOverlayClose, false);
			DOMElems.overlay.classList.remove('visible');
			DOMElems.container.classList.remove('blur');

			function handleOverlayClose() {
				DOMElems.container.removeEventListener('transitionend', handleOverlayClose);
				DOMElems.overlay.style.display = 'none';
				resolve();
			}
		});
	}



	openSetGrams() {
		const itemData = this.model.itemData;
		DOMElems.overlayGramsWrapper.setAttribute('theme', itemData.type);
		DOMElems.overlayGramsImg.id = itemData.title;
		DOMElems.overlayGramsImgPseudo.id = itemData.title;

		/*
			here we need to position the new image firstly WITHOUT animation,
			and then, before setting new top/left, add class 'animate'.
			after the image replaced, we need to remove 'animate' class
		*/
		const imgObserver = new MutationObserver(mutations => {
			// listen for assigning 'top' and 'left'
			if (mutations) {
				imgObserver.disconnect();
				DOMElems.overlayGramsImg.classList.add('animate');
				adjustOverlayGramsImgPos();

				// remove class 'animate'
				DOMElems.overlayGramsImg.addEventListener('transitionend', handleImgOnOverlay, false);
			}
		});
		imgObserver.observe(DOMElems.overlayGramsImg, { attributes: true });

		DOMElems.overlayGramsImg.style.top = itemData.origImgCoords.top + 'px';
		DOMElems.overlayGramsImg.style.left = itemData.origImgCoords.left + 'px';

		itemData.origImg.style.visibility = 'hidden';


		const overlayObserver = new MutationObserver(mutations => {
			// listen for 'display: flex'
			if (mutations) {
				overlayObserver.disconnect();
				DOMElems.overlayGramsContainer.classList.add('visible');
				this.renderGramsNumber(itemData.grams);
				this.focusInput();
			}
		});
		overlayObserver.observe(DOMElems.overlayGramsContainer, { attributes: true });
		DOMElems.overlayGramsContainer.style.display = 'flex';

		window.addEventListener('resize', adjustOverlayGramsImgPos, false);

		// handling key press
		const preventNotNumber = event => {
			if (event.keyCode === 13) return;

			if (!(event.keyCode === 37 || event.keyCode === 39) && !(event.ctrlKey || event.metaKey)) {
				event.preventDefault();
			}

			let inputValue = itemData.grams + '';

			if (event.keyCode === 8) {
				// backspace
				inputValue = inputValue.slice(0, -1);

			} else if (event.keyCode === 38) {
				// arrow up
				inputValue++;

			} else if (event.keyCode === 40) {
				// arrow down
				inputValue--;

			} else if (/\d/.test(event.key) && (inputValue.length + 1) < 7) {
				inputValue = inputValue + event.key;
			}

			itemData.grams = inputValue;

			this.renderGramsNumber(inputValue);
		}
		
		DOMElems.overlayGramsInputNumber.addEventListener('keydown', preventNotNumber, false);


		function handleImgOnOverlay() {
			DOMElems.overlayGramsImg.removeEventListener('transitionend', handleImgOnOverlay);
			DOMElems.overlayGramsImg.classList.remove('animate');
		}


		function adjustOverlayGramsImgPos() {
			const pseudoImgCoords = DOMElems.overlayGramsImgPseudo.getBoundingClientRect();
			DOMElems.overlayGramsImg.style.top = pseudoImgCoords.top + 'px';
			DOMElems.overlayGramsImg.style.left = pseudoImgCoords.left + 'px';
		}
	}



	closeSetGrams() {
		const itemData = this.model.itemData;

		const handleContainerClose = () => {
			DOMElems.container.removeEventListener('transitionend', handleContainerClose);
			DOMElems.overlayGramsContainer.style.display = 'none';
			this.model.itemData.origImg.style.visibility = 'visible';
		}

		/*
			we listen on 'container', because button's transition for :active
			fires transitionend event, so the overlay closes early.
		*/
		DOMElems.container.addEventListener('transitionend', handleContainerClose, false);
		DOMElems.overlayGramsContainer.classList.remove('visible');
		DOMElems.overlayGramsImg.style.transform = 'scale(1)';


		/*
			the same as before
		*/
		const imgObserver = new MutationObserver(mutations => {
			if (mutations) {
				imgObserver.disconnect();
				DOMElems.overlayGramsImg.style.top = itemData.origImgCoords.top + 'px';
				DOMElems.overlayGramsImg.style.left = itemData.origImgCoords.left + 'px';

				DOMElems.overlayGramsImg.addEventListener('transitionend', handleImgIsBack, false);
			}
		});
		imgObserver.observe(DOMElems.overlayGramsImg, { attributes: true });

		DOMElems.overlayGramsImg.classList.add('animate');

		
		function handleImgIsBack() {
			DOMElems.overlayGramsImg.removeEventListener('transitionend', handleImgIsBack);
			DOMElems.overlayGramsImg.classList.remove('animate');
			DOMElems.overlayGramsImg.style.top = '';
			DOMElems.overlayGramsImg.style.left = '';
		}
	}


	showGramsInvalidInput() {
		DOMElems.overlayGramsInputContainer.addEventListener('animationend', () => {
			DOMElems.overlayGramsInputContainer.classList.remove('invalid');
		});

		DOMElems.overlayGramsInputContainer.classList.add('invalid');
		this.focusInput();
	}


	renderGramsNumber(grams) {
		const formattedGrams = this.model.formatInputGrams(grams);
		DOMElems.overlayGramsInputNumber.value = formattedGrams;
		DOMElems.overlayGramsInputSymbol.innerHTML = formattedGrams + '<span>g</span>';
		// DOMElems.overlayGramsInputNumber.focus();
	}


	focusInput() {
		DOMElems.overlayGramsInputNumber.focus();
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
		

		if (this.isImgAnimating) {
			DOMElems.overlayGramsImg.classList.remove(animationType);
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
		
		DOMElems.overlayGramsImg.addEventListener('animationend', removeImgAnimate, false);

		if (type === 1) this.model.imgSize++;
		else if (type === 0) this.model.imgSize--; 

		DOMElems.overlayGramsImg.classList.add(animationType);
		this.isImgAnimating = true;

		function removeImgAnimate() {
			DOMElems.overlayGramsImg.removeEventListener('animationend', removeImgAnimate);

			DOMElems.overlayGramsImg.classList.remove(animationType);
			DOMElems.overlayGramsImg.style.transform = `scale(${
				(type === 1) ? incScale100 : decScale100})`;
			this.isImgAnimating = false;
		}
	}
}







