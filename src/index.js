import Menu from './models/Menu';
import FoodsSet from './models/FoodsSet';
import * as foodsView from './views/foodsView';
import Calculator from './models/Calculator';
import * as calculatorView from './views/calculatorView';
import DOMElems from './views/dom';
import axios from 'axios';


/*

	GLOBAL APPLICATION STATE

*/
const STATE = {
	foodsSets: []
};


// CONTROL

function menuClick(event) {
	if (!STATE.menu) STATE.menu = new Menu(DOMElems.menuList);

	const menu = STATE.menu;
	const item = event.target.closest('.menu__item');
	const type = item.dataset.type;

	if (menu.isOpened()) {
		// if clicked item is not the first item (i. e. not currently active)
		if (item !== menu.elem.querySelector('.menu__item')) {

			controlFoods(type, 1);

			item.style.zIndex = menu.getNewZIndex();

			menu.close(item);

			changeTheme(type);

		} else {
			menu.close();
		}
	} else {
		menu.open();
	}
}



async function controlFoods(type, page = 1) {
	// get food set's data, if don't have one yet
	if (!STATE.foodsSets[type]) {
		// get data json from server
		const result = await axios(`./data/${type}.json`);

		// MAY BE WAIT FOR IMAGE LOADS

		const items = result.data;
		
		STATE.foodsSets[type] = new FoodsSet(items);
	}

	const curFoodsSet = STATE.foodsSets[type];
	const numOfPages = Math.ceil(curFoodsSet.items.length / STATE.itemsPerPage);

	// render food set
	foodsView.clearPage();

	// scroll main to beginning
	DOMElems.mainContainer.scrollLeft = 0;

	DOMElems.mainContainer.setAttribute('theme', type);

	// render current items page
	foodsView.renderPage(curFoodsSet.items, page, STATE.itemsPerPage);

	// render next items page (for the future) if there is one
	if (page < numOfPages) {
		foodsView.renderPage(curFoodsSet.items, page + 1, STATE.itemsPerPage);
	}

	foodsView.renderPagesButtons(page, numOfPages);

	// that's all here. we then load next page every gotoNextPage() call
}


function scrollToPrevPage(newPage) {
	const type = DOMElems.mainContainer.getAttribute('theme');
	const numOfPages = Math.ceil(STATE.foodsSets[type].items.length / STATE.itemsPerPage);

	foodsView.scrollToPage(newPage);
	foodsView.renderPagesButtons(newPage, numOfPages);	
}


function scrollToNextPage(newPage) {
	const type = DOMElems.mainContainer.getAttribute('theme');
	const numOfPages = Math.ceil(STATE.foodsSets[type].items.length / STATE.itemsPerPage);

	foodsView.scrollToPage(newPage);
	foodsView.renderPagesButtons(newPage, numOfPages);
	// load next items page, if we don't have it yet
	const nextPageElem = document.querySelector(`.foods__page__list[data-page="${newPage + 1}"]`);
	if (!nextPageElem) {
		if (newPage < numOfPages) {
			foodsView.renderPage(STATE.foodsSets[type].items, newPage + 1, STATE.itemsPerPage);
		}
	}
}





function controlCalculator(item) {
	const type = item.closest('main.foods').getAttribute('theme');
	const title = item.querySelector('img').id;

	if (!STATE.calculator) STATE.calculator = new Calculator();

	const calculator = STATE.calculator;

	if (!item.classList.contains('selected')) {
		// add item to the calculator
		calculator.addItem(STATE.foodsSets[type].getItem(title));

		// set item to be selected
		STATE.foodsSets[type].setSelected(title, true);

		// calculate calories
		calculator.calcCalories();

		// render calories
		calculatorView.renderCalories(calculator.getCalories());

		// select item
		item.classList.add('selected');
	} else {
		// remove item from the calculator
		calculator.deleteItem(title);

		// remove item from being selected
		STATE.foodsSets[type].setSelected(title, false);

		// calculate calories
		calculator.calcCalories();

		// render calories
		calculatorView.renderCalories(calculator.getCalories());

		// unselect item
		item.classList.remove('selected');
	}
}
	


// function foodsListMouseDown(event) {
// 	const item = event.target.closest('.foods__list__item');
// 	let timer;

// 	if (item) {
// 		timer = setTimeout(() => {
// 			openSettings();
// 		}, 1000);

// 		DOMElems.foodsList.addEventListener('mouseup', foodsListMouseUp);
// 	}

// 	function foodsListMouseUp() {
// 		DOMElems.foodsList.removeEventListener('mouseup', foodsListMouseUp);

// 		clearTimeout(timer);
// 		// it was just a click
// 		controlCalculator(item);
// 	}


// 	function openSettings() {
// 		DOMElems.foodsList.removeEventListener('mouseup', foodsListMouseUp);

// 		// it was a looong holding

// 		// MAYBE GENERATE MOUSEUP EVENT


// 		// open the menu


// 		console.log('menu')
		
// 		clearTimeout(timer);
// 	}
// }


function changeTheme(type) {
	// items :hover and .active theme
	DOMElems.mainContainer.setAttribute('theme', type);

	// footer block theme
	DOMElems.footerBlock.setAttribute('theme', type);
}


function getItemsPerPage() {
	const content = getComputedStyle(DOMElems.footerBlock, '::after').content;
	STATE.itemsPerPage = parseInt(content.replace('"', ''));
}



/*

	EVENT LISTENERS

*/

window.addEventListener('load', () => {
	controlFoods('fruits', 1);					//HERE <--------!!!
});

document.addEventListener('click', event => {
	if (STATE.menu) {
		// if menu opened and click is outside of the menu
		if (STATE.menu.isOpened() && !event.target.closest('.menu')) {
			STATE.menu.close();
		}
	}
});

// DOMElems.foodsList.addEventListener('mousedown', foodsListMouseDown);

DOMElems.menuList.addEventListener('mousedown',  event => {
	event.preventDefault(); // temporary (maybe)
	menuClick(event);
});

DOMElems.mainContainer.addEventListener('click', event => {
	const item = event.target.closest('.foods__page__list__item');
	if (item) {
		controlCalculator(item);
	}
});

window.addEventListener('dblclick', event => {
	event.preventDefault();
	// cancel highlighting TO DO
});


window.addEventListener('DOMContentLoaded', getItemsPerPage);
window.addEventListener('resize', getItemsPerPage);



DOMElems.btnPrev.addEventListener('click', () => {
	const type = DOMElems.mainContainer.getAttribute('theme');
	const toPage = +DOMElems.btnPrev.dataset.goto;

	scrollToPrevPage(toPage);
});

DOMElems.btnNext.addEventListener('click', () => {
	const type = DOMElems.mainContainer.getAttribute('theme');
	const toPage = +DOMElems.btnNext.dataset.goto;

	scrollToNextPage(toPage);
});

// testing
window.s = STATE;








