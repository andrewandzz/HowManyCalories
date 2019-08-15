import Menu from './models/Menu';
import * as containerView from './views/containerView';
import DOMElems from './views/dom';
import axios from 'axios';
import isMobilePad from './detectMobilePad';
import FoodsModel from './models/FoodsModel';
import FoodsView from './views/FoodsView';
import FoodsController from './controllers/FoodsController';
import CalculatorModel from './models/CalculatorModel';
import CalculatorView from './views/CalculatorView';
import CalculatorController from './controllers/CalculatorController';
import OverlayModel from './models/OverlayModel';
import OverlayView from './views/OverlayView';
import OverlayController from './controllers/OverlayController';


/* GLOBAL APPLICATION STATE */
const STATE = {};


const calculatorModel = new CalculatorModel(STATE);
const calculatorView = new CalculatorView(calculatorModel);
const Calculator = new CalculatorController(calculatorModel, calculatorView);
STATE.calculator = calculatorModel;

const foodsModel = new FoodsModel(STATE);
const foodsView2 = new FoodsView(foodsModel);
const Foods = new FoodsController(foodsModel, foodsView2);
STATE.foods = foodsModel;

const overlayModel = new OverlayModel(STATE.calculator);
const overlayView = new OverlayView(overlayModel);
const Overlay = new OverlayController(overlayModel, overlayView);
STATE.overlay = overlayModel;


function init() {
	fetchSessionStorage();
	STATE.menu = new Menu(DOMElems.menuList);
	Foods.openFoodsSet(STATE.menu.active);
}


function menuClick(event) {
	// if (!STATE.menu) STATE.menu = new Menu(DOMElems.menuList);

	const menu = STATE.menu;
	const item = event.target.closest('.menu__item');
	const type = item.dataset.type;

	if (menu.isOpened()) {
		// if clicked item is not the first item (i. e. not currently active)
		if (item !== menu.elem.querySelector('.menu__item')) {

			Foods.openFoodsSet(type);
			// controlFoods(type, 1);

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


function changeTheme(type) {
	// items :hover and .active theme
	DOMElems.mainContainer.setAttribute('theme', type);

	// footer block theme
	DOMElems.footerBlock.setAttribute('theme', type);
}


function getItemsPerPage() {
	const content = getComputedStyle(DOMElems.footerBlock, '::after').content;
	STATE.itemsPerPage = parseInt(content.replace('"', ''));
	STATE.foods.itemsPerPage = parseInt(content.replace('"', ''));
}



/*

	EVENT LISTENERS

*/

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


DOMElems.mainContainer.addEventListener('mousedown', handleFoodsMouseDown, false);

window.addEventListener('dblclick', event => {
	event.preventDefault();
	// cancel highlighting TO DO
});


window.addEventListener('DOMContentLoaded', init);
window.addEventListener('DOMContentLoaded', getItemsPerPage);
window.addEventListener('DOMContentLoaded', getDevice);
window.addEventListener('resize', getItemsPerPage);



DOMElems.btnPrev.addEventListener('click', () => {
	Foods.scrollToPrevPage();
});

DOMElems.btnNext.addEventListener('click', () => {
	Foods.scrollToNextPage();
});


document.addEventListener('keypress', event => {
	if (event.keyCode === 13 && DOMElems.overlayGramsContainer.classList.contains('visible')) {
		const id = DOMElems.overlay.querySelector('.overlay__set-grams--image--pseudo').id;
		const origItemElem = DOMElems.mainContainer.querySelector(`.foods__page__list__item__image #${id}`).closest('.foods__page__list__item');

		handleOverlayGramsClose(true);
	}
});


DOMElems.overlayGramsBtnInc.addEventListener('click', () => {
	Overlay.increaseGrams();
	// -1 because when we click buttons,
	// we don't need to compare focus and blur values
	// (because animation has already played)
	Overlay.model.onFocusValue = -1;
}, false);

DOMElems.overlayGramsBtnDec.addEventListener('click', () => {
	Overlay.decreaseGrams();
	// -1 because when we click buttons,
	// we don't need to compare focus and blur values
	// (because animation has already played)
	Overlay.model.onFocusValue = -1;
}, false);


DOMElems.overlayGramsBtn.addEventListener('click', () => {
	handleOverlayGramsClose(true);
}, false);

DOMElems.overlayGramsInputNumber.addEventListener('focus', function() {
	if (Overlay.model.onFocusValue === -1) {
		Overlay.model.onFocusValue = this.value.replace('.', '');
	}
});

DOMElems.overlayGramsContainer.addEventListener('click', event => {
	if (!event.target.matches('.overlay__set-grams__container')) return;
	// it's blur, not cancel
	handleOverlayGramsInputBlur();
}, false);

DOMElems.overlayGramsImg.addEventListener('click', () => {
	// it's blur, not cancel
	handleOverlayGramsInputBlur();
}, false);

function handleOverlayGramsInputBlur() {
	const focusValue = Overlay.model.onFocusValue;

	// -1 can be, when we click on inc/dec buttons
	if (focusValue === -1) return;

	const blurValue = DOMElems.overlayGramsInputNumber.value.replace('.', '');

	if (focusValue < blurValue) {
		Overlay.view.animateImgChangeSize(1);
	} else if (focusValue > blurValue) {
		Overlay.view.animateImgChangeSize(0);
	}

	Overlay.model.onFocusValue = -1;
}

DOMElems.overlay.addEventListener('click', event => {
	// only click outside the container
	if (event.target.closest('.overlay__set-grams__container') || event.target.matches('.overlay__set-grams--image')) return;

	handleOverlayGramsClose(false);
}, false);



(function swipe() {
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

		// curPage = +event.target.closest('.foods__page__list').dataset.page;
		// nextPage = curPage + 1;
		// prevPage = curPage - 1;
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
					Foods.view._scroll();
					// console.log('stopped short');

				} else if (Math.abs(dist) >= halfWidth) {
					// scroll to prev/next page
					if (dist > 0) Foods.scrollToNextPage();
					else if (dist < 0) Foods.scrollToPrevPage();
					// console.log('stopped long');

				} else {
					// stopped between middle and minimal zone
					Foods.view._scroll();
					// console.log('stopped exeption')
				}

			} else {
				// if the sliding WAS dropped
				if (Math.abs(dist) < minDist) {
					// return to current page too
					// disable scrolling in this case
					DOMElems.mainContainer.style.overflowX = 'hidden';
					Foods.view._scroll();
					// console.log('dropped short');

				} else {
					/* 1 is next page, 0 is prev page */
					if (dist > 0) Foods.view.animateScroll(1);
					else if (dist < 0) Foods.view.animateScroll(0);
					// console.log('dropped exeption');
				}

			}

		} catch (error) {
			Foods.view._scroll();
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
		menuHoverAnimation();

		// styles
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = './styles/desktop.css';
		document.head.appendChild(link);
	}
}


function menuHoverAnimation() {
	const menuCoords = DOMElems.menuList.getBoundingClientRect();
	const menuCenter = menuCoords.left + menuCoords.width / 2;

	DOMElems.menuList.addEventListener('mousemove', event => {
		const bgPosX = event.clientX - menuCenter;
		const menuItem = event.target.closest('.menu__item');
		menuItem.style.backgroundPositionX = bgPosX + 'px';
	}, false);
}



DOMElems.caloriesIcon.addEventListener('click', event => {
	const icon = event.target.closest('.calories--icon');
	if (!icon) return;

	if (icon.classList.contains('active') && icon.classList.contains('clickable')) {
		Calculator.clearTotalCalories();
		Foods.view.deselectAll();
	}	
});



function handleFoodsMouseDown(event) {
	if (event.which !== 1) return;

	const itemElem = event.target.closest('.foods__page__list__item');
	if (!itemElem) return;

	DOMElems.mainContainer.addEventListener('mouseup', handleFoodsMouseUp, false);

	const timer = setTimeout(() => {
		handleLongPress(event);
		DOMElems.mainContainer.removeEventListener('mouseup', handleFoodsMouseUp);
	}, 500);


	function handleFoodsMouseUp() {
		DOMElems.mainContainer.removeEventListener('mouseup', handleFoodsMouseUp);
		clearTimeout(timer);
		// it's just a click
		// controlCalculator(item);
		const type = STATE.menu.active;
		const title = itemElem.querySelector('.foods__page__list__item__image img').id;

		if (!Calculator.includes(title)) {
			Calculator.addItem(STATE.foods.sets[type].getItemObj(title));
			Foods.view.selectItem(itemElem);
			
		} else {
			Calculator.deleteItem(title);
			Foods.view.deselectItem(itemElem);
			Foods.view.setItemGrams(itemElem, 100);
		}
		
	}
}



function handleLongPress(event) {
	const itemElem = event.target.closest('.foods__page__list__item');
	if (!itemElem) return;

	event.preventDefault();

	if (!itemElem.classList.contains('selected')) {
		itemElem.classList.add('hover');
	}
	
	Overlay.open(itemElem);
}


async function handleOverlayGramsClose(save) {
	const itemElem = Overlay.model.itemElem;
	const type = STATE.menu.active;
	const title = Overlay.model.itemData.title;

	if (Overlay.validateGramsInput()) {

		const grams = Overlay.model.itemData.grams;

		await Overlay.close();

		if (itemElem.classList.contains('hover')) {
			// item was NOT selected
			if (save) {
				Calculator.setGrams(STATE.foods.sets[type].getItemObj(title), grams);
				Foods.view.selectItem(itemElem);
				Foods.view.setItemGrams(itemElem, grams);
			}

			itemElem.classList.remove('hover');
		} else {
			// item WAS selected
			// if user wants to save changes
			// and current value is different to the starting value
			if (save && Overlay.isGramsInputChanged()) {
				Calculator.setGrams(STATE.foods.sets[type].getItemObj(title), grams);
				Foods.view.setItemGrams(itemElem, grams);
			}
		}		
	}
}



function fetchSessionStorage() {
	const trashIsDemonstrated = window.sessionStorage.getItem('trashIsDemonstrated');
	if (!trashIsDemonstrated) {
		STATE.trashIsDemonstrated = false;
	} else {
		STATE.trashIsDemonstrated = true;
	}
	
}


// testing
// document.addEventListener('mousemove', event => {
// 	mouse.textContent = 'x: ' + event.clientX + ', y: ' + event.clientY;
// });


// testing
window.s = STATE;








