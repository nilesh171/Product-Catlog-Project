/**
 * @file filterService.js
 * @description Pure Business Logic Service for Filtering, Sorting, and Pagination
 */

import { ValidationService, DEFAULT_PAGE_SIZE, DEFAULT_SORT } from './validationService.js';

export class FilterService {
  /**
   * Filter products based on active filter criteria using strict AND semantics
   * @param {Array<Object>} products
   * @param {Object} filters
   * @param {string|null} [filters.category]
   * @param {number|null} [filters.minPrice]
   * @param {number|null} [filters.maxPrice]
   * @param {number|null} [filters.minRating]
   * @param {string} [filters.search]
   * @returns {Array<Object>} Filtered products array (new copy)
   */
  static filterProducts(products = [], filters = {}) {
    if (!Array.isArray(products)) return [];

    const { category, minPrice, maxPrice, minRating, search } = filters;

    // Fast-path return empty if minPrice is strictly greater than maxPrice
    if (
      minPrice !== null &&
      minPrice !== undefined &&
      maxPrice !== null &&
      maxPrice !== undefined &&
      Number(minPrice) > Number(maxPrice)
    ) {
      return [];
    }

    const searchLower = search ? String(search).trim().toLowerCase() : '';
    const categoryLower = category && category !== 'all' ? String(category).trim().toLowerCase() : null;
    const minPriceNum = minPrice !== null && minPrice !== undefined && minPrice !== '' ? Number(minPrice) : null;
    const maxPriceNum = maxPrice !== null && maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : null;
    const minRatingNum = minRating !== null && minRating !== undefined && minRating !== '' ? Number(minRating) : null;

    return products.filter(product => {
      if (!product || typeof product !== 'object' || !product.id) return false;

      // 1. Category Filter (exact case-insensitive match)
      if (categoryLower) {
        const prodCat = String(product.category || '').toLowerCase();
        if (prodCat !== categoryLower) {
          return false;
        }
      }

      // 2. Minimum Price Filter (inclusive: price >= minPrice)
      if (minPriceNum !== null) {
        if (typeof product.price !== 'number' || product.price < minPriceNum) {
          return false;
        }
      }

      // 3. Maximum Price Filter (inclusive: price <= maxPrice)
      if (maxPriceNum !== null) {
        if (typeof product.price !== 'number' || product.price > maxPriceNum) {
          return false;
        }
      }

      // 4. Minimum Rating Filter (inclusive: rating >= minRating)
      if (minRatingNum !== null) {
        if (typeof product.rating !== 'number' || product.rating < minRatingNum) {
          return false;
        }
      }

      // 5. Search Text Filter (matches title, brand, description, tags)
      if (searchLower) {
        const title = String(product.title || '').toLowerCase();
        const brand = String(product.specs?.brand || '').toLowerCase();
        const desc = String(product.description || '').toLowerCase();
        const tags = Array.isArray(product.tags) ? product.tags.join(' ').toLowerCase() : '';

        const matches =
          title.includes(searchLower) ||
          brand.includes(searchLower) ||
          desc.includes(searchLower) ||
          tags.includes(searchLower);

        if (!matches) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort products deterministically based on sort option
   * @param {Array<Object>} products
   * @param {string} [sortOption='relevance']
   * @returns {Array<Object>} Sorted products array (new copy)
   */
  static sortProducts(products = [], sortOption = DEFAULT_SORT) {
    if (!Array.isArray(products)) return [];

    const copy = [...products];

    return copy.sort((a, b) => {
      const idA = String(a.id || '');
      const idB = String(b.id || '');

      switch (sortOption) {
        case 'price-asc': {
          const diff = (a.price ?? 0) - (b.price ?? 0);
          return diff !== 0 ? diff : idA.localeCompare(idB);
        }
        case 'price-desc': {
          const diff = (b.price ?? 0) - (a.price ?? 0);
          return diff !== 0 ? diff : idA.localeCompare(idB);
        }
        case 'rating-desc': {
          const diff = (b.rating ?? 0) - (a.rating ?? 0);
          if (diff !== 0) return diff;
          // Secondary sort: reviewCount desc
          const reviewDiff = (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
          return reviewDiff !== 0 ? reviewDiff : idA.localeCompare(idB);
        }
        case 'rating-asc': {
          const diff = (a.rating ?? 0) - (b.rating ?? 0);
          if (diff !== 0) return diff;
          const reviewDiff = (a.reviewCount ?? 0) - (b.reviewCount ?? 0);
          return reviewDiff !== 0 ? reviewDiff : idA.localeCompare(idB);
        }
        case 'name-asc': {
          const nameA = String(a.title || '');
          const nameB = String(b.title || '');
          const cmp = nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
          return cmp !== 0 ? cmp : idA.localeCompare(idB);
        }
        case 'name-desc': {
          const nameA = String(a.title || '');
          const nameB = String(b.title || '');
          const cmp = nameB.localeCompare(nameA, undefined, { sensitivity: 'base' });
          return cmp !== 0 ? cmp : idA.localeCompare(idB);
        }
        case 'relevance':
        default: {
          // Default relevance: Featured items/rating/id
          const scoreA = (a.badge ? 10 : 0) + (a.rating || 0);
          const scoreB = (b.badge ? 10 : 0) + (b.rating || 0);
          const diff = scoreB - scoreA;
          return diff !== 0 ? diff : idA.localeCompare(idB);
        }
      }
    });
  }

  /**
   * Compute pagination metadata and clamp current page safely
   * @param {number} totalItems
   * @param {number} currentPage
   * @param {number} pageSize
   * @returns {Object}
   */
  static calculatePagination(totalItems = 0, currentPage = 1, pageSize = DEFAULT_PAGE_SIZE) {
    const validTotalItems = Math.max(0, parseInt(totalItems, 10) || 0);
    const validPageSize = Math.max(1, parseInt(pageSize, 10) || DEFAULT_PAGE_SIZE);
    const totalPages = Math.max(1, Math.ceil(validTotalItems / validPageSize));

    // Clamp current page between 1 and totalPages
    const rawPage = parseInt(currentPage, 10) || 1;
    const validPage = Math.min(Math.max(1, rawPage), totalPages);

    const startIndex = (validPage - 1) * validPageSize;
    const endIndex = Math.min(startIndex + validPageSize, validTotalItems);

    const startItem = validTotalItems === 0 ? 0 : startIndex + 1;
    const endItem = endIndex;

    const hasPrev = validPage > 1;
    const hasNext = validPage < totalPages;

    // Generate smart page numbers list with ellipsis
    const pageNumbers = FilterService.generatePageRange(validPage, totalPages);

    return {
      totalItems: validTotalItems,
      totalPages,
      currentPage: validPage,
      pageSize: validPageSize,
      startIndex,
      endIndex,
      startItem,
      endItem,
      hasPrev,
      hasNext,
      pageNumbers,
    };
  }

  /**
   * Generate pagination items with ellipsis (e.g., [1, 2, 3, '...', 10])
   * @param {number} current
   * @param {number} total
   * @returns {Array<number|string>}
   */
  static generatePageRange(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  /**
   * Slice products for current page
   * @param {Array<Object>} products
   * @param {number} currentPage
   * @param {number} pageSize
   * @returns {Array<Object>}
   */
  static paginateProducts(products = [], currentPage = 1, pageSize = DEFAULT_PAGE_SIZE) {
    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }
    const pagination = FilterService.calculatePagination(products.length, currentPage, pageSize);
    return products.slice(pagination.startIndex, pagination.endIndex);
  }

  /**
   * Compute catalog categories and statistics
   * @param {Array<Object>} products
   * @returns {Object}
   */
  static computeCatalogStats(products = []) {
    if (!Array.isArray(products) || products.length === 0) {
      return {
        totalProducts: 0,
        categories: [],
        priceMin: 0,
        priceMax: 0,
      };
    }

    const categoryMap = new Map();
    let priceMin = Infinity;
    let priceMax = -Infinity;

    products.forEach(product => {
      if (!product) return;
      const cat = product.category || 'Uncategorized';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);

      if (typeof product.price === 'number') {
        if (product.price < priceMin) priceMin = product.price;
        if (product.price > priceMax) priceMax = product.price;
      }
    });

    const categories = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      totalProducts: products.length,
      categories,
      priceMin: priceMin === Infinity ? 0 : priceMin,
      priceMax: priceMax === -Infinity ? 0 : priceMax,
    };
  }

  /**
   * Master processing pipeline: RAW PRODUCTS -> VALIDATE -> FILTER -> SORT -> PAGINATE
   * @param {Array<Object>} rawProducts
   * @param {Object} state
   * @returns {Object} Complete result payload
   */
  static processCatalog(rawProducts = [], state = {}) {
    const validation = ValidationService.validateFilters(state);
    const sanitizedState = ValidationService.sanitizeFilterState(state);

    if (!validation.isValid) {
      return {
        products: [],
        filteredTotal: 0,
        catalogTotal: rawProducts.length,
        pagination: FilterService.calculatePagination(0, 1, sanitizedState.pageSize),
        validation,
        state: sanitizedState,
      };
    }

    // Step 1: Filter
    const filtered = FilterService.filterProducts(rawProducts, sanitizedState);

    // Step 2: Sort
    const sorted = FilterService.sortProducts(filtered, sanitizedState.sort);

    // Step 3: Calculate Pagination & Paginate
    const pagination = FilterService.calculatePagination(sorted.length, sanitizedState.page, sanitizedState.pageSize);
    const paginatedProducts = sorted.slice(pagination.startIndex, pagination.endIndex);

    return {
      products: paginatedProducts,
      filteredTotal: sorted.length,
      catalogTotal: rawProducts.length,
      pagination,
      validation,
      state: {
        ...sanitizedState,
        page: pagination.currentPage, // Ensure active state reflects validated page
      },
    };
  }
}
