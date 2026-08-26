/**
 * @file Product.js
 * @description Product Domain Model & Schema Validator
 */

export class Product {
  /**
   * @param {Object} data
   * @param {string} data.id
   * @param {string} data.title
   * @param {string} data.category
   * @param {number} data.price
   * @param {number} [data.originalPrice]
   * @param {number} data.rating
   * @param {number} data.reviewCount
   * @param {number} data.stock
   * @param {string|null} [data.badge]
   * @param {string} data.description
   * @param {Object} [data.specs]
   * @param {string[]} [data.tags]
   */
  constructor(data) {
    Product.validate(data);

    this.id = String(data.id);
    this.title = String(data.title).trim();
    this.category = String(data.category).trim();
    this.price = Number(data.price);
    this.originalPrice = data.originalPrice ? Number(data.originalPrice) : null;
    this.rating = Number(data.rating);
    this.reviewCount = Number(data.reviewCount || 0);
    this.stock = Number(data.stock || 0);
    this.badge = data.badge ? String(data.badge).trim() : null;
    this.image = data.image ? String(data.image).trim() : null;
    this.description = String(data.description || '').trim();
    this.highlights = Array.isArray(data.highlights) ? data.highlights.map(h => String(h).trim()) : [];
    this.specs = data.specs || {};
    this.tags = Array.isArray(data.tags) ? data.tags.map(t => String(t).toLowerCase()) : [];
  }

  /**
   * Validates raw product data
   * @param {Object} data
   */
  static validate(data) {
    if (!data || typeof data !== 'object') {
      throw new TypeError('Product data must be a non-null object');
    }
    if (!data.id || typeof data.id !== 'string') {
      throw new Error('Product must have a valid string id');
    }
    if (!data.title || typeof data.title !== 'string') {
      throw new Error('Product must have a valid title');
    }
    if (!data.category || typeof data.category !== 'string') {
      throw new Error('Product must have a valid category');
    }
    if (typeof data.price !== 'number' || Number.isNaN(data.price) || data.price < 0) {
      throw new Error(`Product [${data.id}] has an invalid price: ${data.price}`);
    }
    if (typeof data.rating !== 'number' || Number.isNaN(data.rating) || data.rating < 0 || data.rating > 5) {
      throw new Error(`Product [${data.id}] has an invalid rating: ${data.rating}`);
    }
  }

  /**
   * Check if the product has a discount
   * @returns {boolean}
   */
  get hasDiscount() {
    return Boolean(this.originalPrice && this.originalPrice > this.price);
  }

  /**
   * Calculates discount percentage
   * @returns {number}
   */
  get discountPercent() {
    if (!this.hasDiscount) return 0;
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }

  /**
   * Check if the product is in stock
   * @returns {boolean}
   */
  get inStock() {
    return this.stock > 0;
  }
}
