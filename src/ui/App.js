/**
 * @file App.js
 * @description Main Application Controller wiring State, Repository, Logic, and UI
 */

import { StateService } from '../services/stateService.js';
import { ProductRepository } from '../services/productRepository.js';
import { FilterService } from '../services/filterService.js';
import { Header } from './components/Header.js';
import { FilterSidebar } from './components/FilterSidebar.js';
import { ActiveFilters } from './components/ActiveFilters.js';
import { SortBar } from './components/SortBar.js';
import { ProductGrid } from './components/ProductGrid.js';
import { Pagination } from './components/Pagination.js';
import { ValidationBanner } from './components/ValidationBanner.js';
import { QuickViewModal } from './components/QuickViewModal.js';
import { announceToScreenReader } from '../utils/domUtils.js';

export class App {
  /**
   * @param {HTMLElement} rootContainer
   */
  constructor(rootContainer) {
    this.root = rootContainer;
    this.stateService = new StateService({}, true);
    this.productRepo = new ProductRepository();
    this.allProducts = [];

    this.init();
  }

  async init() {
    this.createLayout();
    this.bindDrawerEvents();

    // Show initial loading skeleton
    this.productGrid.renderLoading(6);

    try {
      this.allProducts = await this.productRepo.fetchProducts();

      // Compute catalog categories & stats
      const stats = FilterService.computeCatalogStats(this.allProducts);
      this.filterSidebar.setCategories(stats.categories, stats.totalProducts);

      // Subscribe to state updates
      this.stateService.subscribe((state) => {
        this.renderCatalog(state);
      });

      // Initial render with current state (including any initial URL params)
      this.renderCatalog(this.stateService.getState());
    } catch (err) {
      console.error('Failed to initialize product catalog:', err);
      this.productGrid.element.innerHTML = `
        <div class="catalog-empty-state" style="border-color: var(--danger-border);">
          <h3 class="empty-state-title" style="color: var(--danger-text);">Failed to load catalog</h3>
          <p class="empty-state-desc">${err.message}</p>
          <button type="button" class="btn-primary-action" onclick="window.location.reload()">Retry Loading</button>
        </div>
      `;
    }
  }

  createLayout() {
    this.root.innerHTML = '';

    // Quick View Modal
    this.quickViewModal = new QuickViewModal();
    document.body.appendChild(this.quickViewModal.element);

    // Mobile Drawer Backdrop
    this.drawerBackdrop = document.createElement('div');
    this.drawerBackdrop.className = 'drawer-backdrop';
    this.drawerBackdrop.id = 'mobile-drawer-backdrop';
    document.body.appendChild(this.drawerBackdrop);

    // Header
    this.header = new Header({
      stateService: this.stateService,
      onToggleMobileDrawer: () => this.toggleMobileDrawer(true),
    });
    this.root.appendChild(this.header.element);

    // Main App Container
    const appContainer = document.createElement('div');
    appContainer.className = 'app-container';

    const layoutGrid = document.createElement('div');
    layoutGrid.className = 'catalog-layout';

    // Sidebar
    this.filterSidebar = new FilterSidebar({
      stateService: this.stateService,
      onCloseDrawer: () => this.toggleMobileDrawer(false),
    });
    layoutGrid.appendChild(this.filterSidebar.element);

    // Main Content Column
    const mainContentCol = document.createElement('section');
    mainContentCol.className = 'catalog-main-content';
    mainContentCol.id = 'catalog-controls-section';

    // Validation Banner
    this.validationBanner = new ValidationBanner();
    mainContentCol.appendChild(this.validationBanner.element);

    // Active Filters Bar
    this.activeFilters = new ActiveFilters({
      stateService: this.stateService,
    });
    mainContentCol.appendChild(this.activeFilters.element);

    // Sort & Controls Bar
    this.sortBar = new SortBar({
      stateService: this.stateService,
    });
    mainContentCol.appendChild(this.sortBar.element);

    // Product Grid
    this.productGrid = new ProductGrid({
      onQuickView: (product) => this.quickViewModal.open(product),
      onResetFilters: () => this.stateService.resetFilters(),
    });
    mainContentCol.appendChild(this.productGrid.element);

    // Pagination
    this.pagination = new Pagination({
      stateService: this.stateService,
    });
    mainContentCol.appendChild(this.pagination.element);

    layoutGrid.appendChild(mainContentCol);
    appContainer.appendChild(layoutGrid);
    this.root.appendChild(appContainer);
  }

  bindDrawerEvents() {
    this.drawerBackdrop.addEventListener('click', () => {
      this.toggleMobileDrawer(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.filterSidebar.element.classList.contains('is-open')) {
        this.toggleMobileDrawer(false);
      }
    });
  }

  toggleMobileDrawer(open) {
    this.filterSidebar.element.classList.toggle('is-open', open);
    this.drawerBackdrop.classList.toggle('is-visible', open);
    if (open) {
      document.body.style.overflow = 'hidden';
      const firstBtn = this.filterSidebar.element.querySelector('button, input');
      if (firstBtn) setTimeout(() => firstBtn.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
  }

  /**
   * Master execution flow: processes state and updates UI components
   * @param {Object} state
   */
  renderCatalog(state) {
    const pipelineResult = FilterService.processCatalog(this.allProducts, state);

    // Update Validation Banner
    this.validationBanner.update(pipelineResult.validation);

    // Update Header (search input sync & mobile filter count badge)
    this.header.update(state);

    // Update Filter Sidebar (active inputs, category buttons, ratings)
    this.filterSidebar.update(state, pipelineResult.validation);

    // Update Active Filters Chips Bar
    this.activeFilters.update(state);

    // Update Sort and Controls Bar
    this.sortBar.update({
      pagination: pipelineResult.pagination,
      filteredTotal: pipelineResult.filteredTotal,
      catalogTotal: pipelineResult.catalogTotal,
      state,
    });

    // Update Product Cards Grid
    const hasActiveFilters = this.stateService.hasActiveFilters();
    this.productGrid.renderProducts(pipelineResult.products, state.viewMode, hasActiveFilters);

    // Update Pagination Navigation
    this.pagination.update(pipelineResult.pagination);

    // Announce to Screen Readers
    if (pipelineResult.filteredTotal === 0) {
      announceToScreenReader('No products found matching active filters.');
    } else {
      announceToScreenReader(`Showing ${pipelineResult.pagination.startItem} to ${pipelineResult.pagination.endItem} of ${pipelineResult.filteredTotal} products.`);
    }
  }
}
