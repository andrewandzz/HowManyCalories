import DOMElems from './dom';

export default class CalculatorView {
	constructor(model) {
		this.model = model;
		this.isPopupAnimating = false;
	}

	renderTotalCalories() {
		const curCalories	= +DOMElems.caloriesText.textContent,
			  newCalories	= Math.ceil(this.model.totalCalories),
			  dist 			= Math.abs(newCalories - curCalories),
			  duration		= 100; /* in ms */

		const startTime = performance.now();
		let progress, number;

		requestAnimationFrame(function animate(curTime) {
			progress = (curTime - startTime) / duration;
			if (progress > 1) progress = 1;
			
			number = Math.ceil(progress * dist);

			if (newCalories > curCalories) {
				// increase
				DOMElems.caloriesText.textContent = curCalories + number;
			} else {
				// decrease
				DOMElems.caloriesText.textContent = curCalories - number;
			}
			

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		});
	}


	renderCaloriesPopup(id) {
		const img = DOMElems.mainContainer.querySelector(`.foods__page__list__item__image img#${id}`),
			  calories = this.model.getCalories(id),
			  popup = DOMElems.caloriesPopup;

		if (this.isPopupAnimating) {
			popup.classList.remove('animate');
			this.isPopupAnimating = false;
		}

		popup.textContent = `+ ${Math.ceil(calories)}`;
		popup.style.display = 'block';

		const popupCoords = {
			height: popup.offsetHeight,
			width: popup.offsetWidth
		};

		const imgCoords = img.getBoundingClientRect();

		const left = imgCoords.left + (imgCoords.width / 2) - (popupCoords.width / 2);
		const top = imgCoords.top + (imgCoords.height / 2) - popupCoords.height;

		popup.style.left = left + 'px';
		popup.style.top = top + 'px';

		popup.classList.add('animate');
		this.isPopupAnimating = true;

		popup.addEventListener('animationend', removeAnimate, false);

		animateShifting(top, top - popupCoords.height, 800);



		function removeAnimate() {
			popup.removeEventListener('animationend', removeAnimate);
			popup.classList.remove('animate');
			this.isPopupAnimating = false;
			popup.style.display = 'none';
			popup.style.left = '';
			popup.style.top = '';
		}


		function animateShifting(from, to, duration = 1000) {
			let startTime, progress, timeFraction, top;
			const topDist = from - to;

			startTime = performance.now();

			requestAnimationFrame(function shift(curTime) {
				timeFraction = (curTime - startTime) / duration;
				if (timeFraction > 1) timeFraction = 1;

				progress = arc(timeFraction);

				top = from - (topDist * progress);

				popup.style.top = top + 'px';

				if (timeFraction < 1) {
					requestAnimationFrame(shift);
				}

			});

			function arc(timeFraction) {
				return Math.sqrt(timeFraction);
			}
		}
	}


	demonstrateTrashAnimation() {
		const removeDemonstrate = () => {
			DOMElems.caloriesIcon.removeEventListener('animationend', removeDemonstrate);
			DOMElems.caloriesIcon.classList.remove('demonstrate');

			this.model.STATE.trashIsDemonstrated = true;
			window.sessionStorage.setItem('trashIsDemonstrated', true);

			this.trashActive(true);

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
}




