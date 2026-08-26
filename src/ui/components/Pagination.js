/**
 * @file Pagination.js
 * @description Accessible Pagination Controls Component
 */

export class Pagination {
  /**
   * @param {Object} props
   * @param {import('../../services/stateService.js').StateService} props.stateService
   */
  constructor({ stateService }) {
    this.stateService = stateService;
    this.element = document.createElement('nav');
    this.element.className = 'pagination-container';
    this.element.setAttribute('aria-label', 'Product Catalog Pagination');
  }

  /**
   * Update pagination buttons based on pagination metadata
   * @param {Object} pagination
   */
  update(pagination) {
    if (!pagination || pagination.totalPages <= 1) {
      this.element.innerHTML = '';
      this.element.style.display = 'none';
      return;
    }

    this.element.style.display = 'flex';

    const { currentPage, totalPages, hasPrev, hasNext, pageNumbers } = pagination;

    let html = `
      <!-- Previous Button -->
      <button
        type="button"
        class="page-nav-btn"
        data-page="${currentPage - 1}"
        ${!hasPrev ? 'disabled' : ''}
        aria-label="Go to previous page, page ${currentPage - 1}"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    `;

    pageNumbers.forEach(item => {
      if (item === '...') {
        html += `<span class="page-ellipsis" aria-hidden="true">…</span>`;
      } else {
        const isCurrent = item === currentPage;
        html += `
          <button
            type="button"
            class="page-nav-btn ${isCurrent ? 'is-active' : ''}"
            data-page="${item}"
            ${isCurrent ? 'aria-current="page"' : ''}
            aria-label="Go to page ${item}"
          >
            ${item}
          </button>
        `;
      }
    });

    html += `
      <!-- Next Button -->
      <button
        type="button"
        class="page-nav-btn"
        data-page="${currentPage + 1}"
        ${!hasNext ? 'disabled' : ''}
        aria-label="Go to next page, page ${currentPage + 1}"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    `;

    this.element.innerHTML = html;
    this.bindEvents();
  }

  bindEvents() {
    const buttons = this.element.querySelectorAll('.page-nav-btn:not(:disabled)');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPage = parseInt(btn.dataset.page, 10);
        if (!Number.isNaN(targetPage) && targetPage >= 1) {
          this.stateService.setPage(targetPage);
          // Smooth scroll to top of catalog
          const catalogSection = document.getElementById('catalog-controls-section');
          if (catalogSection) {
            catalogSection.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }
}
