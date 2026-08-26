/**
 * @file filterService.test.js
 * @description Unit tests for FilterService filterProducts logic
 */

import { describe, it, expect } from '../test-framework.js';
import { FilterService } from '../../src/services/filterService.js';

const mockProducts = [
  { id: '1', title: 'Audio Headphone Pro', category: 'Audio', price: 149.99, rating: 4.8 },
  { id: '2', title: 'Audio Cheap Speaker', category: 'Audio', price: 50.00, rating: 4.0 },
  { id: '3', title: 'Audio High-End Amp', category: 'Audio', price: 200.00, rating: 4.7 },
  { id: '4', title: 'Audio Budget Wire', category: 'Audio', price: 35.00, rating: 3.8 },
  { id: '5', title: 'Audio Ultra Expensive', category: 'Audio', price: 500.00, rating: 4.9 },
  { id: '6', title: 'Electronics Monitor 4K', category: 'Electronics', price: 200.00, rating: 4.5 },
  { id: '7', title: 'Wearable Fitness Tracker', category: 'Wearables', price: 79.99, rating: 4.2 },
  { id: '8', title: 'Gaming RGB Mouse', category: 'Gaming', price: 50.00, rating: 4.6, tags: ['wireless', 'rgb'] },
];

export function runFilterTests() {
  describe('FilterService — filterProducts()', () => {
    it('returns all products when no filters are applied', () => {
      const result = FilterService.filterProducts(mockProducts, {});
      expect(result).toHaveLength(8);
      expect(result).not.toBe(mockProducts); // returns new array
    });

    it('filters correctly by category (case-insensitive)', () => {
      const resultAudio = FilterService.filterProducts(mockProducts, { category: 'Audio' });
      expect(resultAudio).toHaveLength(5);
      expect(resultAudio.every(p => p.category === 'Audio')).toBe(true);

      const resultLower = FilterService.filterProducts(mockProducts, { category: 'audio' });
      expect(resultLower).toHaveLength(5);

      const resultElectronics = FilterService.filterProducts(mockProducts, { category: 'Electronics' });
      expect(resultElectronics).toHaveLength(1);
      expect(resultElectronics[0].id).toBe('6');
    });

    it('filters correctly by minPrice (inclusive boundary >= minPrice)', () => {
      const result = FilterService.filterProducts(mockProducts, { minPrice: 200 });
      // Items with price >= 200: id 3 ($200), id 5 ($500), id 6 ($200)
      expect(result).toHaveLength(3);
      expect(result.every(p => p.price >= 200)).toBe(true);
    });

    it('filters correctly by maxPrice (inclusive boundary <= maxPrice)', () => {
      const result = FilterService.filterProducts(mockProducts, { maxPrice: 50 });
      // Items with price <= 50: id 2 ($50), id 4 ($35), id 8 ($50)
      expect(result).toHaveLength(3);
      expect(result.every(p => p.price <= 50)).toBe(true);
    });

    it('filters correctly by price range ($50 - $200 inclusive)', () => {
      const result = FilterService.filterProducts(mockProducts, { minPrice: 50, maxPrice: 200 });
      // Items: id 1 ($149.99), id 2 ($50.00), id 3 ($200.00), id 6 ($200.00), id 7 ($79.99), id 8 ($50.00)
      expect(result).toHaveLength(6);
      expect(result.every(p => p.price >= 50 && p.price <= 200)).toBe(true);
    });

    it('filters correctly by minRating (inclusive >= minRating)', () => {
      const result = FilterService.filterProducts(mockProducts, { minRating: 4.5 });
      // Items with rating >= 4.5: id 1 (4.8), id 3 (4.7), id 5 (4.9), id 6 (4.5), id 8 (4.6)
      expect(result).toHaveLength(5);
      expect(result.every(p => p.rating >= 4.5)).toBe(true);
    });

    it('executes combined filters with strict AND semantics (Audio + $50-$200 + Rating >= 4.0)', () => {
      // Requirements example: Category=Audio, Price=$50-$200, Rating>=4.0
      const result = FilterService.filterProducts(mockProducts, {
        category: 'Audio',
        minPrice: 50,
        maxPrice: 200,
        minRating: 4.0,
      });

      // Matching Audio items in $50-$200 with rating >= 4.0:
      // id 1 ($149.99, rating 4.8) -> MATCH
      // id 2 ($50.00, rating 4.0) -> MATCH (exact boundary)
      // id 3 ($200.00, rating 4.7) -> MATCH (exact boundary)
      // id 4 ($35.00, rating 3.8) -> FAILS price and rating
      // id 5 ($500.00, rating 4.9) -> FAILS maxPrice
      expect(result).toHaveLength(3);
      expect(result.map(p => p.id)).toEqual(['1', '2', '3']);
    });

    it('returns empty array when minPrice > maxPrice', () => {
      const result = FilterService.filterProducts(mockProducts, { minPrice: 200, maxPrice: 100 });
      expect(result).toHaveLength(0);
    });

    it('returns empty array when no products match all criteria', () => {
      const result = FilterService.filterProducts(mockProducts, {
        category: 'Wearables',
        minPrice: 1000,
      });
      expect(result).toHaveLength(0);
    });

    it('filters by search keyword matching title or tags', () => {
      const resultTitle = FilterService.filterProducts(mockProducts, { search: 'headphone' });
      expect(resultTitle).toHaveLength(1);
      expect(resultTitle[0].id).toBe('1');

      const resultTag = FilterService.filterProducts(mockProducts, { search: 'wireless' });
      expect(resultTag).toHaveLength(1);
      expect(resultTag[0].id).toBe('8');
    });

    it('handles empty or malformed inputs gracefully without throwing', () => {
      expect(FilterService.filterProducts(null, {})).toHaveLength(0);
      expect(FilterService.filterProducts(undefined, {})).toHaveLength(0);
      expect(FilterService.filterProducts([null, undefined, {}], {})).toHaveLength(0);
    });
  });
}
