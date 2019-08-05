import DOMElems from './dom';

export function renderPage(itemsArr, page, perPage) {
	const from = (page - 1) * perPage;
	const to = from + perPage;

	const markupItems = itemsArr.slice(from, to).reduce((string, curItem) => {
		return string + createItem(curItem);
	}, '');
	const markupFoodsPage = `
	<ul class="foods__page__list" data-page="${page}">
		${markupItems}
	</ul>`;

	DOMElems.mainContainer.insertAdjacentHTML('beforeend', markupFoodsPage);
}

export function scrollToPage(toPage) {
	const nextPageElem = document.querySelector(`.foods__page__list[data-page="${toPage}"]`);
	nextPageElem.scrollIntoView({
		behavior: 'smooth'
	});
}

export function clearPage() {
	DOMElems.mainContainer.innerHTML = '';
}

function createItem(item) {
	const capitTitle = (item.title[0].toUpperCase() + item.title.slice(1)).replace(/-/g, ' ');
	return `
	<li class="foods__page__list__item ${item.selected === true ? 'selected' : ''}">
		<div class="foods__page__list__item--image">
			<img id="${item.title}" src="./images/foods/transparent.gif">
		</div>
		<div class="foods__page__list__item__text">
			<h3 class="foods__page__list__item__text--title">${capitTitle}</h3>
			<h4 class="foods__page__list__item__text--calories">${item.grams}<span> g</span></h4>
		</div>
	</li>`;
}

export function renderPagesButtons(curPage, numOfPages) {
	if (curPage > 1) {
		DOMElems.btnPrev.style.display = 'block';
		DOMElems.btnPrev.dataset.goto = +curPage - 1;
	} else {
		DOMElems.btnPrev.style.display = 'none';
		DOMElems.btnPrev.dataset.goto = '';
	}

	if (curPage < numOfPages) {
		DOMElems.btnNext.style.display = 'block';
		DOMElems.btnNext.dataset.goto = +curPage + 1;
	} else {
		DOMElems.btnNext.style.display = 'none';
		DOMElems.btnNext.dataset.goto = '';
	}
}








