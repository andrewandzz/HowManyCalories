import DOMElems from './dom';

export default class CalculatorView {
	constructor(model) {
		this.model = model;
		this.isPopupAnimating = false;
	}

	renderTotalCalories() {
		const curCalories	= +(DOMElems.caloriesText.textContent).replace(/\,/g, ''),
			  newCalories	= Math.ceil(this.model.totalCalories),
			  dist 			= Math.abs(newCalories - curCalories),
			  duration		= 120; /* in ms */

		const startTime = performance.now();
		let progress, number, animate;

		requestAnimationFrame(function animate(curTime) {
			progress = (curTime - startTime) / duration;
			if (progress > 1) progress = 1;
			
			number = Math.ceil(progress * dist);

			if (newCalories > curCalories) {
				// increase
				DOMElems.caloriesText.textContent = formatCalories(curCalories + number);
			} else {
				// decrease
				DOMElems.caloriesText.textContent = formatCalories(curCalories - number);
			}
			

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		});

		function formatCalories(number) {
			if (number < 1000) return number;

			number = number.toString().split('').reverse().join('');
			number = number.match(/\d{1,3}/g);
			number = number.join(',');
			return number.split('').reverse().join('');
		}
	}


	showCaloriesPopup(id) {
		if (!document.body.querySelector('.popup-calories'))
			this.renderCaloriesPopup();

		const popupElem = document.body.querySelector('.popup-calories'),
			  popupText = popupElem.querySelector('.popup-calories--text'),
			  img = DOMElems.mainContainer.querySelector(`.foods__page__list__item__image img#${id}`),
			  calories = this.model.getCalories(id);

		const animatePopup = () => {
			const popupCoords = {
				width: popupText.offsetWidth,
				height: popupText.offsetHeight
			};
			
			const left = imgCoords.left + (imgCoords.width / 2) - (popupCoords.width / 2);
			const top = imgCoords.top + (imgCoords.height / 2) - popupCoords.height;

			popupElem.style.left = left + 'px';
			popupElem.style.top = top + 'px';

			popupElem.addEventListener('animationend', removeAnimate, false);

			popupElem.classList.add('animate');
			popupText.classList.add('animate');
			this.isPopupAnimating = true;
		}


		if (this.isPopupAnimating) {
			popupElem.classList.remove('animate');
			popupText.classList.remove('animate');
			this.isPopupAnimating = false;
		}

		popupText.textContent = `+ ${Math.ceil(calories)}`;

		const imgCoords = img.getBoundingClientRect();

		const popupElemObserver = new MutationObserver(mutations => {
			if (mutations) {
				popupElemObserver.disconnect();
				animatePopup();
			}
		});
		popupElemObserver.observe(popupElem, { attributes: true });

		popupElem.classList.add('display');


		function removeAnimate() {
			popupElem.removeEventListener('animationend', removeAnimate);
			popupText.classList.remove('animate');
			popupElem.classList.remove('animate');
			popupElem.classList.remove('display');
			this.isPopupAnimating = false;
			// popupElem.style.left = '';
			// popupElem.style.top = '';
		}
	}


	renderCaloriesPopup() {
		document.body.insertAdjacentHTML('beforeend', `
<div class="popup-calories">
	<div class="popup-calories--text"></div>
</div>`);
	}

	demonstrateTrashAnimation() {
		const removeDemonstrate = () => {
			DOMElems.caloriesIcon.removeEventListener('animationend', removeDemonstrate);
			DOMElems.caloriesIcon.classList.remove('demonstrate');

			this.model.STATE.trashIsDemonstrated = true;
			window.sessionStorage.setItem('trashIsDemonstrated', true);

			this.checkTrashActive();

			this.setTrashEventListeners();
		}

		DOMElems.caloriesIcon.addEventListener('animationend', removeDemonstrate, false);
		DOMElems.caloriesIcon.classList.add('demonstrate');
		
	}


	setTrashEventListeners() {
		DOMElems.caloriesIcon.addEventListener('mouseenter', () => {
			this.openTrash();
		}, false);
		DOMElems.caloriesIcon.addEventListener('mouseleave', () => {
			this.closeTrash();
		}, false);
	}


	clearTotalCalories() {
		this.renderTotalCalories();
		this.closeTrash();
		this.trashActive(false);
	}


	openTrash() {
		if (!DOMElems.caloriesIcon.classList.contains('active')) return;

		DOMElems.caloriesIcon.addEventListener('animationend', setClickable, false);

		DOMElems.caloriesIcon.classList.remove('trash-close');
		DOMElems.caloriesIcon.classList.add('trash-open');

		function setClickable() {
			DOMElems.caloriesIcon.removeEventListener('animationend', setClickable);
			// we need class 'clickable' for taking mobile touch just AFTER animation
			DOMElems.caloriesIcon.classList.add('clickable');
		}
	}

	closeTrash() {
		if (!DOMElems.caloriesIcon.classList.contains('active')) return;

		DOMElems.caloriesIcon.classList.remove('clickable');
		DOMElems.caloriesIcon.classList.remove('trash-open');
		DOMElems.caloriesIcon.classList.add('trash-close');
	}

	trashActive(active) {
		if (active) {
			DOMElems.caloriesIcon.classList.add('active');
		} else {
			DOMElems.caloriesIcon.classList.remove('active');
		}
	}

	checkTrashActive() {
		if (this.model.totalCalories === 0) {
			this.trashActive(false);
		} else if (this.model.totalCalories > 0) {
			this.trashActive(true);
		}
	}
}








