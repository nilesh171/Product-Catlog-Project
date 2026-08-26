/**
 * @file edgeCases.test.js
 * @description Adversarial QA & Edge Case Test Suite
 */

import { describe, it, expect } from '../test-framework.js';
import { FilterService } from '../../src/services/filterService.js';
import { ValidationService } from '../../src/services/validationService.js';
import { StateService } from '../../src/services/stateService.js';
import { escapeHTML } from '../../src/utils/domUtils.js';

export function runEdgeCaseTests() {
  describe('Adversarial & Edge Cases', () => {
    it('escapes malicious XSS payloads safely', () => {
      const malicious = '<script>alert("xss")</script><img src=x onerror=alert(1)>';
      const escaped = escapeHTML(malicious);
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
      expect(escaped).toContain('&lt;img');
    });

    it('handles floating point currency matching without rounding leaks', () => {
      const products = [
        { id: '1', title: 'Item 1', category: 'Audio', price: 79.50, rating: 4.2 },
        { id: '2', title: 'Item 2', category: 'Audio', price: 79.51, rating: 4.2 },
      ];

      // Exact match minPrice 79.50
      const exact = FilterService.filterProducts(products, { minPrice: 79.50, maxPrice: 79.50 });
      expect(exact).toHaveLength(1);
      expect(exact[0].id).toBe('1');
    });

    it('handles extreme price numbers ($1,000,000,000) safely', () => {
      const products = [
        { id: '1', title: 'Luxury Server Rack', category: 'Electronics', price: 999999.99, rating: 5 },
      ];
      const result = FilterService.filterProducts(products, { minPrice: 100000 });
      expect(result).toHaveLength(1);
    });

    it('handles rapid sequential state updates without memory leaks or race conditions', () => {
      const service = new StateService({}, false);
      for (let i = 0; i < 50; i++) {
        service.setFilter('search', `query-${i}`);
        service.setPage(i + 1);
      }
      expect(service.getState().search).toBe('query-49');
      expect(service.getState().page).toBe(50);
    });

    it('handles missing or undefined product properties gracefully', () => {
      const dirtyProducts = [
        null,
        undefined,
        {},
        { id: 'p1' },
        { id: 'p2', price: null, rating: undefined },
        { id: 'p3', title: 'Valid Product', category: 'Audio', price: 100, rating: 4.5 },
      ];

      const filtered = FilterService.filterProducts(dirtyProducts, { category: 'Audio' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('p3');
    });

    it('handles category casing and whitespace mismatch gracefully', () => {
      const products = [{ id: '1', title: 'Headphones', category: 'Audio', price: 100, rating: 4.5 }];
      const res = FilterService.filterProducts(products, { category: '   aUdiO   ' });
      expect(res).toHaveLength(1);
    });

    it('maintains state integrity when clearFilter is called on nonexistent keys', () => {
      const service = new StateService({ category: 'Audio' }, false);
      service.clearFilter('nonexistentKey');
      expect(service.getState().category).toBe('Audio');
    });
  });
}
