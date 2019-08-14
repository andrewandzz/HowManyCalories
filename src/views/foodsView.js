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
		const prevPage = DOMElems.mainContainer.querySelector(`.foods__page__list[data-page="${curPage - 1}"]`);
		const nextPage = DOMElems.mainContainer.querySelector(`.foods__page__list[data-page="${curPage + 1}"]`);

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
	}


	setGradient() {
		const containerWidth = DOMElems.container.offsetWidth;
		const containerHeight = DOMElems.container.offsetHeight;
		const containerHypotenuse = Math.round(Math.sqrt(Math.pow(containerWidth, 2) + Math.pow(containerHeight, 2)));
		const gradientCos = containerWidth / containerHypotenuse;

		const gradientAngle = 90 + Math.round(gradientCos * 180 / Math.PI);
		const gradientLength = window.innerHeight / gradientCos;

		const firstItem = DOMElems.mainContainer.querySelector('.foods__page__list__item:first-child');
		const lastItem = DOMElems.mainContainer.querySelector('.foods__page__list__item:last-child');
		const lengthToFirstItem = firstItem.getBoundingClientRect().top / gradientCos;
		const lengthToLastItem = gradientLength - lastItem.getBoundingClientRect().bottom / gradientCos;
		
		const gradientStartPercent = Math.round(lengthToFirstItem / gradientLength * 100);
		const gradientEndPercent = 100 - Math.ceil(lengthToLastItem / gradientLength * 100);

		const colors = {
			'fruits': ['#ffdb13', '#fe9416'],
			'vegetables': ['#a46897', '#542a4b'],
			'milk': ['#8cc8ff', '#2d83d3'],
			'fast-food': ['#a5c843', '#51680e'],
			'drinks': ['#6a9563', '#2a4925'],
			'meat': ['#e38995', '#8a4951'],
			'sea-food': ['#feaa68', '#c07420'],
			'desserts': ['#90e8c5', '#3C9773'],
			'bread': ['#d85a50', '#87302a']
		};

		const colorsHover = {
			'fruits': ['#ffdb1330', '#fe941640'],
			'vegetables': ['#965a9930', '#5d325f40'],
			'milk': ['#8cc8ff30', '#2d83d340'],
			'fast-food': ['#a5c84330', '#51680e40'],
			'drinks': ['#6a956330', '#2a492540'],
			'meat': ['#e3899530', '#8a495140'],
			'sea-food': ['#feaa6830', '#c0742040'],
			'desserts': ['#90e8c530', '#3C977340'],
			'bread': ['#d85a5030', '#87302a40']
		};



		let styleElem = document.getElementById('gradient-style');
		
		if (!styleElem) {
			styleElem = document.createElement('style');
			styleElem.type = 'text/css';
			styleElem.id = 'gradient-style';
			document.head.appendChild(styleElem);
		}
		
		styleElem.innerHTML = `
.foods[theme="${this.model.curType}"] .foods__page__list__item.selected,
.foods[theme="${this.model.curType}"] .foods__page__list__item.selected:hover {
	background-image: linear-gradient(${gradientAngle}deg, ${colors[this.model.curType][0]} ${gradientStartPercent + 5}%, ${colors[this.model.curType][1]} ${gradientEndPercent - 5}%);
}

.foods[theme="${this.model.curType}"] .foods__page__list__item:hover,
.foods[theme="${this.model.curType}"] .foods__page__list__item.hover {
	background-image: linear-gradient(${gradientAngle}deg, ${colorsHover[this.model.curType][0]} ${gradientStartPercent + 5}%, ${colorsHover[this.model.curType][1]} ${gradientEndPercent - 5}%);
}`;

	}

}



