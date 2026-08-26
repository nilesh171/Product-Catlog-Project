/**
 * @file stateSync.test.js
 * @description Integration tests for StateService pub/sub and state mutations
 */

import { describe, it, expect } from '../test-framework.js';
import { StateService } from '../../src/services/stateService.js';

export function runStateSyncTests() {
  describe('StateService — State Management & URL Sync', () => {
    it('initializes with default values when no overrides provided', () => {
      const service = new StateService({}, false);
      const state = service.getState();
      expect(state.category).toBeNull();
      expect(state.minPrice).toBeNull();
      expect(state.maxPrice).toBeNull();
      expect(state.minRating).toBeNull();
      expect(state.sort).toBe('relevance');
      expect(state.page).toBe(1);
      expect(state.pageSize).toBe(12);
    });

    it('setting a filter automatically resets page to 1', () => {
      const service = new StateService({ page: 4 }, false);
      expect(service.getState().page).toBe(4);

      service.setFilter('category', 'Wearables');
      const state = service.getState();
      expect(state.category).toBe('Wearables');
      expect(state.page).toBe(1);
    });

    it('changing sort preserves active filters and resets page to 1', () => {
      const service = new StateService({
        category: 'Audio',
        minPrice: 50,
        maxPrice: 200,
        page: 3,
      }, false);

      service.setSort('price-asc');
      const state = service.getState();
      expect(state.sort).toBe('price-asc');
      expect(state.category).toBe('Audio');
      expect(state.minPrice).toBe(50);
      expect(state.maxPrice).toBe(200);
      expect(state.page).toBe(1);
    });

    it('changing page preserves all active filters and sort', () => {
      const service = new StateService({
        category: 'Gaming',
        minRating: 4.5,
        sort: 'rating-desc',
        page: 1,
      }, false);

      service.setPage(3);
      const state = service.getState();
      expect(state.page).toBe(3);
      expect(state.category).toBe('Gaming');
      expect(state.minRating).toBe(4.5);
      expect(state.sort).toBe('rating-desc');
    });

    it('serializes state into standard URL search string', () => {
      const service = new StateService({}, false);
      const query = service.serializeToQueryString({
        category: 'Audio',
        minPrice: 50,
        maxPrice: 200,
        minRating: 4,
        sort: 'rating-desc',
        page: 2,
        pageSize: 24,
      });

      expect(query).toContain('category=Audio');
      expect(query).toContain('minPrice=50');
      expect(query).toContain('maxPrice=200');
      expect(query).toContain('minRating=4');
      expect(query).toContain('sort=rating-desc');
      expect(query).toContain('page=2');
      expect(query).toContain('pageSize=24');
    });

    it('resetFilters clears category, price, rating, search and resets page', () => {
      const service = new StateService({
        category: 'Audio',
        minPrice: 50,
        maxPrice: 200,
        minRating: 4.5,
        search: 'headphone',
        sort: 'price-desc',
        page: 3,
      }, false);

      service.resetFilters();
      const state = service.getState();
      expect(state.category).toBeNull();
      expect(state.minPrice).toBeNull();
      expect(state.maxPrice).toBeNull();
      expect(state.minRating).toBeNull();
      expect(state.search).toBe('');
      expect(state.page).toBe(1);
      expect(state.sort).toBe('price-desc'); // Preserves chosen sort
    });

    it('clearFilter clears only the specific targeted filter', () => {
      const service = new StateService({
        category: 'Photography',
        minPrice: 100,
        maxPrice: 500,
        minRating: 4.0,
      }, false);

      service.clearFilter('category');
      expect(service.getState().category).toBeNull();
      expect(service.getState().minPrice).toBe(100);
      expect(service.getState().maxPrice).toBe(500);

      service.clearFilter('priceRange');
      expect(service.getState().minPrice).toBeNull();
      expect(service.getState().maxPrice).toBeNull();
      expect(service.getState().minRating).toBe(4.0);
    });

    it('notifies subscribers synchronously when state changes', () => {
      const service = new StateService({}, false);
      let callCount = 0;
      let lastReceivedState = null;

      const unsubscribe = service.subscribe((s) => {
        callCount++;
        lastReceivedState = s;
      });

      service.setFilter('category', 'Electronics');
      expect(callCount).toBe(1);
      expect(lastReceivedState.category).toBe('Electronics');

      unsubscribe();
      service.setFilter('category', 'Gaming');
      expect(callCount).toBe(1); // Not called after unsubscribe
    });
  });
}
