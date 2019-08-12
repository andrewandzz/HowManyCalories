import DOMElems from './dom';

export default class FoodsView {
	constructor(model) {
		this.model = model;
	}

	renderFoodsPages() {
		const type = this.model.curType;
		DOMElems.mainContainer.setAttribute('theme', type);
		DOMElems.mainContainer.scrollLeft = 0;

		const numOfPages = Math.ceil(this.model.sets[type].items.length / this.model.itemsPerPage);

		this.renderPage(1);

		if (numOfPages > 1) {
			this.renderPage(2);
		}

		this.renderPagesButtons();
	}

	renderPage(pageNumber) {
		const from = (pageNumber - 1) * this.model.itemsPerPage;
		const to = from + this.model.itemsPerPage;
		const type = this.model.curType;
		const itemsArr = this.model.sets[type].items;

		const createItem = itemObj => {
			const grams = this.model.STATE.calculator.getGrams(itemObj.title);
			const capitTitle = (itemObj.title[0].toUpperCase() + itemObj.title.slice(1)).replace(/-/g, ' ');

			return `
			<li class="foods__page__list__item ${(grams !== false) ? 'selected' : ''}">
				<div class="foods__page__list__item__image">
					<img id="${itemObj.title}" src="./images/foods/transparent.gif">
				</div>
				<div class="foods__page__list__item__text">
					<div class="foods__page__list__item__text--title">${capitTitle}</div>
					<div class="foods__page__list__item__text--grams">${grams || '100'}<span> g</span></div>
				</div>
			</li>`;
		}
		
		const markupItems = itemsArr.slice(from, to).reduce((string, curItemObj) => {
			return string + createItem(curItemObj);
		}, '');

		const markupFoodsPage = `
		<ul class="foods__page__list" data-page="${pageNumber}">
			${markupItems}
		</ul>`;

		DOMElems.mainContainer.insertAdjacentHTML('beforeend', markupFoodsPage);
	}


	clearFoodsPages() {
		DOMElems.mainContainer.innerHTML = '';
	}


	renderPagesButtons() {
		const curPage = this.model.curPage;
		const prevPage = document.querySelector(`.foods__page__list[data-page="${curPage - 1}"]`);
		const nextPage = document.querySelector(`.foods__page__list[data-page="${curPage + 1}"]`);

		if (prevPage) {
			DOMElems.btnPrev.style.display = 'block';
			DOMElems.btnPrev.dataset.goto = +curPage - 1;
		} else {
			DOMElems.btnPrev.style.display = 'none';
			DOMElems.btnPrev.dataset.goto = '';
		}

		if (nextPage) {
			DOMElems.btnNext.style.display = 'block';
			DOMElems.btnNext.dataset.goto = +curPage + 1;
		} else {
			DOMElems.btnNext.style.display = 'none';
			DOMElems.btnNext.dataset.goto = '';
		}
	}

	selectItem(itemElem) {
		itemElem.classList.add('selected');
	}

	deselectItem(itemElem) {
		itemElem.classList.remove('selected');
	}

	setItemGrams(itemElem, newGrams) {
		itemElem.querySelector('.foods__page__list__item__text--grams').innerHTML = `${newGrams}<span> g</span>`;
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
		const nextPageElem = document.querySelector(`.foods__page__list[data-page="${this.model.curPage + 1}"]`);
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
					console.log(this.model.curPage)
				} else if (to === 1) {
					this.scrollToNextPage();
					console.log(this.model.curPage)
				}
				
				DOMElems.mainContainer.removeEventListener('scroll', handleScroll);
			}
		}

		DOMElems.mainContainer.addEventListener('scroll', handleScroll);		
	}

	_scroll() {
		const newPageElem = document.querySelector(`.foods__page__list[data-page="${this.model.curPage}"]`);
		newPageElem.scrollIntoView({
			behavior: 'smooth',
			inline: 'start'
		});
	}

}



