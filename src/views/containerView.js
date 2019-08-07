import DOMElems from './dom';

export function renderTooltip(type, text, itemElem /* we need this only for 'add-calories' */) {
	const tooltip = DOMElems.tooltip;

	tooltip.addEventListener('animationend', handleAnimationEnd);
	tooltip.innerHTML = `+&puncsp;${text}`;

	if (type === 'add-calories') {
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

		animateShifting(top, top - tooltipCoords.height, 900);
		
	}


	function handleAnimationEnd() {
		tooltip.removeEventListener('animationend', handleAnimationEnd);

		tooltip.classList.remove('tooltip--add-calories__pop-up');
	}

	function animateShifting(from, to, duration = 1000) {
		let then, now, intervalMs, progressMs = 0, top;
		const topDist = from - to;

		then = Date.now();

		requestAnimationFrame(function shift() {
			now = Date.now();
			intervalMs = now - then;
			progressMs += intervalMs;

			then = now;

			top = from - topDist * progressMs / duration;

			tooltip.style.top = top + 'px';

			if (progressMs < duration) {
				requestAnimationFrame(shift);
			}

		});
	}
}

