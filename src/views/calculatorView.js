import DOMElems from './dom';

export default class CalculatorView {
	constructor(model) {
		this.model = model;
		this.isPopupAnimating = false;
	}

	renderTotalCalories() {
		const curCalories	= +DOMElems.caloriesText.textContent,
			  newCalories	= this.model.totalCalories,
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
}




