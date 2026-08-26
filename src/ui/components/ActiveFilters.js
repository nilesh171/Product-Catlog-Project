/**
 * @file ActiveFilters.js
 * @description Active Filter Chips Bar with Removable Badges & Clear All Action
 */

import { formatCurrency } from '../../utils/formatters.js';

export class ActiveFilters {
  /**
   * @param {Object} props
   * @param {import('../../services/stateService.js').StateService} props.stateService
   */
  constructor({ stateService }) {
    this.stateService = stateService;
    this.element = document.createElement('div');
    this.element.className = 'active-filters-bar';
    this.element.setAttribute('aria-label', 'Active Filters');
    this.render();
  }

  /**
   * Render active filter chips based on current state
   * @param {Object} state
   */
  update(state) {
    const chips = [];

    // Category Chip
    if (state.category) {
      chips.push({
        id: 'category',
        label: 'Category',
        value: state.category,
      });
    }

    // Price Chip (Combined or Individual)
    const hasMin = state.minPrice !== null && state.minPrice !== undefined && state.minPrice !== '';
    const hasMax = state.maxPrice !== null && state.maxPrice !== undefined && state.maxPrice !== '';

    if (hasMin && hasMax) {
      chips.push({
        id: 'priceRange',
        label: 'Price',
        value: `${formatCurrency(state.minPrice)} – ${formatCurrency(state.maxPrice)}`,
      });
    } else if (hasMin) {
      chips.push({
        id: 'minPrice',
        label: 'Min Price',
        value: `≥ ${formatCurrency(state.minPrice)}`,
      });
    } else if (hasMax) {
      chips.push({
        id: 'maxPrice',
        label: 'Max Price',
        value: `≤ ${formatCurrency(state.maxPrice)}`,
      });
    }

    // Rating Chip
    if (state.minRating !== null && state.minRating !== undefined && state.minRating !== '') {
      chips.push({
        id: 'minRating',
        label: 'Rating',
        value: `≥ ${state.minRating} ★`,
      });
    }

    // Search Query Chip
    if (state.search && state.search.trim() !== '') {
      chips.push({
        id: 'search',
        label: 'Search',
        value: `"${state.search.trim()}"`,
      });
    }

    if (chips.length === 0) {
      this.element.innerHTML = '';
      this.element.style.display = 'none';
      return;
    }

    this.element.style.display = 'flex';
    this.element.innerHTML = `
      <span style="font-size: 0.8125rem; color: var(--text-muted); font-weight: 600; margin-right: 4px;">Active Filters:</span>
      ${chips
        .map(
          chip => `
        <div class="active-filter-chip">
          <span class="chip-label">${chip.label}:</span>
          <span>${chip.value}</span>
          <button
            type="button"
            class="chip-remove-btn"
            data-filter-key="${chip.id}"
            aria-label="Remove ${chip.label} filter"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `
        )
        .join('')}
      <button type="button" id="clear-all-chips-btn" class="btn-clear-all-chips">
        Clear All
      </button>
    `;

    this.bindEvents();
  }

  render() {
    this.update(this.stateService.getState());
  }

  bindEvents() {
    const removeButtons = this.element.querySelectorAll('.chip-remove-btn');
    removeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.filterKey;
        this.stateService.clearFilter(key);
      });
    });

    const clearAllBtn = this.element.querySelector('#clear-all-chips-btn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        this.stateService.resetFilters();
      });
    }
  }
}
