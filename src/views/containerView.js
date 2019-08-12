import DOMElems from './dom';

let isTooltipAnimating = false;

export function renderTooltip(type, text, itemElem /* we need this only for 'add-calories' */) {
	const tooltip = DOMElems.tooltip;

	tooltip.addEventListener('animationend', handleAnimationEnd);
	// tooltip.innerHTML = `+ ${text}`;

	if (type === 'add-calories') {
		tooltip.innerHTML = `+ ${parseInt(text)}`;

		if (isTooltipAnimating) {
			tooltip.classList.remove('tooltip--add-calories__pop-up');
		}

		// position tooltip
		// get item's image coords
		const imgElem = itemElem.querySelector('.foods__page__list__item__image img');
		const imgCoords = imgElem.getBoundingClientRect();
		const tooltipCoords = {
			width: tooltip.offsetWidth,
			height: tooltip.offsetHeight
		}

		const left = imgCoords.left + (imgCoords.width / 2) - (tooltipCoords.width / 2);
		const top = imgCoords.top + (imgCoords.height / 2) - tooltipCoords.height;

		tooltip.style.left = left + 'px';
		tooltip.style.top = top + 'px';

		tooltip.classList.add('tooltip--add-calories__pop-up');
		isTooltipAnimating = true;

		animateShifting(top, top - tooltipCoords.height, 800);
	}


	function handleAnimationEnd() {
		tooltip.removeEventListener('animationend', handleAnimationEnd);
		isTooltipAnimating = false;

		tooltip.classList.remove('tooltip--add-calories__pop-up');
	}

	function animateShifting(from, to, duration = 1000) {
		let startTime, now, progress, timeFraction, top;
		const topDist = from - to;

		startTime = performance.now();

		requestAnimationFrame(function shift(curTime) {
			timeFraction = (curTime - startTime) / duration;
			if (timeFraction > 1) timeFraction = 1;

			progress = arc(timeFraction);

			top = from - (topDist * progress);

			tooltip.style.top = top + 'px';

			if (timeFraction < 1) {
				requestAnimationFrame(shift);
			}

		});

		function arc(timeFraction) {
			return Math.sqrt(timeFraction);
		}
	}
}








