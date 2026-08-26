/**
 * @file validationService.test.js
 * @description Unit tests for ValidationService
 */

import { describe, it, expect } from '../test-framework.js';
import { ValidationService } from '../../src/services/validationService.js';

export function runValidationTests() {
  describe('ValidationService — validateFilters()', () => {
    it('validates a correct filter state with zero errors', () => {
      const state = {
        category: 'Audio',
        minPrice: 50,
        maxPrice: 200,
        minRating: 4.0,
        sort: 'price-asc',
        page: 2,
        pageSize: 12,
      };
      const result = ValidationService.validateFilters(state);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects negative minPrice and maxPrice', () => {
      const resultMin = ValidationService.validateFilters({ minPrice: -10 });
      expect(resultMin.isValid).toBe(false);
      expect(resultMin.fieldErrors.minPrice).toContain('cannot be negative');

      const resultMax = ValidationService.validateFilters({ maxPrice: -50 });
      expect(resultMax.isValid).toBe(false);
      expect(resultMax.fieldErrors.maxPrice).toContain('cannot be negative');
    });

    it('rejects non-numeric price inputs', () => {
      const result = ValidationService.validateFilters({ minPrice: 'abc' });
      expect(result.isValid).toBe(false);
      expect(result.fieldErrors.minPrice).toContain('must be a valid number');
    });

    it('rejects minPrice > maxPrice with a clear descriptive message', () => {
      const result = ValidationService.validateFilters({ minPrice: 300, maxPrice: 100 });
      expect(result.isValid).toBe(false);
      expect(result.fieldErrors.priceRange).toContain('Minimum price (₹300) cannot exceed maximum price (₹100)');
    });

    it('rejects minRating outside [0, 5]', () => {
      const resultHigh = ValidationService.validateFilters({ minRating: 6.5 });
      expect(resultHigh.isValid).toBe(false);
      expect(resultHigh.fieldErrors.minRating).toContain('between 0 and 5');

      const resultLow = ValidationService.validateFilters({ minRating: -1 });
      expect(resultLow.isValid).toBe(false);
    });

    it('rejects unknown sort options', () => {
      const result = ValidationService.validateFilters({ sort: 'unsupported-sort' });
      expect(result.isValid).toBe(false);
      expect(result.fieldErrors.sort).toContain('not supported');
    });

    it('rejects invalid page sizes', () => {
      const result = ValidationService.validateFilters({ pageSize: 999 });
      expect(result.isValid).toBe(false);
      expect(result.fieldErrors.pageSize).toContain('Page size must be one of');
    });

    it('sanitizes messy input strings to proper types', () => {
      const sanitized = ValidationService.sanitizeFilterState({
        category: '  Audio  ',
        minPrice: ' 49.99 ',
        maxPrice: ' 199.99 ',
        minRating: ' 4.5 ',
        sort: 'rating-desc',
        page: '2',
        pageSize: '24',
      });

      expect(sanitized.category).toBe('Audio');
      expect(sanitized.minPrice).toBe(49.99);
      expect(sanitized.maxPrice).toBe(199.99);
      expect(sanitized.minRating).toBe(4.5);
      expect(sanitized.sort).toBe('rating-desc');
      expect(sanitized.page).toBe(2);
      expect(sanitized.pageSize).toBe(24);
    });
  });
}
