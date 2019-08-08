import DOMElems from './dom';

let isTooltipAnimating = false;

export function renderTooltip(type, text, itemElem /* we need this only for 'add-calories' */) {
	const tooltip = DOMElems.tooltip;

	tooltip.addEventListener('animationend', handleAnimationEnd);
	tooltip.innerHTML = `+ ${text}`;

	if (type === 'add-calories') {
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


export function openOverlay() {
	DOMElems.overlay.style.display = 'flex';
	DOMElems.overlay.classList.add('visible');
	DOMElems.container.classList.add('blurred');
}

export function closeOverlay() {
	DOMElems.container.addEventListener('transitionend', handleTransitionEnd);
	DOMElems.container.classList.remove('blurred');

	function handleTransitionEnd() {
		DOMElems.container.removeEventListener('transitionend', handleTransitionEnd);
		DOMElems.overlay.classList.remove('visible');
		DOMElems.overlay.style.display = 'none';
	}
}



export function openSetGramsContainer(itemElem) {
	const origImg 		= itemElem.querySelector('img'),
		  title 		= origImg.id,
		  grams 		= parseInt(itemElem.querySelector('.foods__page__list__item__text--calories').textContent),
		  type 			= DOMElems.mainContainer.getAttribute('theme'),
		  newImg 		= DOMElems.overlayGramsImg,
		  newImgPseudo	= DOMElems.overlayGramsImgPseudo,
		  inputText		= DOMElems.overlayGramsInputText;

	// get original image position
	const origImgCoords = origImg.getBoundingClientRect();
	newImg.style.top = origImgCoords.top + 'px';
	newImg.style.left = origImgCoords.left + 'px';

	DOMElems.overlayGramsContainer.setAttribute('theme', type);

	// prepare new images
	newImg.id = title;
	newImgPseudo.id = title;

	//prepare input
	inputText.value = grams;
	
	// hide original image
	origImg.style.visibility = 'hidden';



	DOMElems.overlayGramsContainer.classList.add('visible');
	inputText.focus();
}



