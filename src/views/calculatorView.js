import DOMElems from './dom';

export function renderCalories(newNum, duration = 100 /* ms */) {
	// counter animation
	const curNum = +DOMElems.caloriesText.textContent,
		  distance = Math.abs(newNum - curNum);	// how many we shoul go

	let then = Date.now(),
		now,
		intervalMs,	// interval between frame requests
		progressMs = 0,
		number = 0;


	requestAnimationFrame(function animate() {
		now = Date.now();
		intervalMs = now - then;
		then = now;

		progressMs += intervalMs;

		number = Math.floor(distance * progressMs / duration);
		if (number > distance) number = distance;
		

		if (newNum > curNum) {
			// increase
			DOMElems.caloriesText.textContent = curNum + number;
		} else {
			// decrease
			DOMElems.caloriesText.textContent = curNum - number;
		}
		

		if (progressMs < duration) {
			requestAnimationFrame(animate);
		}
	});

}