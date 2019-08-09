import Menu from './models/Menu';
import FoodsSet from './models/FoodsSet';
import * as foodsView from './views/foodsView';
import Calculator from './models/Calculator';
import * as calculatorView from './views/calculatorView';
import * as containerView from './views/containerView';
import DOMElems from './views/dom';
import axios from 'axios';
import isMobilePad from './detectMobilePad';


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

	foodsView.renderPagesButtons(page);

	// that's all here. we then load next page every gotoNextPage() call
}


function scrollToPrevPage(newPage) {
	const type = DOMElems.mainContainer.getAttribute('theme');
	const numOfPages = Math.ceil(STATE.foodsSets[type].items.length / STATE.itemsPerPage);

	foodsView.scrollToPage(newPage);
	foodsView.renderPagesButtons(newPage);
}


function scrollToNextPage(newPage) {
	// console.log('from scrollToNextPage ' + newPage);
	const type = DOMElems.mainContainer.getAttribute('theme');
	const numOfPages = Math.ceil(STATE.foodsSets[type].items.length / STATE.itemsPerPage);

	foodsView.scrollToPage(newPage);

	// load next items page, if we don't have it yet
	const nextPageElem = document.querySelector(`.foods__page__list[data-page="${newPage + 1}"]`);
	if (!nextPageElem) {
		if (newPage < numOfPages) {
			foodsView.renderPage(STATE.foodsSets[type].items, newPage + 1, STATE.itemsPerPage);
		}
	}

	foodsView.renderPagesButtons(newPage);
}





function controlCalculator(itemElem) {
	const type = itemElem.closest('main.foods').getAttribute('theme');
	const title = itemElem.querySelector('img').id;

	if (!STATE.calculator) STATE.calculator = new Calculator();

	const calculator = STATE.calculator;

	if (!itemElem.classList.contains('selected')) {
		// add item to the calculator
		calculator.addItem(STATE.foodsSets[type].getItem(title));

		// set item to be selected
		STATE.foodsSets[type].setSelected(title, true);

		// calculate calories
		calculator.calcCalories();

		// render calories
		calculatorView.renderCalories(calculator.getTotalCalories());

		// select item
		itemElem.classList.add('selected');

		// run add-calories animation
		containerView.renderTooltip('add-calories', calculator.getCalories(title), itemElem);

	} else {
		// remove item from the calculator
		calculator.deleteItem(title);

		// remove item from being selected
		STATE.foodsSets[type].setSelected(title, false);

		// calculate calories
		calculator.calcCalories();

		// render calories
		calculatorView.renderCalories(calculator.getTotalCalories());

		// unselect item
		itemElem.classList.remove('selected');
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

	// tooltip theme
	DOMElems.tooltip.setAttribute('theme', type);
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

// DOMElems.mainContainer.addEventListener('click', event => {
// 	const item = event.target.closest('.foods__page__list__item');
// 	if (item) {
// 		controlCalculator(item);
// 	}
// });

DOMElems.mainContainer.addEventListener('mousedown', handleFoodsMouseDown);

window.addEventListener('dblclick', event => {
	event.preventDefault();
	// cancel highlighting TO DO
});


window.addEventListener('DOMContentLoaded', getItemsPerPage);
window.addEventListener('DOMContentLoaded', getDevice);
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



(function slide() {
	const minDist = Math.floor(DOMElems.mainContainer.offsetWidth / 5),
		  minDropDist = Math.floor(minDist / 2), /* for dropping (when we can assume, that it was not a drop, nut just stop) */
		  mainWidth = DOMElems.mainContainer.offsetWidth,
		  
		  halfWidth = Math.floor(mainWidth / 2),
		  updateLeftInterval = 30; /* in ms */

	let startLeft, endLeft, dist, curPage, prevPage, nextPage,
		isMoving = false, /* for detecting - just click or not */
		isDropped; // true if finishid moving, false if finished stopped

	
	function handleTouchStart(event) {
		// if position is not at the beginning of page, then return <== TO DO

		DOMElems.mainContainer.style.overflowX = 'scroll';

		DOMElems.mainContainer.addEventListener('touchmove', handleTouchMove, false);

		startLeft = DOMElems.mainContainer.scrollLeft;

		curPage = +event.target.closest('.foods__page__list').dataset.page;
		nextPage = curPage + 1;
		prevPage = curPage - 1;
	}


	function handleTouchEnd() {
		if (!isMoving) {
			// if there was not any move event, then it was just a click
			DOMElems.mainContainer.removeEventListener('touchmove', handleTouchMove);
			return;
		}

		// if there was a move event, then turn it back to false
		isMoving = false;
		endLeft = DOMElems.mainContainer.scrollLeft;
		dist = endLeft - startLeft;

		try {

			if (!isDropped) {
				// if the sliding WAS NOT dropped

				// disable scrolling
				DOMElems.mainContainer.style.overflowX = 'hidden';

				if (Math.abs(dist) < minDist) {
					// return to this page
					foodsView.scrollToPage(curPage);

					// console.log('stopped short');

				} else if (Math.abs(dist) >= halfWidth) {
					// scroll to prev/next page
					if (dist > 0) scrollToNextPage(nextPage);
					else if (dist < 0) scrollToPrevPage(prevPage);

					// console.log('stopped long');

				} else {
					// stopped between middle and minimal zone
					foodsView.scrollToPage(curPage);

					// console.log('stopped exeption')
				}

			} else {
				// if the sliding WAS dropped

				if (Math.abs(dist) < minDist) {
					// return to current page too
					DOMElems.mainContainer.style.overflowX = 'hidden';
					foodsView.scrollToPage(curPage);

					// console.log('dropped short');
				} else {
					if (dist > 0) waitForScrollEnd(nextPage, 'next');
					else if (dist < 0) waitForScrollEnd(prevPage, 'prev');

					// console.log('dropped exeption');
				}

			}

		} catch (error) {
			foodsView.scrollToPage(curPage);
			console.log(error);

		}
	}


	function handleTouchMove() {
		let then, now, interval, prevLeft, newLeft, intervalDist;

		isMoving = true;
		DOMElems.mainContainer.removeEventListener('touchmove', handleTouchMove);

		
		// get new scroll left every 'updateLeftInterval' ms

		then = Date.now();
		prevLeft = DOMElems.mainContainer.scrollLeft;

		requestAnimationFrame(function updateLeftPos() {
			// while moving, request frames
			if (isMoving) {
				// check time interval
				now = Date.now();
				interval = now - then;

				if (interval >= updateLeftInterval) {
					// console.log('int ' + interval);

					newLeft = DOMElems.mainContainer.scrollLeft;
					intervalDist = newLeft - prevLeft;

					isDropped = Math.abs(intervalDist) > minDropDist;

					prevLeft = newLeft;
					// console.log('intDist ' + intervalDist);

					then = now;
				}

				requestAnimationFrame(updateLeftPos);
			}
			
		});
	}


	function waitForScrollEnd(page, type) {
		const pageLeft = document.querySelector(`.foods__page__list[data-page="${page}"]`).offsetLeft;


		DOMElems.mainContainer.addEventListener('scroll', handleScroll);

		function handleScroll() {
			if (DOMElems.mainContainer.scrollLeft >= pageLeft) {

				DOMElems.mainContainer.scrollLeft = pageLeft;
				DOMElems.mainContainer.style.overflowX = 'hidden';

				if (type === 'prev') {
					scrollToPrevPage(page);
				} else if (type === 'next') {
					scrollToNextPage(page);
				}

				
				DOMElems.mainContainer.removeEventListener('scroll', handleScroll);
			}
		}
	}



	DOMElems.mainContainer.addEventListener('touchstart', handleTouchStart, false);
	DOMElems.mainContainer.addEventListener('touchend', handleTouchEnd, false);
	DOMElems.mainContainer.addEventListener('touchcancel', handleTouchEnd, false);


})();



function getDevice() {
	if (isMobilePad()) {
		// do stuff for the mobile or iPad

		DOMElems.mainContainer.addEventListener('contextmenu', handleLongPress);

	} else {
		// do stuff for the desktop

		// styles
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = './styles/desktop.css';
		document.head.appendChild(link);
	}
}



function handleFoodsMouseDown(event) {
	if (event.which !== 1) return;

	const item = event.target.closest('.foods__page__list__item');
	if (!item) return;

	DOMElems.mainContainer.addEventListener('mouseup', handleFoodsMouseUp);

	const timer = setTimeout(() => {
		handleLongPress(event);
	}, 500);


	function handleFoodsMouseUp() {
		DOMElems.mainContainer.removeEventListener('mouseup', handleFoodsMouseUp);
		clearTimeout(timer);

		// it's just a click
		controlCalculator(item);
	}
}



function handleLongPress(event) {
	const item = event.target.closest('.foods__page__list__item');
	if (!item) return;

	event.preventDefault();

	setGrams(item);
}



function setGrams(itemElem) {
	containerView.openOverlay();
	// highlight item, if it's not yet
	if (!itemElem.classList.contains('selected')) {
		itemElem.classList.add('hover');
	}

	// create 'style' element for adjusting position of the image (for transition)
	if (!DOMElems.dynamicStyle) {
		DOMElems.dynamicStyle = document.createElement('style');
		DOMElems.dynamicStyle.type = 'text/css';
		DOMElems.dynamicStyle.id = 'dynamic-style';
		document.head.appendChild(DOMElems.dynamicStyle);
	}

	containerView.openSetGramsContainer(itemElem);
}





function handleHold(event) {
	if (event.target.closest('.foods__page__list__item')) {
		event.preventDefault();
		containerView.openOverlay();
	}
}


function handleOverlayBtnClick() {
	containerView.closeOverlay();
}


// document.addEventListener('mousemove', event => {
// 	mouse.textContent = 'x: ' + event.clientX + ', y: ' + event.clientY;
// });


// testing
window.s = STATE;








