import DOMElems from './dom';

export function renderCalories(num) {
	DOMElems.caloriesText.textContent = num;
}