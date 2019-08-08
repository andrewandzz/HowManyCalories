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
		behavior: 'smooth',
		inline: 'start'
	});
}

export function clearPage() {
	DOMElems.mainContainer.innerHTML = '';
}

function createItem(item) {
	const capitTitle = (item.title[0].toUpperCase() + item.title.slice(1)).replace(/-/g, ' ');
	return `
	<li class="foods__page__list__item ${item.selected === true ? 'selected' : ''}">
		<div class="foods__page__list__item__image">
			<img id="${item.title}" src="./images/foods/transparent.gif">
		</div>
		<div class="foods__page__list__item__text">
			<div class="foods__page__list__item__text--title">${capitTitle}</div>
			<div class="foods__page__list__item__text--calories">${item.grams}<span> g</span></div>
		</div>
	</li>`;
}

export function renderPagesButtons(curPage) {
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







