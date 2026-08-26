/**
 * @file validationService.js
 * @description Input Validation and Filter Constraints Service
 */

export const ALLOWED_SORT_OPTIONS = [
  'relevance',
  'price-asc',
  'price-desc',
  'rating-desc',
  'rating-asc',
  'name-asc',
  'name-desc',
];

export const ALLOWED_PAGE_SIZES = [6, 12, 24, 48];

export const DEFAULT_PAGE_SIZE = 12;
export const DEFAULT_SORT = 'relevance';

export class ValidationService {
  /**
   * Validate full filter state and return an object with isValid and errors array
   * @param {Object} state
   * @returns {{ isValid: boolean, errors: string[], fieldErrors: Record<string, string> }}
   */
  static validateFilters(state = {}) {
    const errors = [];
    const fieldErrors = {};

    // Validate minPrice
    if (state.minPrice !== null && state.minPrice !== undefined && state.minPrice !== '') {
      const minNum = Number(state.minPrice);
      if (Number.isNaN(minNum)) {
        fieldErrors.minPrice = 'Minimum price must be a valid number.';
        errors.push(fieldErrors.minPrice);
      } else if (minNum < 0) {
        fieldErrors.minPrice = 'Minimum price cannot be negative.';
        errors.push(fieldErrors.minPrice);
      }
    }

    // Validate maxPrice
    if (state.maxPrice !== null && state.maxPrice !== undefined && state.maxPrice !== '') {
      const maxNum = Number(state.maxPrice);
      if (Number.isNaN(maxNum)) {
        fieldErrors.maxPrice = 'Maximum price must be a valid number.';
        errors.push(fieldErrors.maxPrice);
      } else if (maxNum < 0) {
        fieldErrors.maxPrice = 'Maximum price cannot be negative.';
        errors.push(fieldErrors.maxPrice);
      }
    }

    // Validate price range (minPrice <= maxPrice)
    if (!fieldErrors.minPrice && !fieldErrors.maxPrice) {
      const hasMin = state.minPrice !== null && state.minPrice !== undefined && state.minPrice !== '';
      const hasMax = state.maxPrice !== null && state.maxPrice !== undefined && state.maxPrice !== '';
      if (hasMin && hasMax) {
        const minNum = Number(state.minPrice);
        const maxNum = Number(state.maxPrice);
        if (minNum > maxNum) {
          fieldErrors.priceRange = `Minimum price (₹${minNum}) cannot exceed maximum price (₹${maxNum}).`;
          errors.push(fieldErrors.priceRange);
        }
      }
    }

    // Validate minRating
    if (state.minRating !== null && state.minRating !== undefined && state.minRating !== '') {
      const ratingNum = Number(state.minRating);
      if (Number.isNaN(ratingNum)) {
        fieldErrors.minRating = 'Minimum rating must be a valid number.';
        errors.push(fieldErrors.minRating);
      } else if (ratingNum < 0 || ratingNum > 5) {
        fieldErrors.minRating = 'Rating filter must be between 0 and 5.';
        errors.push(fieldErrors.minRating);
      }
    }

    // Validate sort option
    if (state.sort && !ALLOWED_SORT_OPTIONS.includes(state.sort)) {
      fieldErrors.sort = `Sort option '${state.sort}' is not supported.`;
      errors.push(fieldErrors.sort);
    }

    // Validate page
    if (state.page !== null && state.page !== undefined && state.page !== '') {
      const pageNum = Number(state.page);
      if (!Number.isInteger(pageNum) || pageNum < 1) {
        fieldErrors.page = 'Page must be an integer greater than or equal to 1.';
        errors.push(fieldErrors.page);
      }
    }

    // Validate pageSize
    if (state.pageSize !== null && state.pageSize !== undefined && state.pageSize !== '') {
      const sizeNum = Number(state.pageSize);
      if (!ALLOWED_PAGE_SIZES.includes(sizeNum)) {
        fieldErrors.pageSize = `Page size must be one of: ${ALLOWED_PAGE_SIZES.join(', ')}.`;
        errors.push(fieldErrors.pageSize);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      fieldErrors,
    };
  }

  /**
   * Sanitizes filter parameters into safe typed values
   * @param {Object} rawParams
   * @returns {Object}
   */
  static sanitizeFilterState(rawParams = {}) {
    const category = typeof rawParams.category === 'string' && rawParams.category.trim() !== '' && rawParams.category !== 'all'
      ? rawParams.category.trim()
      : null;

    let minPrice = null;
    if (rawParams.minPrice !== null && rawParams.minPrice !== undefined && rawParams.minPrice !== '') {
      const n = Number(rawParams.minPrice);
      if (!Number.isNaN(n) && n >= 0) minPrice = Math.round(n * 100) / 100;
    }

    let maxPrice = null;
    if (rawParams.maxPrice !== null && rawParams.maxPrice !== undefined && rawParams.maxPrice !== '') {
      const n = Number(rawParams.maxPrice);
      if (!Number.isNaN(n) && n >= 0) maxPrice = Math.round(n * 100) / 100;
    }

    let minRating = null;
    if (rawParams.minRating !== null && rawParams.minRating !== undefined && rawParams.minRating !== '') {
      const n = Number(rawParams.minRating);
      if (!Number.isNaN(n) && n >= 0 && n <= 5) minRating = n;
    }

    const sort = ALLOWED_SORT_OPTIONS.includes(rawParams.sort)
      ? rawParams.sort
      : DEFAULT_SORT;

    let page = 1;
    if (rawParams.page !== null && rawParams.page !== undefined && rawParams.page !== '') {
      const p = parseInt(rawParams.page, 10);
      if (!Number.isNaN(p) && p >= 1) page = p;
    }

    let pageSize = DEFAULT_PAGE_SIZE;
    if (rawParams.pageSize !== null && rawParams.pageSize !== undefined && rawParams.pageSize !== '') {
      const s = parseInt(rawParams.pageSize, 10);
      if (ALLOWED_PAGE_SIZES.includes(s)) pageSize = s;
    }

    const search = typeof rawParams.search === 'string' ? rawParams.search.trim() : '';

    return {
      category,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page,
      pageSize,
      search,
    };
  }
}
