/**
 * @file catalogFlow.test.js
 * @description Integration tests for full catalog workflow pipeline and repository
 */

import { describe, it, expect } from '../test-framework.js';
import { FilterService } from '../../src/services/filterService.js';
import { ProductRepository } from '../../src/services/productRepository.js';

export function runCatalogFlowTests() {
  describe('Catalog Pipeline & Repository Integration', () => {
    it('executes full pipeline: RAW PRODUCTS -> VALIDATE -> FILTER -> SORT -> PAGINATE', async () => {
      const repo = new ProductRepository();
      const allProducts = await repo.fetchProducts();
      expect(allProducts.length).toBeGreaterThanOrEqual(36);

      // Challenge Example Query: Category = Audio, Price = ₹3,000 - ₹20,000, Sort = rating-desc
      const queryState = {
        category: 'Audio',
        minPrice: 3000,
        maxPrice: 20000,
        minRating: 4.0,
        sort: 'rating-desc',
        page: 1,
        pageSize: 6,
      };

      const result = FilterService.processCatalog(allProducts, queryState);

      expect(result.validation.isValid).toBe(true);
      expect(result.filteredTotal).toBeGreaterThan(0);
      expect(result.filteredTotal).toBeLessThanOrEqual(allProducts.length);
      expect(result.products.length).toBeLessThanOrEqual(6);

      // Verify every returned product satisfies all filters
      result.products.forEach(p => {
        expect(p.category).toBe('Audio');
        expect(p.price).toBeGreaterThanOrEqual(3000);
        expect(p.price).toBeLessThanOrEqual(20000);
        expect(p.rating).toBeGreaterThanOrEqual(4.0);
      });

      // Verify rating descending order
      for (let i = 0; i < result.products.length - 1; i++) {
        expect(result.products[i].rating).toBeGreaterThanOrEqual(result.products[i + 1].rating);
      }
    });

    it('handles pagination transitions seamlessly across multiple pages', async () => {
      const repo = new ProductRepository();
      const allProducts = await repo.fetchProducts();

      // Page 1 with pageSize = 6
      const resPage1 = FilterService.processCatalog(allProducts, {
        page: 1,
        pageSize: 6,
        sort: 'price-asc',
      });

      // Page 2 with pageSize = 6
      const resPage2 = FilterService.processCatalog(allProducts, {
        page: 2,
        pageSize: 6,
        sort: 'price-asc',
      });

      expect(resPage1.products).toHaveLength(6);
      expect(resPage2.products).toHaveLength(6);

      // Ensure disjoint sets
      const ids1 = new Set(resPage1.products.map(p => p.id));
      resPage2.products.forEach(p => {
        expect(ids1.has(p.id)).toBe(false);
      });

      // Ensure price order is maintained across pages
      const lastPage1Price = resPage1.products[5].price;
      const firstPage2Price = resPage2.products[0].price;
      expect(firstPage2Price).toBeGreaterThanOrEqual(lastPage1Price);
    });

    it('returns empty product list and validation error when validation fails', () => {
      const mockData = [{ id: '1', title: 'A', category: 'Audio', price: 100, rating: 4 }];
      const result = FilterService.processCatalog(mockData, {
        minPrice: 500,
        maxPrice: 100,
      });

      expect(result.validation.isValid).toBe(false);
      expect(result.products).toHaveLength(0);
      expect(result.filteredTotal).toBe(0);
    });
  });
}
