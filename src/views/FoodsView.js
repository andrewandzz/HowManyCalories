import DOMElems from './dom';

export default class FoodsView {
	constructor(model) {
		this.model = model;
	}

	renderFoodsPages(page) {
		const type = this.model.curType;
		DOMElems.mainContainer.scrollLeft = 0;

		const numOfPages = Math.ceil(this.model.sets[type].items.length / this.model.itemsPerPage);

		// if 'page' is 2, then load first page too
		for (let i = 1; i <= page; i++) {
			this.renderPage(i);
		}

		if (numOfPages > page) {
			this.renderPage(page + 1);
		}

		this.renderPagesButtons();
	}

	renderPage(pageNumber) {
		const from = (pageNumber - 1) * this.model.itemsPerPage;
		const to = from + this.model.itemsPerPage;
		const type = this.model.curType;
		const itemsArr = this.model.sets[type].items;

		const createItem = itemObj => {
			const grams = this.model.STATE.Calculator.model.getGrams(itemObj.title);
			const title = this.model.STATE.language.dictionary.foods[type][itemObj.title];
			const g = this.model.STATE.language.dictionary.foods.g;

			return `
			<li class="foods__page__list__item ${(grams !== false) ? 'selected' : ''}">
				<div class="foods__page__list__item__image">
					<img id="${itemObj.title}" src="./images/transparent.gif">
				</div>
				<div class="foods__page__list__item__text">
					<div class="foods__page__list__item__text--title">${title}</div>
					<div class="foods__page__list__item__text--grams">${grams || '100'}<span> ${g}</span></div>
				</div>
			</li>`;
		}
		
		const markupItems = itemsArr.slice(from, to).reduce((string, curItemObj) => {
			return string + createItem(curItemObj);
		}, '');

		const markupFoodsPage = `
		<ul class="foods__page__list" data-type="${type}" data-page="${pageNumber}">
			${markupItems}
		</ul>`;

		DOMElems.mainContainer.insertAdjacentHTML('beforeend', markupFoodsPage);
	}


	clearFoodsPages() {
		DOMElems.mainContainer.innerHTML = '';
	}


	renderPagesButtons() {
		const curPage = this.model.curPage;
		const prevPage = DOMElems.mainContainer.querySelector(`.foods__page__list[data-page="${curPage - 1}"]`);
		const nextPage = DOMElems.mainContainer.querySelector(`.foods__page__list[data-page="${curPage + 1}"]`);

		if (prevPage && +prevPage.dataset.page !== 0) {
			DOMElems.btnPrev.classList.add('visible');
			DOMElems.btnPrev.dataset.goto = +curPage - 1;
		} else {
			DOMElems.btnPrev.classList.remove('visible');
			DOMElems.btnPrev.dataset.goto = '';
		}

		if (nextPage) {
			DOMElems.btnNext.classList.add('visible');
			DOMElems.btnNext.dataset.goto = +curPage + 1;
		} else {
			DOMElems.btnNext.classList.remove('visible');
			DOMElems.btnNext.dataset.goto = '';
		}
	}

	selectItem(itemElem) {
		itemElem.classList.add('selected');
	}

	deselectItem(itemElem) {
		itemElem.classList.remove('selected');
	}

	deselectAll() {
		const selectedItems = DOMElems.mainContainer.querySelectorAll('.foods__page__list__item.selected');
		Array.from(selectedItems).forEach(item => {
			item.classList.remove('selected');
			item.querySelector('.foods__page__list__item__text--grams').innerHTML = '100<span> g</span>';
		});
	}

	setItemGrams(itemElem, newGrams) {
		const formattedGrams = this.model.formatGrams(newGrams);

		itemElem.querySelector('.foods__page__list__item__text--grams').innerHTML = formattedGrams;
	}


	scrollToPrevPage() {
		this.model.curPage--;
		this._scroll();

		this.renderPagesButtons();
	}


	scrollToNextPage() {
		this.model.curPage++;
		this._scroll();

		// load next page, if we don't have it yet
		const type = this.model.curType;
		const numOfPages = Math.ceil(this.model.sets[type].items.length / this.model.itemsPerPage);
		const nextPageElem = DOMElems.mainContainer.querySelector(`.foods__page__list[data-page="${this.model.curPage + 1}"]`);
		if (!nextPageElem) {
			if (this.model.curPage < numOfPages) {
				this.renderPage(this.model.curPage + 1);
			}
		}

		this.renderPagesButtons();
	}

	animateScroll(to) {
		let page;

		if (to === 1) {
			page = this.model.curPage + 1;
		} else if (to === 0) {
			page = this.model.curPage - 1;
		}

		
		/* to === 1 => next page, to === 0 => prev page */
		const pageLeft = DOMElems.mainContainer.querySelector(`.foods__page__list[data-page="${page}"]`).offsetLeft;

		const handleScroll = () => {
			if (DOMElems.mainContainer.scrollLeft >= pageLeft) {

				DOMElems.mainContainer.scrollLeft = pageLeft;
				DOMElems.mainContainer.style.overflowX = 'hidden';

				if (to === 0) {
					this.scrollToPrevPage();
				} else if (to === 1) {
					this.scrollToNextPage();
				}
				
				DOMElems.mainContainer.removeEventListener('scroll', handleScroll);
			}
		}

		DOMElems.mainContainer.addEventListener('scroll', handleScroll);		
	}

	_scroll() {
		const newPageElem = DOMElems.mainContainer.querySelector(`.foods__page__list[data-page="${this.model.curPage}"]`);
		newPageElem.scrollIntoView({
			behavior: 'smooth',
			inline: 'start'
		});

		return new Promise(resolve => {
			setTimeout(() => {
				resolve();
				// scrollIntoView animation ends at ~300 ms
			}, 500);
		});
	}

	clearAroundPages() {
		// get all existing pages elements
		const existPages = DOMElems.mainContainer.querySelectorAll('.foods__page__list');

		Array.from(existPages).forEach(pageElem => {
			// remove all pages that are around current page
			if (pageElem.dataset.page != this.model.curPage) {
				pageElem.remove();
			} else {
				// set current page number to 0
				pageElem.dataset.page = 0;
			}
		});
	}


	scrollToFirstPage() {
		const zeroPage = DOMElems.mainContainer.querySelector('.foods__page__list[data-page="0"]');
		zeroPage.classList.add('scroll-out');
	}

	scrollTo(pageNumber, duration = 200) {
		const left = DOMElems.mainContainer.querySelector(`.foods__page__list[data-page="${pageNumber}"]`).offsetLeft;
		const startTime = performance.now();

		return new Promise(resolve => {
			let timeFraction, progress, scrollX;

			requestAnimationFrame(function scroll(curTime) {
				timeFraction = (curTime - startTime) / duration;
				if (timeFraction > 1) {
					timeFraction = 1;
					resolve();
				}

				progress = linear(timeFraction);
				scrollX = progress * left;

				// console.log(scrollX)

				DOMElems.mainContainer.scrollLeft = scrollX;

				if (timeFraction < 1) {
					requestAnimationFrame(scroll);
				}
			});

			function linear(timeFraction) {
				return timeFraction;
			}
		});

		
	}

	clearZeroPage() {
		DOMElems.mainContainer.querySelector(`.foods__page__list[data-page="0"]`).remove();
		DOMElems.mainContainer.scrollLeft = 0;
	}

	goToPage(pageNumber) {
		const left = DOMElems.mainContainer.querySelector(`.foods__page__list[data-page="${pageNumber}"]`).offsetLeft;
		DOMElems.mainContainer.scrollLeft = left;
	}

	showHandTooltip() {
		this.renderTooltip();

		const tooltip = document.body.querySelector('.tooltip-hand');
		
		// set goto coords to the hand
		const itemObj = this.model.STATE.Calculator.model.items[this.model.STATE.Calculator.model.items.length - 1];

		if (!itemObj) return;

		tooltip.classList.add('display');

		const tooltipWidth = tooltip.offsetWidth;
		const tooltipHeight = tooltip.offsetHeight;
		tooltip.style.left = window.innerWidth / 2 - tooltipWidth / 2 + 'px';

		const itemElem = DOMElems.mainContainer.querySelector(`.foods__page__list__item__image img#${itemObj.title}`).closest('.foods__page__list__item');

		const tooltipHandHeight = parseInt(getComputedStyle(tooltip.querySelector('.tooltip-hand--icon')).height);

		const itemCoords = itemElem.getBoundingClientRect();
		const left = itemCoords.left + (itemCoords.width / 2) - tooltipWidth / 2;
		const top = itemCoords.top + (itemCoords.height / 2) - (tooltipHeight - tooltipHandHeight);

		tooltip.addEventListener('transitionend', scaleDown, false);

		tooltip.classList.add('move');
		tooltip.style.left = left + 'px';
		tooltip.style.top = top + 'px';

		// now it is on item

		this.model.handIsDemonstrated = true;
		window.sessionStorage.setItem('handIsDemonstrated', 'true');


		function scaleDown() {
			tooltip.removeEventListener('transitionend', scaleDown);
			tooltip.addEventListener('animationend', changeIcon);

			tooltip.classList.add('scale-down');
			tooltip.classList.remove('move');

		}

		function changeIcon() {
			tooltip.removeEventListener('animationend', changeIcon);
			tooltip.classList.add('press');
			tooltip.classList.remove('default');

			setTimeout(() => {
				scaleUp();
			}, 1600);
		}

		function scaleUp() {
			tooltip.classList.add('default');
			tooltip.classList.remove('press');

			tooltip.addEventListener('animationend', move);
			tooltip.classList.add('scale-up');
			tooltip.classList.remove('scale-down');
		}

		function move() {
			tooltip.removeEventListener('animationend', move);
			tooltip.classList.remove('scale-up');
			tooltip.classList.add('move');
			tooltip.addEventListener('transitionend', removeHandElem, false);

			tooltip.style.left = window.innerWidth / 2 - tooltipWidth / 2 + 'px';
			tooltip.style.top = window.innerHeight + 'px';
		}

		function removeHandElem() {
			tooltip.removeEventListener('transitionend', removeHandElem);
			tooltip.remove();
		}
	}

	renderTooltip() {
		const tooltipMarkup = `
<div class="tooltip-hand default">
<div class="tooltip-hand--text">${this.model.STATE.language.dictionary.tooltipText}</div>
	<svg class="tooltip-hand--icon">
		<use xlink:href="./images/icons.svg#hand-default"></use>
		<use xlink:href="./images/icons.svg#hand-press"></use>
	</svg>
</div>`;
		document.body.insertAdjacentHTML('beforeend', tooltipMarkup);
	}
}







