/**
 * @file productRepository.js
 * @description Data Access Layer with Dual-Strategy (Static Import + JSON Fetch) Resilience
 */

import { Product } from '../models/Product.js';
import { PRODUCTS_DATA } from '../data/productsData.js';

export class ProductRepository {
  /**
   * @param {Array<Object>} [staticData=null]
   */
  constructor(staticData = null) {
    this._staticData = staticData;
    this._cache = null;
  }

  /**
   * Fetch all products asynchronously with resilience and simulated network latency
   * @param {Object} [options]
   * @param {number} [options.delayMs=0] Simulated network latency
   * @param {boolean} [options.forceError=false] Simulate network error
   * @returns {Promise<Product[]>}
   */
  async fetchProducts({ delayMs = 0, forceError = false } = {}) {
    if (forceError) {
      throw new Error('Network error: Unable to load catalog products.');
    }

    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    if (this._cache) {
      return this._cache;
    }

    // Default to bundled productsData, with optional fetch overlay
    let rawData = this._staticData || PRODUCTS_DATA;

    if (!this._staticData && typeof window !== 'undefined' && window.fetch) {
      try {
        const res = await fetch('./src/data/products.json');
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            rawData = json;
          }
        }
      } catch {
        // Silently use bundled PRODUCTS_DATA on CDN/local fetch error
      }
    }

    const validatedProducts = (rawData || [])
      .map(item => {
        try {
          return new Product(item);
        } catch (err) {
          console.warn('Skipping malformed product item:', item, err.message);
          return null;
        }
      })
      .filter(Boolean);

    this._cache = validatedProducts;
    return this._cache;
  }

  /**
   * Get a single product by ID
   * @param {string} id
   * @returns {Promise<Product|null>}
   */
  async getProductById(id) {
    const products = await this.fetchProducts();
    return products.find(p => p.id === id) || null;
  }

  /**
   * Invalidate cache
   */
  clearCache() {
    this._cache = null;
  }
}
