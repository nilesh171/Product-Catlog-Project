/**
 * @file ProductGrid.js
 * @description Product Grid & Empty State Renderer
 */

import { ProductCard } from './ProductCard.js';

export class ProductGrid {
  /**
   * @param {Object} props
   * @param {Function} props.onQuickView
   * @param {Function} props.onResetFilters
   */
  constructor({ onQuickView, onResetFilters }) {
    this.onQuickView = onQuickView;
    this.onResetFilters = onResetFilters;
    this.element = document.createElement('main');
    this.element.id = 'product-catalog-grid';
    this.element.className = 'product-grid';
    this.element.setAttribute('aria-label', 'Product Catalog');
  }

  /**
   * Render loading skeletons
   * @param {number} count
   */
  renderLoading(count = 6) {
    this.element.innerHTML = Array.from({ length: count })
      .map(
        () => `
        <div class="skeleton skeleton-card" aria-hidden="true"></div>
      `
      )
      .join('');
  }

  /**
   * Render products or empty state
   * @param {Array<import('../../models/Product.js').Product>} products
   * @param {'grid'|'list'} [viewMode='grid']
   * @param {boolean} [hasActiveFilters=false]
   */
  renderProducts(products = [], viewMode = 'grid', hasActiveFilters = false) {
    this.element.className = `product-grid ${viewMode === 'list' ? 'list-view' : ''}`;
    this.element.innerHTML = '';

    if (products.length === 0) {
      this.renderEmptyState(hasActiveFilters);
      return;
    }

    const fragment = document.createDocumentFragment();
    products.forEach(product => {
      const card = new ProductCard({
        product,
        onQuickView: this.onQuickView,
      });
      fragment.appendChild(card.element);
    });

    this.element.appendChild(fragment);
  }

  /**
   * Render empty state
   * @param {boolean} hasActiveFilters
   */
  renderEmptyState(hasActiveFilters) {
    const emptyContainer = document.createElement('div');
    emptyContainer.className = 'catalog-empty-state';
    emptyContainer.innerHTML = `
      <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        <line x1="8" y1="11" x2="14" y2="11"></line>
      </svg>
      <h3 class="empty-state-title">No matching products found</h3>
      <p class="empty-state-desc">
        We couldn't find any products matching your current combination of filters. Try widening your price range, lowering the rating threshold, or clearing specific filters.
      </p>
      ${
        hasActiveFilters
          ? `<button type="button" id="empty-reset-btn" class="btn-primary-action">
              Reset All Filters
            </button>`
          : ''
      }
    `;

    const resetBtn = emptyContainer.querySelector('#empty-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (typeof this.onResetFilters === 'function') {
          this.onResetFilters();
        }
      });
    }

    this.element.appendChild(emptyContainer);
  }
}
