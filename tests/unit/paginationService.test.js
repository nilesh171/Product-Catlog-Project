/**
 * @file paginationService.test.js
 * @description Unit tests for FilterService calculatePagination and paginateProducts logic
 */

import { describe, it, expect } from '../test-framework.js';
import { FilterService } from '../../src/services/filterService.js';

export function runPaginationTests() {
  describe('FilterService — Pagination', () => {
    it('calculates pagination math correctly for first page', () => {
      // 36 items, page 1, pageSize 12 -> 3 total pages, items 1 to 12
      const meta = FilterService.calculatePagination(36, 1, 12);
      expect(meta.totalItems).toBe(36);
      expect(meta.totalPages).toBe(3);
      expect(meta.currentPage).toBe(1);
      expect(meta.startIndex).toBe(0);
      expect(meta.endIndex).toBe(12);
      expect(meta.startItem).toBe(1);
      expect(meta.endItem).toBe(12);
      expect(meta.hasPrev).toBe(false);
      expect(meta.hasNext).toBe(true);
    });

    it('calculates middle page correctly', () => {
      const meta = FilterService.calculatePagination(36, 2, 12);
      expect(meta.currentPage).toBe(2);
      expect(meta.startIndex).toBe(12);
      expect(meta.endIndex).toBe(24);
      expect(meta.startItem).toBe(13);
      expect(meta.endItem).toBe(24);
      expect(meta.hasPrev).toBe(true);
      expect(meta.hasNext).toBe(true);
    });

    it('calculates last page with remainder items correctly', () => {
      // 35 items, page 3, pageSize 12 -> page 3 has 11 items (25 to 35)
      const meta = FilterService.calculatePagination(35, 3, 12);
      expect(meta.totalPages).toBe(3);
      expect(meta.currentPage).toBe(3);
      expect(meta.startIndex).toBe(24);
      expect(meta.endIndex).toBe(35);
      expect(meta.startItem).toBe(25);
      expect(meta.endItem).toBe(35);
      expect(meta.hasPrev).toBe(true);
      expect(meta.hasNext).toBe(false);
    });

    it('clamps out-of-bounds requested page numbers safely', () => {
      // Requested page 99 with only 2 total pages -> clamps to page 2
      const metaHigh = FilterService.calculatePagination(20, 99, 10);
      expect(metaHigh.totalPages).toBe(2);
      expect(metaHigh.currentPage).toBe(2);

      // Requested page -5 -> clamps to page 1
      const metaLow = FilterService.calculatePagination(20, -5, 10);
      expect(metaLow.currentPage).toBe(1);
    });

    it('handles empty dataset gracefully without crashing', () => {
      const metaEmpty = FilterService.calculatePagination(0, 1, 12);
      expect(metaEmpty.totalItems).toBe(0);
      expect(metaEmpty.totalPages).toBe(1);
      expect(metaEmpty.currentPage).toBe(1);
      expect(metaEmpty.startItem).toBe(0);
      expect(metaEmpty.endItem).toBe(0);
      expect(metaEmpty.hasPrev).toBe(false);
      expect(metaEmpty.hasNext).toBe(false);
    });

    it('slices array correctly with paginateProducts', () => {
      const items = Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }));
      const page1 = FilterService.paginateProducts(items, 1, 10);
      expect(page1).toHaveLength(10);
      expect(page1[0].id).toBe(1);
      expect(page1[9].id).toBe(10);

      const page3 = FilterService.paginateProducts(items, 3, 10);
      expect(page3).toHaveLength(10);
      expect(page3[0].id).toBe(21);
      expect(page3[9].id).toBe(30);
    });

    it('generates page numbers with ellipsis for large page counts', () => {
      const rangeStart = FilterService.generatePageRange(1, 10);
      expect(rangeStart).toEqual([1, 2, 3, 4, 5, '...', 10]);

      const rangeMiddle = FilterService.generatePageRange(5, 10);
      expect(rangeMiddle).toEqual([1, '...', 4, 5, 6, '...', 10]);

      const rangeEnd = FilterService.generatePageRange(9, 10);
      expect(rangeEnd).toEqual([1, '...', 6, 7, 8, 9, 10]);
    });
  });
}
