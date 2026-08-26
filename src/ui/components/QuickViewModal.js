/**
 * @file QuickViewModal.js
 * @description Accessible Product Details Modal Dialog
 */

import { formatCurrency, formatNumber, getStarBreakdown } from '../../utils/formatters.js';
import { escapeHTML, trapFocus } from '../../utils/domUtils.js';

export class QuickViewModal {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'modal-overlay';
    this.element.id = 'product-quickview-modal';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-labelledby', 'modal-product-title');
    this.previousFocusedElement = null;

    this.render();
    this.bindEvents();
  }

  render() {
    this.element.innerHTML = `
      <div class="modal-content-card" id="modal-card">
        <button type="button" class="modal-close-btn" id="modal-close-btn" aria-label="Close product details">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="modal-body" id="modal-body-content">
          <!-- Dynamic Content -->
        </div>
      </div>
    `;
  }

  bindEvents() {
    const closeBtn = this.element.querySelector('#modal-close-btn');
    closeBtn.addEventListener('click', () => this.close());

    // Click outside modal
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.close();
      }
    });

    // Keyboard support: ESC & Focus Trap
    document.addEventListener('keydown', (e) => {
      if (!this.element.classList.contains('is-open')) return;

      if (e.key === 'Escape') {
        this.close();
      } else if (e.key === 'Tab') {
        trapFocus(this.element, e);
      }
    });
  }

  /**
   * Open modal with product data
   * @param {import('../../models/Product.js').Product} product
   */
  open(product) {
    if (!product) return;
    this.previousFocusedElement = document.activeElement;

    const stars = getStarBreakdown(product.rating);
    const fullStars = '★'.repeat(stars.full);
    const halfStar = stars.hasHalf ? '½' : '';
    const emptyStars = '☆'.repeat(stars.empty);

    const specsRows = Object.entries(product.specs || {})
      .map(
        ([key, val]) => `
        <tr>
          <td>${escapeHTML(key.charAt(0).toUpperCase() + key.slice(1))}</td>
          <td>${escapeHTML(String(val))}</td>
        </tr>
      `
      )
      .join('');

    const tagsHtml = (product.tags || [])
      .map(t => `<span class="spec-pill">#${escapeHTML(t)}</span>`)
      .join(' ');

    const body = this.element.querySelector('#modal-body-content');
    const imagePreviewHtml = product.image
      ? `<div style="width: 100%; height: 260px; border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 16px; background-color: var(--bg-surface-elevated);">
          <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.title)}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>`
      : '';

    body.innerHTML = `
      ${imagePreviewHtml}
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
        <span class="product-category-label">${escapeHTML(product.category)}</span>
        <span class="product-brand-tag">${escapeHTML(product.specs?.brand || '')}</span>
        ${product.badge ? `<span class="product-badge" style="position: static;">${escapeHTML(product.badge)}</span>` : ''}
        ${product.hasDiscount ? `<span class="product-discount-tag" style="position: static;">${product.discountPercent}% OFF</span>` : ''}
      </div>

      <h2 id="modal-product-title" style="font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; line-height: 1.3;">
        ${escapeHTML(product.title)}
      </h2>

      <div class="product-rating-row" style="margin-bottom: 12px;">
        <span class="stars-gold">${fullStars}${halfStar}${emptyStars}</span>
        <span class="rating-score-num" style="font-size: 1rem;">${stars.text}</span>
        <span class="rating-review-count">(${formatNumber(product.reviewCount)} verified customer ratings)</span>
      </div>

      <div class="price-container" style="margin-bottom: 16px; align-items: baseline; flex-wrap: wrap; gap: 8px;">
        <span class="price-current" style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary);">${formatCurrency(product.price)}</span>
        ${product.originalPrice ? `<span class="price-original" style="font-size: 1.1rem; color: var(--text-muted); text-decoration: line-through;">${formatCurrency(product.originalPrice)}</span>` : ''}
        <span style="font-size: 0.875rem; color: ${product.inStock ? 'var(--success-text)' : 'var(--danger-text)'}; font-weight: 600; margin-left: 8px;">
          ${product.inStock ? `✓ In Stock (${product.stock} units available)` : 'Out of Stock'}
        </span>
      </div>

      <div class="product-delivery-pill" style="margin-bottom: 16px; font-size: 0.85rem;">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <rect x="1" y="3" width="15" height="13"></rect>
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
          <circle cx="5.5" cy="18.5" r="2.5"></circle>
          <circle cx="18.5" cy="18.5" r="2.5"></circle>
        </svg>
        <span>⚡ Free Express Delivery by Tomorrow • 7-Day Easy Replacement</span>
      </div>

      <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 16px;">
        ${escapeHTML(product.description)}
      </p>

      ${
        product.highlights && product.highlights.length > 0
          ? `<div style="margin-bottom: 20px; background-color: var(--bg-surface-elevated); padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 8px; font-weight: 700;">Key Highlights</h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px; padding: 0; margin: 0;">
                ${product.highlights
                  .map(
                    h => `
                  <li style="display: flex; align-items: flex-start; gap: 8px; font-size: 0.875rem; color: var(--text-primary);">
                    <span style="color: var(--success-text); font-weight: bold; flex-shrink: 0;">✓</span>
                    <span>${escapeHTML(h)}</span>
                  </li>
                `
                  )
                  .join('')}
              </ul>
            </div>`
          : ''
      }

      <h3 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
        Technical Specifications
      </h3>
      <table class="modal-specs-table" aria-label="Product specifications">
        <tbody>
          ${specsRows || '<tr><td colspan="2">Standard specifications apply.</td></tr>'}
        </tbody>
      </table>

      ${tagsHtml ? `<div style="margin-top: 20px; display: flex; flex-wrap: wrap; gap: 6px;">${tagsHtml}</div>` : ''}
    `;

    this.element.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Set focus to close button
    const closeBtn = this.element.querySelector('#modal-close-btn');
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 50);
    }
  }

  close() {
    this.element.classList.remove('is-open');
    document.body.style.overflow = '';

    if (this.previousFocusedElement && typeof this.previousFocusedElement.focus === 'function') {
      this.previousFocusedElement.focus();
    }
  }
}
