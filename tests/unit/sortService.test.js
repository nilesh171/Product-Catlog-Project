/**
 * @file sortService.test.js
 * @description Unit tests for FilterService sortProducts logic
 */

import { describe, it, expect } from '../test-framework.js';
import { FilterService } from '../../src/services/filterService.js';

const mockItems = [
  { id: 'item-3', title: 'Gamma Device', price: 150, rating: 4.5, reviewCount: 100 },
  { id: 'item-1', title: 'Alpha Gadget', price: 50, rating: 4.8, reviewCount: 500, badge: 'Best Seller' },
  { id: 'item-4', title: 'Delta Tool', price: 50, rating: 4.0, reviewCount: 50 },
  { id: 'item-2', title: 'Beta Widget', price: 300, rating: 4.8, reviewCount: 200 },
];

export function runSortTests() {
  describe('FilterService — sortProducts()', () => {
    it('sorts price ascending (lowest to highest) with deterministic tie-breaker', () => {
      const sorted = FilterService.sortProducts(mockItems, 'price-asc');
      expect(sorted.map(i => i.id)).toEqual(['item-1', 'item-4', 'item-3', 'item-2']);
      expect(sorted[0].price).toBe(50);
      expect(sorted[1].price).toBe(50);
      expect(sorted[2].price).toBe(150);
      expect(sorted[3].price).toBe(300);
    });

    it('sorts price descending (highest to lowest) with deterministic tie-breaker', () => {
      const sorted = FilterService.sortProducts(mockItems, 'price-desc');
      expect(sorted.map(i => i.id)).toEqual(['item-2', 'item-3', 'item-1', 'item-4']);
      expect(sorted[0].price).toBe(300);
      expect(sorted[3].price).toBe(50);
    });

    it('sorts rating descending with reviewCount secondary tie-breaker', () => {
      const sorted = FilterService.sortProducts(mockItems, 'rating-desc');
      // Both item-1 and item-2 have rating 4.8, but item-1 has 500 reviews vs item-2 (200)
      expect(sorted[0].id).toBe('item-1');
      expect(sorted[1].id).toBe('item-2');
      expect(sorted[2].id).toBe('item-3');
      expect(sorted[3].id).toBe('item-4');
    });

    it('sorts rating ascending (lowest to highest)', () => {
      const sorted = FilterService.sortProducts(mockItems, 'rating-asc');
      expect(sorted[0].id).toBe('item-4'); // 4.0
      expect(sorted[1].id).toBe('item-3'); // 4.5
    });

    it('sorts name ascending (A to Z)', () => {
      const sorted = FilterService.sortProducts(mockItems, 'name-asc');
      expect(sorted.map(i => i.title)).toEqual([
        'Alpha Gadget',
        'Beta Widget',
        'Delta Tool',
        'Gamma Device',
      ]);
    });

    it('sorts name descending (Z to A)', () => {
      const sorted = FilterService.sortProducts(mockItems, 'name-desc');
      expect(sorted.map(i => i.title)).toEqual([
        'Gamma Device',
        'Delta Tool',
        'Beta Widget',
        'Alpha Gadget',
      ]);
    });

    it('does not mutate original array and returns a new copy', () => {
      const originalCopy = [...mockItems];
      const sorted = FilterService.sortProducts(mockItems, 'price-desc');
      expect(mockItems).toEqual(originalCopy);
      expect(sorted).not.toBe(mockItems);
    });

    it('handles empty or malformed arrays safely', () => {
      expect(FilterService.sortProducts([])).toEqual([]);
      expect(FilterService.sortProducts(null)).toEqual([]);
    });
  });
}
