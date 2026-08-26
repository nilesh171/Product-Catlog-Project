/**
 * @file ValidationBanner.js
 * @description Alert Banner Component for displaying validation errors
 */

import { escapeHTML } from '../../utils/domUtils.js';

export class ValidationBanner {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'validation-banner animate-slide-down';
    this.element.setAttribute('role', 'alert');
    this.element.style.display = 'none';
  }

  /**
   * Update validation errors display
   * @param {Object} validation
   * @param {boolean} validation.isValid
   * @param {string[]} validation.errors
   */
  update(validation = {}) {
    if (!validation || validation.isValid || !validation.errors || validation.errors.length === 0) {
      this.element.innerHTML = '';
      this.element.style.display = 'none';
      return;
    }

    this.element.style.display = 'flex';
    this.element.innerHTML = `
      <svg class="validation-banner-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <div>
        <strong>Filter Validation Notice:</strong>
        <ul style="margin-top: 4px; padding-left: 18px;">
          ${validation.errors.map(err => `<li>${escapeHTML(err)}</li>`).join('')}
        </ul>
      </div>
    `;
  }
}
