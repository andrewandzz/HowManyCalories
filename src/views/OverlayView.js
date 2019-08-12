import DOMElems from './dom';

export default class OverlayView {
	constructor(model) {
		this.model = model;
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
			}
		});
		overlayObserver.observe(DOMElems.overlayGramsContainer, { attributes: true });
		DOMElems.overlayGramsContainer.style.display = 'flex';

		window.addEventListener('resize', adjustOverlayGramsImgPos, false);

		// handling key press
		const preventNotNumber = event => {
			if (event.keyCode === 69 || event.keyCode === 188 || event.keyCode === 190) {
				event.preventDefault();
				return;
			}

			let inputValue = itemData.grams + '';

			if (event.keyCode === 8) {
				// Backspace
				inputValue = inputValue.slice(0, -1);

			} else if (/\d/.test(event.key) && (inputValue.length + 1) < 7) {
				inputValue = inputValue + event.key;

			} else if (event.keyCode !== 13) {
				event.preventDefault();
				return;
			}

			itemData.grams = inputValue;

			DOMElems.overlayGramsInputSymbol.innerHTML = `${inputValue}<span>g</span>`;
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
	}


	renderGramsNumber(grams) {
		DOMElems.overlayGramsInputNumber.value = grams;
		DOMElems.overlayGramsInputSymbol.innerHTML = `${grams}<span>g</span>`;
		DOMElems.overlayGramsInputNumber.focus();
	}
}







