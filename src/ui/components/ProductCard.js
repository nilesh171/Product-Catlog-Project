/**
 * @file ProductCard.js
 * @description Interactive Product Card Component with Entire Card Click-to-Open Modal
 */

import { formatCurrency, formatNumber, getStarBreakdown } from '../../utils/formatters.js';
import { escapeHTML } from '../../utils/domUtils.js';

export class ProductCard {
  /**
   * @param {Object} props
   * @param {import('../../models/Product.js').Product} props.product
   * @param {Function} props.onQuickView
   */
  constructor({ product, onQuickView }) {
    this.product = product;
    this.onQuickView = onQuickView;
    this.element = document.createElement('article');
    this.element.className = 'product-card animate-fade-in clickable-card';
    this.element.setAttribute('data-product-id', product.id);
    this.element.setAttribute('tabindex', '0');
    this.element.setAttribute('role', 'button');
    this.element.setAttribute('aria-haspopup', 'dialog');
    this.element.setAttribute('aria-label', `View details for ${product.title}, price ${formatCurrency(product.price)}`);
    this.render();
    this.bindEvents();
  }

  getCategoryFallbackSvg(category) {
    switch (category) {
      case 'Audio':
        return `<svg class="product-icon-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
        </svg>`;
      case 'Electronics':
        return `<svg class="product-icon-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>`;
      case 'Wearables':
        return `<svg class="product-icon-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="7"></circle>
          <polyline points="12 9 12 12 13.5 13.5"></polyline>
          <path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"></path>
        </svg>`;
      case 'Accessories':
        return `<svg class="product-icon-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
          <line x1="6" y1="8" x2="6" y2="8"></line>
          <line x1="10" y1="8" x2="10" y2="8"></line>
          <line x1="14" y1="8" x2="14" y2="8"></line>
          <line x1="18" y1="8" x2="18" y2="8"></line>
          <line x1="6" y1="12" x2="18" y2="12"></line>
        </svg>`;
      case 'Photography':
        return `<svg class="product-icon-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>`;
      case 'Gaming':
        return `<svg class="product-icon-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="6" y1="12" x2="10" y2="12"></line>
          <line x1="8" y1="10" x2="8" y2="14"></line>
          <line x1="15" y1="13" x2="15.01" y2="13"></line>
          <line x1="18" y1="11" x2="18.01" y2="11"></line>
          <rect x="2" y="6" width="20" height="12" rx="2"></rect>
        </svg>`;
      default:
        return `<svg class="product-icon-art" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>`;
    }
  }

  render() {
    const p = this.product;
    const stars = getStarBreakdown(p.rating);

    const fullStars = '★'.repeat(stars.full);
    const halfStar = stars.hasHalf ? '½' : '';
    const emptyStars = '☆'.repeat(stars.empty);

    let badgeClass = 'product-badge';
    if (p.badge === 'Best Seller') badgeClass += ' badge-bestseller';
    else if (p.badge === 'Flagship') badgeClass += ' badge-flagship';

    const badgeHtml = p.badge ? `<span class="${badgeClass}">${escapeHTML(p.badge)}</span>` : '';
    const discountHtml = p.hasDiscount
      ? `<span class="product-discount-tag">${p.discountPercent}% OFF</span>`
      : '';

    const specsEntries = Object.entries(p.specs || {}).slice(0, 2);
    const specsHtml = specsEntries.length
      ? `<div class="product-specs-pills">
          ${specsEntries.map(([k, v]) => `<span class="spec-pill">${escapeHTML(k)}: ${escapeHTML(String(v))}</span>`).join('')}
        </div>`
      : '';

    // Real product image markup with fallback container
    const imageHtml = p.image
      ? `<img
          src="${escapeHTML(p.image)}"
          alt="${escapeHTML(p.title)}"
          class="product-image-photo"
          loading="lazy"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        />
        <div class="product-media-fallback" style="display: none;">
          ${this.getCategoryFallbackSvg(p.category)}
        </div>`
      : `<div class="product-media-fallback">
          ${this.getCategoryFallbackSvg(p.category)}
        </div>`;

    this.element.innerHTML = `
      <div class="product-media">
        ${badgeHtml}
        ${discountHtml}
        ${imageHtml}
      </div>

      <div class="product-content">
        <div class="product-header-meta">
          <span class="product-category-label">${escapeHTML(p.category)}</span>
          <span class="product-brand-tag">${escapeHTML(p.specs?.brand || '')}</span>
        </div>

        <h3 class="product-card-title" title="${escapeHTML(p.title)}">${escapeHTML(p.title)}</h3>

        <div class="product-rating-row" aria-label="Rating: ${stars.text} out of 5 stars with ${formatNumber(p.reviewCount)} reviews">
          <span class="stars-gold">${fullStars}${halfStar}${emptyStars}</span>
          <span class="rating-score-num">${stars.text}</span>
          <span class="rating-review-count">(${formatNumber(p.reviewCount)})</span>
        </div>

        <p class="product-description-snippet">${escapeHTML(p.description)}</p>

        ${specsHtml}

        <div class="product-delivery-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
          <span>Free Express Delivery</span>
        </div>

        <div class="product-footer-row">
          <div class="price-container">
            <span class="price-current">${formatCurrency(p.price)}</span>
            ${p.originalPrice ? `<span class="price-original">${formatCurrency(p.originalPrice)}</span>` : ''}
          </div>

          <div class="card-action-indicator" aria-hidden="true">
            <span>View Details</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Open modal on click anywhere on the card
    this.element.addEventListener('click', () => {
      if (typeof this.onQuickView === 'function') {
        this.onQuickView(this.product);
      }
    });

    // Keyboard support: Open modal on Enter or Space
    this.element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (typeof this.onQuickView === 'function') {
          this.onQuickView(this.product);
        }
      }
    });
  }
}
