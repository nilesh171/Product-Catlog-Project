/**
 * @file FilterSidebar.js
 * @description Filter Sidebar & Mobile Drawer Component
 */

import { debounce } from '../../utils/formatters.js';

export class FilterSidebar {
  /**
   * @param {Object} props
   * @param {import('../../services/stateService.js').StateService} props.stateService
   * @param {Function} props.onCloseDrawer
   */
  constructor({ stateService, onCloseDrawer }) {
    this.stateService = stateService;
    this.onCloseDrawer = onCloseDrawer;
    this.categories = [];
    this.totalProducts = 0;

    this.element = document.createElement('aside');
    this.element.className = 'filter-sidebar';
    this.element.id = 'filter-sidebar-drawer';
    this.element.setAttribute('aria-label', 'Product Filters');
  }

  /**
   * Update available categories data
   * @param {Array<{ name: string, count: number }>} categories
   * @param {number} totalProducts
   */
  setCategories(categories = [], totalProducts = 0) {
    this.categories = categories;
    this.totalProducts = totalProducts;
    this.render();
    this.bindEvents();
    this.update(this.stateService.getState());
  }

  render() {
    const activeCategory = this.stateService.getState().category;

    const categoryListHtml = `
      <li class="category-item">
        <button
          type="button"
          class="category-item-btn ${!activeCategory ? 'is-active' : ''}"
          data-category="all"
          aria-label="All categories, ${this.totalProducts} items"
        >
          <span>All Categories</span>
          <span class="category-count">${this.totalProducts}</span>
        </button>
      </li>
      ${this.categories
        .map(
          cat => `
        <li class="category-item">
          <button
            type="button"
            class="category-item-btn ${activeCategory === cat.name ? 'is-active' : ''}"
            data-category="${cat.name}"
            aria-label="${cat.name}, ${cat.count} items"
          >
            <span>${cat.name}</span>
            <span class="category-count">${cat.count}</span>
          </button>
        </li>
      `
        )
        .join('')}
    `;

    this.element.innerHTML = `
      <div class="filter-header">
        <div class="filter-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span>Filters</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" id="sidebar-reset-btn" class="btn-reset-filters" aria-label="Reset all filters">
            Reset All
          </button>
          <button type="button" id="sidebar-close-btn" class="drawer-close-btn" aria-label="Close filter drawer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Categories Section -->
      <div class="filter-section">
        <h3 class="filter-section-title" id="filter-category-heading">Category</h3>
        <ul class="category-list" role="list" aria-labelledby="filter-category-heading">
          ${categoryListHtml}
        </ul>
      </div>

      <!-- Price Range Section -->
      <div class="filter-section">
        <h3 class="filter-section-title" id="filter-price-heading">Price Range (₹)</h3>
        <div class="price-inputs-row" aria-labelledby="filter-price-heading">
          <div class="price-input-group">
            <span class="price-currency-symbol">₹</span>
            <input
              type="number"
              id="min-price-input"
              class="price-input"
              placeholder="Min ₹"
              min="0"
              step="any"
              aria-label="Minimum Price in Rupees"
            />
          </div>
          <span class="price-separator">to</span>
          <div class="price-input-group">
            <span class="price-currency-symbol">₹</span>
            <input
              type="number"
              id="max-price-input"
              class="price-input"
              placeholder="Max ₹"
              min="0"
              step="any"
              aria-label="Maximum Price in Rupees"
            />
          </div>
        </div>

        <div class="quick-price-chips" aria-label="Quick price presets">
          <button type="button" class="quick-price-btn" data-min="" data-max="3000">Under ₹3,000</button>
          <button type="button" class="quick-price-btn" data-min="3000" data-max="10000">₹3,000–₹10,000</button>
          <button type="button" class="quick-price-btn" data-min="10000" data-max="25000">₹10,000–₹25,000</button>
          <button type="button" class="quick-price-btn" data-min="25000" data-max="">₹25,000+</button>
        </div>
      </div>

      <!-- Customer Rating Section -->
      <div class="filter-section">
        <h3 class="filter-section-title" id="filter-rating-heading">Customer Rating</h3>
        <div class="rating-options-list" role="radiogroup" aria-labelledby="filter-rating-heading">
          <button type="button" class="rating-option-btn" data-rating="" role="radio" aria-checked="true">
            <span>Any Rating</span>
          </button>
          <button type="button" class="rating-option-btn" data-rating="4.5" role="radio" aria-checked="false">
            <span class="rating-stars-visual">★ ★ ★ ★ ★ <span style="color: var(--text-secondary); margin-left: 4px;">4.5 & up</span></span>
          </button>
          <button type="button" class="rating-option-btn" data-rating="4.0" role="radio" aria-checked="false">
            <span class="rating-stars-visual">★ ★ ★ ★ ☆ <span style="color: var(--text-secondary); margin-left: 4px;">4.0 & up</span></span>
          </button>
          <button type="button" class="rating-option-btn" data-rating="3.5" role="radio" aria-checked="false">
            <span class="rating-stars-visual">★ ★ ★ ☆ ☆ <span style="color: var(--text-secondary); margin-left: 4px;">3.5 & up</span></span>
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Category click
    const categoryBtns = this.element.querySelectorAll('.category-item-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.category;
        this.stateService.setFilter('category', cat === 'all' ? null : cat);
      });
    });

    // Reset button
    const resetBtn = this.element.querySelector('#sidebar-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.stateService.resetFilters();
      });
    }

    // Close button (drawer)
    const closeBtn = this.element.querySelector('#sidebar-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (typeof this.onCloseDrawer === 'function') {
          this.onCloseDrawer();
        }
      });
    }

    // Min & Max Price inputs
    const minInput = this.element.querySelector('#min-price-input');
    const maxInput = this.element.querySelector('#max-price-input');

    const handlePriceChange = debounce(() => {
      const minVal = minInput.value.trim() !== '' ? Number(minInput.value) : null;
      const maxVal = maxInput.value.trim() !== '' ? Number(maxInput.value) : null;
      this.stateService.setFilters({
        minPrice: minVal,
        maxPrice: maxVal,
      });
    }, 400);

    if (minInput) {
      minInput.addEventListener('input', handlePriceChange);
      minInput.addEventListener('change', handlePriceChange);
    }
    if (maxInput) {
      maxInput.addEventListener('input', handlePriceChange);
      maxInput.addEventListener('change', handlePriceChange);
    }

    // Quick price chips
    const quickPriceBtns = this.element.querySelectorAll('.quick-price-btn');
    quickPriceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const minVal = btn.dataset.min ? Number(btn.dataset.min) : null;
        const maxVal = btn.dataset.max ? Number(btn.dataset.max) : null;
        this.stateService.setFilters({
          minPrice: minVal,
          maxPrice: maxVal,
        });
      });
    });

    // Rating buttons
    const ratingBtns = this.element.querySelectorAll('.rating-option-btn');
    ratingBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const ratingVal = btn.dataset.rating ? Number(btn.dataset.rating) : null;
        this.stateService.setFilter('minRating', ratingVal);
      });
    });
  }

  /**
   * Sync visual filter inputs with state
   * @param {Object} state
   * @param {Object} [validation]
   */
  update(state, validation = {}) {
    // 1. Update Category Buttons
    const categoryBtns = this.element.querySelectorAll('.category-item-btn');
    categoryBtns.forEach(btn => {
      const cat = btn.dataset.category;
      const isActive = (!state.category && cat === 'all') || state.category === cat;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // 2. Update Price Inputs
    const minInput = this.element.querySelector('#min-price-input');
    const maxInput = this.element.querySelector('#max-price-input');

    if (minInput) {
      const currentMinVal = minInput.value.trim() !== '' ? Number(minInput.value) : null;
      if (currentMinVal !== state.minPrice) {
        minInput.value = state.minPrice !== null && state.minPrice !== undefined ? String(state.minPrice) : '';
      }
      minInput.classList.toggle('has-error', Boolean(validation.fieldErrors?.minPrice || validation.fieldErrors?.priceRange));
    }

    if (maxInput) {
      const currentMaxVal = maxInput.value.trim() !== '' ? Number(maxInput.value) : null;
      if (currentMaxVal !== state.maxPrice) {
        maxInput.value = state.maxPrice !== null && state.maxPrice !== undefined ? String(state.maxPrice) : '';
      }
      maxInput.classList.toggle('has-error', Boolean(validation.fieldErrors?.maxPrice || validation.fieldErrors?.priceRange));
    }

    // 3. Update Rating Buttons
    const ratingBtns = this.element.querySelectorAll('.rating-option-btn');
    ratingBtns.forEach(btn => {
      const btnRating = btn.dataset.rating ? Number(btn.dataset.rating) : null;
      const isActive =
        (state.minRating === null && btnRating === null) ||
        (state.minRating !== null && btnRating === state.minRating);
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
  }
}
