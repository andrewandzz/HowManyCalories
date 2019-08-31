import isMobilePad from './detectMobilePad';
import LanguageModel from './models/LanguageModel';
import LanguageView from './views/LanguageView';
import LanguageController from './controllers/LanguageController';
import MenuModel from './models/MenuModel';
import MenuView from './views/MenuView';
import MenuController from './controllers/MenuController';
import FoodsModel from './models/FoodsModel';
import FoodsView from './views/FoodsView';
import FoodsController from './controllers/FoodsController';
import CalculatorModel from './models/CalculatorModel';
import CalculatorView from './views/CalculatorView';
import CalculatorController from './controllers/CalculatorController';
import FooterModel from './models/FooterModel';
import FooterView from './views/FooterView';
import FooterController from './controllers/FooterController';
import OverlayModel from './models/OverlayModel';
import OverlayView from './views/OverlayView';
import OverlayController from './controllers/OverlayController';
import DOMElems from './views/dom';


/* GLOBAL APPLICATION STATE */
const STATE = {};


const languageModel = new LanguageModel(STATE);
const languageView = new LanguageView(languageModel);
const Language = new LanguageController(languageModel, languageView);
STATE.language = languageModel;

const menuModel = new MenuModel(STATE.language);
const menuView = new MenuView(menuModel);
const Menu = new MenuController(menuModel, menuView);
STATE.Menu = Menu;

const calculatorModel = new CalculatorModel(STATE);
const calculatorView = new CalculatorView(calculatorModel);
const Calculator = new CalculatorController(calculatorModel, calculatorView);
STATE.Calculator = Calculator;

const foodsModel = new FoodsModel(STATE);
const foodsView = new FoodsView(foodsModel);
const Foods = new FoodsController(foodsModel, foodsView);
STATE.Foods = Foods;

const footerModel = new FooterModel(STATE);
const footerView = new FooterView(footerModel);
const Footer = new FooterController(footerModel, footerView);
STATE.Footer = Footer;

const overlayModel = new OverlayModel(STATE);
const overlayView = new OverlayView(overlayModel);
const Overlay = new OverlayController(overlayModel, overlayView);
STATE.Overlay = Overlay;


async function init() {
	getItemsPerPage();
	setBtnsBgPos();
	await Language.setLanguage();
	Menu.render();
	Footer.render();
	Foods.openFoodsSet(Menu.model.current);
}


function load() {
	getDevice();
	fetchSessionStorage();
}


function getItemsPerPage() {
	const content = getComputedStyle(DOMElems.footerBlock, '::after').content;
	Foods.model.itemsPerPage = parseInt(content.replace('"', ''));
}


function getDevice() {
	if (isMobilePad()) {
		// do stuff for the mobile or iPad
		DOMElems.mainContainer.addEventListener('contextmenu', handleLongPress);

	} else {
		// do stuff for the desktop
		// menuHoverAnimation();

		// styles
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = './styles/desktop.css';
		document.head.appendChild(link);
	}
}


function setBtnsBgPos() {
	const btnPrevSvgElem = DOMElems.btnPrev.querySelector('.arrow--icon');
	btnPrevSvgElem.style.backgroundPositionX = -btnPrevSvgElem.getBoundingClientRect().left + 'px';
	btnPrevSvgElem.style.backgroundPositionY = -btnPrevSvgElem.getBoundingClientRect().top + 'px';

	const btnNextSvgElem = DOMElems.btnNext.querySelector('.arrow--icon');
	btnNextSvgElem.style.backgroundPositionX = -btnNextSvgElem.getBoundingClientRect().left + 'px';
	btnNextSvgElem.style.backgroundPositionY = -btnNextSvgElem.getBoundingClientRect().top + 'px';
}



/*

	EVENT LISTENERS

*/

document.addEventListener('click', event => {
	// if menu is opened and click is outside of the menu
	if (Menu.model.isOpened && !event.target.closest('.menu')) {
		Menu.close();
	}

	// if footer is opened and click is outside of the footer
	if (Footer.model.isOpened && !event.target.closest('.bottom')) {
		Footer.close();
	}
});

DOMElems.menuList.addEventListener('click',  event => {
	if (!Menu.model.isOpened) {
		Menu.open();
	} else {
		const newItemElem = event.target.closest('.menu__item');
		// if click is on current item
		if (newItemElem.dataset.type === Menu.model.current) {
			Menu.close();
		} else {
			Menu.close(newItemElem);
			Foods.changeFoodsSet(Menu.model.current);
			// change foods set
			// Foods.openFoodsSet(Menu.model.current);
			Footer.view.changeTheme();
		}
	}
});


DOMElems.mainContainer.addEventListener('mousedown', handleFoodsMouseDown, false);


window.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', load);
window.addEventListener('resize', getItemsPerPage);
window.addEventListener('resize', setBtnsBgPos);
window.addEventListener('dblclick', event => event.preventDefault());


DOMElems.btnPrev.addEventListener('click', () => {
	Foods.scrollToPrevPage();
});

DOMElems.btnNext.addEventListener('click', () => {
	Foods.scrollToNextPage();
});



DOMElems.overlay.addEventListener('click', event => {
	// only click outside the container
	if (event.target.closest('.overlay__set-grams__container') || event.target.matches('.overlay__set-grams--image') || event.target.matches('.overlay__contact__container, .overlay__contact__container *')) return;

	if (Overlay.model.isSetGramsOpened) {
		Overlay.handleOverlayGramsClose(false);
	} else if (Overlay.model.isContactOpened) {
		Overlay.closeContact();
	}
}, false);


document.addEventListener('keyup', event => {
	if (event.keyCode === 13 && Overlay.model.isSetGramsOpened) {
		Overlay.handleOverlayGramsClose(true);
	} else if (event.keyCode === 27 && this.model.isSetGramsOpened) {
		Overlay.handleOverlayGramsClose(false);
	} else return;
});

DOMElems.setGramsBtnInc.addEventListener('click', () => {
	Overlay.increaseGrams();
	// -1 because when we click buttons,
	// we don't need to compare focus value and blur value
	// (because animation has already played)
	Overlay.model.onFocusValue = -1;
}, false);

DOMElems.setGramsBtnDec.addEventListener('click', () => {
	Overlay.decreaseGrams();
	// -1 because when we click buttons,
	// we don't need to compare focus value and blur value
	// (because animation has already played)
	Overlay.model.onFocusValue = -1;
}, false);

DOMElems.setGramsBtn.addEventListener('click', () => {
	Overlay.handleOverlayGramsClose(true);
}, false);

DOMElems.setGramsInputNumber.addEventListener('focus', () => {
	if (Overlay.model.onFocusValue === -1) {
		Overlay.model.onFocusValue = DOMElems.setGramsInputNumber.value.replace('.', '');
	}
});

DOMElems.setGramsContainer.addEventListener('click', event => {
	if (!event.target.matches('.overlay__set-grams__container')) return;
	// it's blur, not cancel
	handleOverlayGramsInputBlur();
}, false);

DOMElems.setGramsImg.addEventListener('click', () => {
	// it's blur, not cancel
	handleOverlayGramsInputBlur();
}, false);



function handleOverlayGramsInputBlur() {
	const focusValue = Overlay.model.onFocusValue;

	// -1 can be, when we click on inc/dec buttons
	if (focusValue === -1) return;

	const blurValue = DOMElems.setGramsInputNumber.value.replace('.', '');

	if (focusValue < blurValue) {
		Overlay.view.animateImgChangeSize(1);
	} else if (focusValue > blurValue) {
		Overlay.view.animateImgChangeSize(0);
	}

	Overlay.model.onFocusValue = -1;
}



DOMElems.footerMenu.addEventListener('click', event => {
	if (event.target.closest('.bottom__menu--language')) {
		Footer.open();
	} else if (event.target.closest('.bottom__menu--contact')) {
		Overlay.openContact();
	}
	
}, false);



DOMElems.footerLangList.addEventListener('click', async event => {
	const langItem = event.target.closest('.bottom__flags__item');
	if (!langItem) return;

	if (langItem.classList.contains('clickable')) {
		const lang = langItem.dataset.lang;
		await Language.setLanguage(lang);
		// rerender menu
		Menu.render();
		// reload foods pages on new language
		Foods.openFoodsSet(Menu.model.current, true, Foods.model.curPage);
		Foods.view.goToPage(Foods.model.curPage);
		// // rerender footer text
		Footer.render();
		Footer.close(true);

	} else {
		Footer.close();
	}

}, false);


// DOMElems.overlayContactForm.addEventListener('submit', event => {
// 	event.preventDefault();
// 	Overlay.sendMessage();
// }, false);

// DOMElems.overlayContactEmail.addEventListener('invalid', event => {
// 	event.preventDefault();
// 	Overlay.sendMessage();
// });

// DOMElems.overlayContactMessage.addEventListener('invalid', event => {
// 	event.preventDefault();
// 	Overlay.view.showContactInvalidMessage();
// });



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






// function menuHoverAnimation() {
// 	const menuCoords = DOMElems.menuList.getBoundingClientRect();
// 	const menuCenter = menuCoords.left + menuCoords.width / 2;

// 	DOMElems.menuList.addEventListener('mousemove', event => {
// 		const bgPosX = event.clientX - menuCenter;
// 		const menuItem = event.target.closest('.menu__item');
// 		menuItem.style.backgroundPositionX = bgPosX + 'px';
// 	}, false);
// }



DOMElems.caloriesIcon.addEventListener('click', event => {
	const icon = DOMElems.caloriesIcon;
	if (icon.classList.contains('active') && icon.classList.contains('trash')) {
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

		// it's just a CLICK

		const type = Menu.model.current;
		const title = itemElem.querySelector('.foods__page__list__item__image img').id;

		if (!Calculator.includes(title)) {
			// ADD ITEM
			Calculator.addItem(Foods.model.sets[type].getItemObj(title));
			Foods.view.selectItem(itemElem);
			Foods.showPressAndHoldTooltip();
			
		} else {
			// DELETE ITEM
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
	
	Overlay.openSetGrams(itemElem);
	Foods.model.handIsDemonstrated = true;
	window.sessionStorage.setItem('handIsDemonstrated', 'true');
}


// async function handleOverlayGramsClose(save) {
// 	const itemElem = Overlay.model.itemElem;
// 	const type = Menu.model.current;
// 	const title = Overlay.model.itemData.title;

// 	if (save) {

// 		if (itemElem.classList.contains('hover')) {
// 			// if it was NOT selected

// 			if (Overlay.validateGramsInput()) {
// 				const grams = Overlay.model.itemData.grams;
				
// 				await Overlay.closeSetGrams();

// 				Calculator.setGrams(STATE.foods.sets[type].getItemObj(title), grams);
// 				Foods.view.selectItem(itemElem);
// 				Foods.view.setItemGrams(itemElem, grams);

// 				itemElem.classList.remove('hover');
// 			}
// 		} else {
// 			// if it WAS selected

// 			if (Overlay.isGramsInputChanged()) {
// 				// something changed, check
// 				if (Overlay.validateGramsInput()) {
// 					const grams = Overlay.model.itemData.grams;

// 					await Overlay.closeSetGrams();

// 					Calculator.setGrams(STATE.foods.sets[type].getItemObj(title), grams);
// 					Foods.view.setItemGrams(itemElem, grams);
// 				}

// 			} else {
// 				// nothing changed, just close
// 				Overlay.closeSetGrams();
// 			}
// 		}

// 	} else {
// 		// if we don't want to save, then we don't care
// 		await Overlay.closeSetGrams();
// 		itemElem.classList.remove('hover');
// 	}
// }




function fetchSessionStorage() {
	const trashIsDemonstrated = window.sessionStorage.getItem('trashIsDemonstrated');
	const handIsDemonstrated = window.sessionStorage.getItem('handIsDemonstrated');

	if (!trashIsDemonstrated) Calculator.model.trashIsDemonstrated = false;
	else Calculator.model.trashIsDemonstrated = true;

	if (!handIsDemonstrated) Foods.model.handIsDemonstrated = false;
	else Foods.model.handIsDemonstrated = true;
}


// testing
// window.s = STATE;








