/**
 * @file SortBar.js
 * @description Catalog Controls Bar for Result Count, Sorting, Page Size, and View Mode
 */

export class SortBar {
  /**
   * @param {Object} props
   * @param {import('../../services/stateService.js').StateService} props.stateService
   */
  constructor({ stateService }) {
    this.stateService = stateService;
    this.element = document.createElement('div');
    this.element.className = 'catalog-controls-bar';
    this.element.setAttribute('aria-label', 'Catalog Controls');
    this.render();
    this.bindEvents();
  }

  render() {
    this.element.innerHTML = `
      <div class="result-count-text" id="catalog-result-count" aria-live="polite">
        Showing <span class="result-count-highlight">0</span> products
      </div>

      <div class="controls-right-group">
        <!-- Sort Control -->
        <div class="control-item">
          <label for="catalog-sort-select">Sort by:</label>
          <select id="catalog-sort-select" class="select-dropdown" aria-label="Sort products">
            <option value="relevance">Featured / Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="rating-asc">Lowest Rated</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        <!-- Page Size Control -->
        <div class="control-item">
          <label for="catalog-pagesize-select">Show:</label>
          <select id="catalog-pagesize-select" class="select-dropdown" aria-label="Products per page">
            <option value="6">6 per page</option>
            <option value="12" selected>12 per page</option>
            <option value="24">24 per page</option>
            <option value="48">48 per page</option>
          </select>
        </div>

        <!-- View Mode (Grid / List) -->
        <div class="view-mode-toggle" role="group" aria-label="View layout">
          <button type="button" id="view-grid-btn" class="view-btn is-active" aria-label="Grid view" title="Grid view">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          <button type="button" id="view-list-btn" class="view-btn" aria-label="List view" title="List view">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const sortSelect = this.element.querySelector('#catalog-sort-select');
    const pageSizeSelect = this.element.querySelector('#catalog-pagesize-select');
    const gridBtn = this.element.querySelector('#view-grid-btn');
    const listBtn = this.element.querySelector('#view-list-btn');

    sortSelect.addEventListener('change', (e) => {
      this.stateService.setSort(e.target.value);
    });

    pageSizeSelect.addEventListener('change', (e) => {
      this.stateService.setPageSize(Number(e.target.value));
    });

    gridBtn.addEventListener('click', () => {
      this.stateService.setViewMode('grid');
    });

    listBtn.addEventListener('click', () => {
      this.stateService.setViewMode('list');
    });
  }

  /**
   * Update SortBar with latest pagination and count metadata
   * @param {Object} data
   * @param {import('../../services/filterService.js').FilterService} data.pagination
   * @param {number} data.filteredTotal
   * @param {number} data.catalogTotal
   * @param {Object} data.state
   */
  update({ pagination, filteredTotal, catalogTotal, state }) {
    const countEl = this.element.querySelector('#catalog-result-count');
    const sortSelect = this.element.querySelector('#catalog-sort-select');
    const pageSizeSelect = this.element.querySelector('#catalog-pagesize-select');
    const gridBtn = this.element.querySelector('#view-grid-btn');
    const listBtn = this.element.querySelector('#view-list-btn');

    if (filteredTotal === 0) {
      countEl.innerHTML = `Showing <span class="result-count-highlight">0</span> products`;
    } else if (filteredTotal === catalogTotal) {
      countEl.innerHTML = `Showing <span class="result-count-highlight">${pagination.startItem}–${pagination.endItem}</span> of <span class="result-count-highlight">${catalogTotal}</span> products`;
    } else {
      countEl.innerHTML = `Showing <span class="result-count-highlight">${pagination.startItem}–${pagination.endItem}</span> of <span class="result-count-highlight">${filteredTotal}</span> products <span style="color: var(--text-muted); font-size: 0.8125rem;">(filtered from ${catalogTotal})</span>`;
    }

    if (sortSelect && sortSelect.value !== state.sort) {
      sortSelect.value = state.sort;
    }

    if (pageSizeSelect && Number(pageSizeSelect.value) !== state.pageSize) {
      pageSizeSelect.value = String(state.pageSize);
    }

    if (gridBtn && listBtn) {
      const isList = state.viewMode === 'list';
      gridBtn.classList.toggle('is-active', !isList);
      listBtn.classList.toggle('is-active', isList);
    }
  }
}
