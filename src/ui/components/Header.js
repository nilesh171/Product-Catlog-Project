/**
 * @file Header.js
 * @description Site Header Component with Search, Theme toggle, and Mobile Drawer trigger
 */

import { debounce } from '../../utils/formatters.js';

export class Header {
  /**
   * @param {Object} props
   * @param {import('../../services/stateService.js').StateService} props.stateService
   * @param {Function} props.onToggleMobileDrawer
   */
  constructor({ stateService, onToggleMobileDrawer }) {
    this.stateService = stateService;
    this.onToggleMobileDrawer = onToggleMobileDrawer;
    this.element = document.createElement('header');
    this.element.className = 'site-header';
    this.render();
    this.bindEvents();
  }

  render() {
    this.element.innerHTML = `
      <div class="app-container">
        <div class="header-inner">
          <a href="#" class="brand-logo" id="brand-logo" aria-label="AuraCatalog Home">
            <div class="brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <span>Aura<span class="brand-title-gradient">Catalog</span></span>
          </a>

          <div class="header-search-container">
            <svg class="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="search"
              id="global-search-input"
              class="search-input"
              placeholder="Search products by name, brand, tags..."
              aria-label="Search catalog products"
              autocomplete="off"
            />
            <button type="button" id="search-clear-btn" class="search-clear-btn" aria-label="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="header-actions">
            <button
              type="button"
              id="mobile-filter-btn"
              class="mobile-filter-trigger"
              aria-label="Open filter menu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              <span>Filters</span>
              <span id="mobile-filter-badge" class="filter-badge-count" style="display: none;">0</span>
            </button>

            <button
              type="button"
              id="theme-toggle-btn"
              class="btn-icon"
              aria-label="Toggle dark/light theme"
              title="Toggle theme"
            >
              <svg id="theme-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              <svg id="theme-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const searchInput = this.element.querySelector('#global-search-input');
    const searchClear = this.element.querySelector('#search-clear-btn');
    const mobileFilterBtn = this.element.querySelector('#mobile-filter-btn');
    const themeToggleBtn = this.element.querySelector('#theme-toggle-btn');
    const brandLogo = this.element.querySelector('#brand-logo');

    // Debounced search
    const handleSearch = debounce((query) => {
      this.stateService.setSearch(query);
    }, 250);

    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      searchClear.style.display = val ? 'block' : 'none';
      handleSearch(val);
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.style.display = 'none';
      this.stateService.setSearch('');
      searchInput.focus();
    });

    mobileFilterBtn.addEventListener('click', () => {
      if (typeof this.onToggleMobileDrawer === 'function') {
        this.onToggleMobileDrawer();
      }
    });

    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      this.stateService.resetAll();
    });

    // Theme toggle
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', nextTheme);
      this.updateThemeIcons(nextTheme);
      try {
        localStorage.setItem('aura_catalog_theme', nextTheme);
      } catch (_) {}
    });

    // Restore saved theme
    try {
      const saved = localStorage.getItem('aura_catalog_theme');
      if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
        this.updateThemeIcons(saved);
      }
    } catch (_) {}
  }

  updateThemeIcons(theme) {
    const moon = this.element.querySelector('#theme-icon-moon');
    const sun = this.element.querySelector('#theme-icon-sun');
    if (moon && sun) {
      moon.style.display = theme === 'light' ? 'none' : 'block';
      sun.style.display = theme === 'light' ? 'block' : 'none';
    }
  }

  /**
   * Sync search input and badge count with state
   * @param {Object} state
   */
  update(state) {
    const searchInput = this.element.querySelector('#global-search-input');
    const searchClear = this.element.querySelector('#search-clear-btn');
    const badge = this.element.querySelector('#mobile-filter-badge');

    if (searchInput && searchInput.value !== (state.search || '')) {
      searchInput.value = state.search || '';
      if (searchClear) searchClear.style.display = state.search ? 'block' : 'none';
    }

    // Calculate active filters count for mobile badge
    let activeCount = 0;
    if (state.category) activeCount++;
    if (state.minPrice !== null && state.minPrice !== '') activeCount++;
    if (state.maxPrice !== null && state.maxPrice !== '') activeCount++;
    if (state.minRating !== null && state.minRating !== '') activeCount++;
    if (state.search) activeCount++;

    if (badge) {
      if (activeCount > 0) {
        badge.textContent = String(activeCount);
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  }
}
