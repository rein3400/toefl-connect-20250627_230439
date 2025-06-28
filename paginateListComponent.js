const empty = document.createElement('p');
      empty.textContent = 'No items to display.';
      this.container.appendChild(empty);
      return;
    }
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const fragment = document.createDocumentFragment();
    this.items.slice(start, end).forEach((item, idx) => {
      const result = this.renderItem(item, start + idx);
      if (result instanceof Node) {
        fragment.appendChild(result);
      } else {
        fragment.appendChild(document.createTextNode(String(result)));
      }
    });
    this.container.appendChild(fragment);
    this.renderPagination();
  }

  renderPagination() {
    if (this.totalPages <= 1 || !this.pagerContainer) return;
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Pagination');
    const ul = document.createElement('ul');
    ul.classList.add('pagination');

    const createBtn = (label, page, disabled = false, isCurrent = false) => {
      const li = document.createElement('li');
      li.classList.add('pagination__item');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.classList.add('pagination__button');
      btn.textContent = label;
      if (isCurrent) {
        btn.setAttribute('aria-current', 'page');
        btn.classList.add('active');
        btn.disabled = true;
      } else {
        btn.dataset.page = page;
        if (disabled) {
          btn.disabled = true;
          btn.classList.add('disabled');
        }
      }
      if (label === '? First') {
        btn.setAttribute('aria-label', 'Go to first page');
      } else if (label === '? Prev') {
        btn.setAttribute('aria-label', 'Go to previous page');
      } else if (label === 'Next ?') {
        btn.setAttribute('aria-label', 'Go to next page');
      } else if (label === 'Last ?') {
        btn.setAttribute('aria-label', 'Go to last page');
      }
      li.appendChild(btn);
      return li;
    };

    ul.appendChild(createBtn('? First', 1, this.currentPage === 1));
    ul.appendChild(createBtn('? Prev', this.currentPage - 1, this.currentPage === 1));

    for (let i = 1; i <= this.totalPages; i++) {
      ul.appendChild(createBtn(i.toString(), i, false, this.currentPage === i));
    }

    ul.appendChild(createBtn('Next ?', this.currentPage + 1, this.currentPage === this.totalPages));
    ul.appendChild(createBtn('Last ?', this.totalPages, this.currentPage === this.totalPages));

    nav.appendChild(ul);
    this.pagerContainer.appendChild(nav);
  }

  _handleClick(event) {
    const btn = event.target.closest('button[data-page]');
    if (!btn) return;
    const page = parseInt(btn.dataset.page, 10);
    if (!Number.isNaN(page) && page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.render();
      if (typeof this.onPageChange === 'function') {
        this.onPageChange(page);
      }
    }
  }

  updateItems(newItems = []) {
    this.items = Array.isArray(newItems) ? newItems : [];
    this.totalPages = this.itemsPerPage > 0 ? Math.ceil(this.items.length / this.itemsPerPage) : 0;
    this.currentPage = 1;
    this.render();
  }
}

export default PaginateListComponent;