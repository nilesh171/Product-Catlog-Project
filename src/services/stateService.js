/**
 * @file stateService.js
 * @description Centralized Reactive State Management & URL Query Synchronizer
 */

import { ValidationService, DEFAULT_PAGE_SIZE, DEFAULT_SORT } from './validationService.js';

export const INITIAL_STATE = Object.freeze({
  category: null,
  minPrice: null,
  maxPrice: null,
  minRating: null,
  search: '',
  sort: DEFAULT_SORT,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  viewMode: 'grid', // 'grid' | 'list'
});

export class StateService {
  /**
   * @param {Object} [initialOverrides={}]
   * @param {boolean} [enableUrlSync=true]
   */
  constructor(initialOverrides = {}, enableUrlSync = true) {
    this._enableUrlSync = enableUrlSync && typeof window !== 'undefined';
    this._listeners = new Set();

    // Initialize state from URL params if in browser, merged with overrides
    const urlState = this._enableUrlSync ? this.parseUrlParams() : {};
    this._state = {
      ...INITIAL_STATE,
      ...urlState,
      ...initialOverrides,
    };

    if (this._enableUrlSync) {
      this._handlePopState = this._handlePopState.bind(this);
      window.addEventListener('popstate', this._handlePopState);
    }
  }

  /**
   * Parse state from current URL query string
   * @returns {Partial<typeof INITIAL_STATE>}
   */
  parseUrlParams() {
    if (typeof window === 'undefined' || !window.location) return {};

    const params = new URLSearchParams(window.location.search);
    const parsed = {};

    if (params.has('category')) {
      const cat = params.get('category');
      parsed.category = cat && cat !== 'all' ? cat : null;
    }

    if (params.has('minPrice')) {
      const min = Number(params.get('minPrice'));
      if (!Number.isNaN(min)) parsed.minPrice = min;
    }

    if (params.has('maxPrice')) {
      const max = Number(params.get('maxPrice'));
      if (!Number.isNaN(max)) parsed.maxPrice = max;
    }

    if (params.has('minRating')) {
      const rating = Number(params.get('minRating'));
      if (!Number.isNaN(rating)) parsed.minRating = rating;
    }

    if (params.has('search')) {
      parsed.search = params.get('search') || '';
    }

    if (params.has('sort')) {
      parsed.sort = params.get('sort') || DEFAULT_SORT;
    }

    if (params.has('page')) {
      const p = parseInt(params.get('page'), 10);
      if (!Number.isNaN(p) && p >= 1) parsed.page = p;
    }

    if (params.has('pageSize')) {
      const ps = parseInt(params.get('pageSize'), 10);
      if (!Number.isNaN(ps)) parsed.pageSize = ps;
    }

    if (params.has('view')) {
      const v = params.get('view');
      if (v === 'list' || v === 'grid') parsed.viewMode = v;
    }

    return parsed;
  }

  /**
   * Serialize current state into URL search string
   * @param {Object} state
   * @returns {string}
   */
  serializeToQueryString(state = this._state) {
    const params = new URLSearchParams();

    if (state.category) params.set('category', state.category);
    if (state.minPrice !== null && state.minPrice !== undefined && state.minPrice !== '') {
      params.set('minPrice', String(state.minPrice));
    }
    if (state.maxPrice !== null && state.maxPrice !== undefined && state.maxPrice !== '') {
      params.set('maxPrice', String(state.maxPrice));
    }
    if (state.minRating !== null && state.minRating !== undefined && state.minRating !== '') {
      params.set('minRating', String(state.minRating));
    }
    if (state.search) params.set('search', state.search);
    if (state.sort && state.sort !== DEFAULT_SORT) params.set('sort', state.sort);
    if (state.page && state.page > 1) params.set('page', String(state.page));
    if (state.pageSize && state.pageSize !== DEFAULT_PAGE_SIZE) {
      params.set('pageSize', String(state.pageSize));
    }
    if (state.viewMode && state.viewMode !== 'grid') {
      params.set('view', state.viewMode);
    }

    const query = params.toString();
    return query ? `?${query}` : '';
  }

  /**
   * Sync current state to browser address bar
   * @private
   */
  _syncToUrl(replace = false) {
    if (!this._enableUrlSync) return;

    const queryString = this.serializeToQueryString(this._state);
    const newUrl = `${window.location.pathname}${queryString}${window.location.hash}`;

    if (replace) {
      window.history.replaceState({ ...this._state }, '', newUrl);
    } else {
      window.history.pushState({ ...this._state }, '', newUrl);
    }
  }

  /**
   * Handle browser navigation (back/forward)
   * @param {PopStateEvent} event
   * @private
   */
  _handlePopState(event) {
    const nextState = event.state || this.parseUrlParams();
    this._state = {
      ...INITIAL_STATE,
      ...nextState,
    };
    this._notifyListeners();
  }

  /**
   * Get immutable snapshot of current state
   * @returns {Readonly<typeof INITIAL_STATE>}
   */
  getState() {
    return Object.freeze({ ...this._state });
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener
   * @returns {() => void} Unsubscribe function
   */
  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('State listener must be a function');
    }
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  /**
   * Notify all registered subscribers
   * @private
   */
  _notifyListeners() {
    const currentState = this.getState();
    for (const listener of this._listeners) {
      try {
        listener(currentState);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }

  /**
   * Update state with partial values
   * @param {Partial<typeof INITIAL_STATE>} partialState
   * @param {boolean} [resetPage=false]
   * @param {boolean} [replaceHistory=false]
   */
  setState(partialState, resetPage = false, replaceHistory = false) {
    const nextState = {
      ...this._state,
      ...partialState,
    };

    if (resetPage) {
      nextState.page = 1;
    }

    this._state = nextState;
    this._syncToUrl(replaceHistory);
    this._notifyListeners();
  }

  /**
   * Set a specific filter (resets page to 1)
   * @param {string} key
   * @param {*} value
   */
  setFilter(key, value) {
    this.setState({ [key]: value }, true);
  }

  /**
   * Set multiple filters at once (resets page to 1)
   * @param {Object} filters
   */
  setFilters(filters) {
    this.setState(filters, true);
  }

  /**
   * Set sorting option (resets page to 1 while preserving all active filters)
   * @param {string} sort
   */
  setSort(sort) {
    this.setState({ sort }, true);
  }

  /**
   * Set page number (preserves all filters and sort)
   * @param {number} page
   */
  setPage(page) {
    this.setState({ page }, false);
  }

  /**
   * Set page size (resets page to 1, preserves all filters and sort)
   * @param {number} pageSize
   */
  setPageSize(pageSize) {
    this.setState({ pageSize }, true);
  }

  /**
   * Set search query (resets page to 1)
   * @param {string} search
   */
  setSearch(search) {
    this.setState({ search }, true);
  }

  /**
   * Set grid or list view mode
   * @param {'grid'|'list'} viewMode
   */
  setViewMode(viewMode) {
    this.setState({ viewMode }, false, true);
  }

  /**
   * Clear an individual active filter
   * @param {'category'|'minPrice'|'maxPrice'|'priceRange'|'minRating'|'search'} key
   */
  clearFilter(key) {
    if (key === 'priceRange') {
      this.setState({ minPrice: null, maxPrice: null }, true);
    } else if (key === 'category') {
      this.setState({ category: null }, true);
    } else if (key === 'minRating') {
      this.setState({ minRating: null }, true);
    } else if (key === 'search') {
      this.setState({ search: '' }, true);
    } else {
      this.setState({ [key]: null }, true);
    }
  }

  /**
   * Reset all filters to initial defaults while preserving sort and pageSize
   */
  resetFilters() {
    this.setState({
      category: null,
      minPrice: null,
      maxPrice: null,
      minRating: null,
      search: '',
      page: 1,
    }, false);
  }

  /**
   * Reset all state completely to default factory initial state
   */
  resetAll() {
    this._state = { ...INITIAL_STATE };
    this._syncToUrl(false);
    this._notifyListeners();
  }

  /**
   * Check if any non-default filters are active
   * @returns {boolean}
   */
  hasActiveFilters() {
    const s = this._state;
    return Boolean(
      s.category ||
      (s.minPrice !== null && s.minPrice !== undefined && s.minPrice !== '') ||
      (s.maxPrice !== null && s.maxPrice !== undefined && s.maxPrice !== '') ||
      (s.minRating !== null && s.minRating !== undefined && s.minRating !== '') ||
      (s.search && s.search.trim() !== '')
    );
  }

  /**
   * Clean up listeners
   */
  destroy() {
    if (this._enableUrlSync && typeof window !== 'undefined') {
      window.removeEventListener('popstate', this._handlePopState);
    }
    this._listeners.clear();
  }
}
