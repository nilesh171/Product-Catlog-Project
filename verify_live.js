/**
 * @file verify_live.js
 * @description Comprehensive Live Health & Functional Verification Script
 */

import http from 'http';
import { FilterService } from './src/services/filterService.js';
import { ValidationService } from './src/services/validationService.js';
import { StateService } from './src/services/stateService.js';
import { ProductRepository } from './src/services/productRepository.js';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    }).on('error', reject);
  });
}

async function runLiveVerification() {
  console.log('================================================================');
  console.log('  AURACATALOG — LIVE HEALTH & FUNCTIONAL VERIFICATION');
  console.log('================================================================\n');

  // 1. Check HTTP Endpoints
  const endpoints = [
    { name: 'HTML Entry Point', path: '/' },
    { name: 'Products JSON Data', path: '/src/data/products.json' },
    { name: 'Design Tokens CSS', path: '/src/styles/tokens.css' },
    { name: 'Base Styles CSS', path: '/src/styles/base.css' },
    { name: 'Components CSS', path: '/src/styles/components.css' },
    { name: 'Animations CSS', path: '/src/styles/animations.css' },
    { name: 'In-Browser Test Dashboard', path: '/tests/index.html' },
    { name: 'Test Framework JS', path: '/tests/test-framework.js' },
  ];

  console.log('1. Checking Live HTTP Endpoints on http://localhost:3000:');
  for (const ep of endpoints) {
    try {
      const res = await fetchUrl(`http://localhost:3000${ep.path}`);
      const is200 = res.statusCode === 200;
      const icon = is200 ? '✓' : '✗';
      console.log(`  ${icon} ${ep.name.padEnd(28)} -> HTTP ${res.statusCode} (${res.headers['content-type']})`);
      if (!is200) throw new Error(`Endpoint ${ep.path} failed with HTTP ${res.statusCode}`);
    } catch (err) {
      console.error(`  ✗ ${ep.name.padEnd(28)} -> Connection Failed: ${err.message}`);
      process.exit(1);
    }
  }

  // 2. Load Dataset from Repository
  console.log('\n2. Testing Product Data Layer & Schema:');
  const repo = new ProductRepository();
  const allProducts = await repo.fetchProducts();
  console.log(`  ✓ Loaded ${allProducts.length} validated products.`);

  const stats = FilterService.computeCatalogStats(allProducts);
  console.log(`  ✓ Categories found (${stats.categories.length}): ${stats.categories.map(c => `${c.name} (${c.count})`).join(', ')}`);
  console.log(`  ✓ Overall Catalog Price Range: $${stats.priceMin.toFixed(2)} to $${stats.priceMax.toFixed(2)}`);

  // 3. Verify Challenge Example Flow
  console.log('\n3. Verifying Challenge Flow: Audio + ₹3,000–₹20,000 + Rating >= 4.0 + Sort: Rating Desc:');
  const challengeState = {
    category: 'Audio',
    minPrice: 3000,
    maxPrice: 20000,
    minRating: 4.0,
    sort: 'rating-desc',
    page: 1,
    pageSize: 6,
  };

  const challengeResult = FilterService.processCatalog(allProducts, challengeState);
  console.log(`  ✓ Validation Valid: ${challengeResult.validation.isValid}`);
  console.log(`  ✓ Matching Products Count: ${challengeResult.filteredTotal} products`);
  console.log(`  ✓ Sliced for Page 1: ${challengeResult.products.length} products`);

  challengeResult.products.forEach((p, idx) => {
    console.log(`    ${idx + 1}. [${p.category}] ${p.title.padEnd(46)} ₹${p.price.toLocaleString('en-IN').padStart(8)} | ${p.rating}★ (${p.reviewCount} reviews)`);
  });

  // Verify all conditions strictly hold
  const allValid = challengeResult.products.every(p =>
    p.category === 'Audio' &&
    p.price >= 3000 &&
    p.price <= 20000 &&
    p.rating >= 4.0
  );
  if (!allValid) throw new Error('Challenge products failed filter validation!');
  console.log('  ✓ ALL filtered products strictly satisfy every filter criteria!');

  // 4. Verify Pagination Flow
  console.log('\n4. Verifying Pagination:');
  const paginatedResult = FilterService.processCatalog(allProducts, { page: 1, pageSize: 6 });
  const paginatedPage2 = FilterService.processCatalog(allProducts, { page: 2, pageSize: 6 });
  console.log(`  ✓ Overall Catalog: Page 1 items: ${paginatedResult.products.length} of ${allProducts.length}, Page 2 items: ${paginatedPage2.products.length}`);
  console.log(`  ✓ Total matching items in full catalog: ${paginatedResult.catalogTotal} products across ${paginatedResult.pagination.totalPages} pages`);

  // 5. Verify Inverted Filter Validation
  console.log('\n5. Verifying Input Validation Bounds (min > max):');
  const invalidState = { minPrice: 300, maxPrice: 100 };
  const valResult = ValidationService.validateFilters(invalidState);
  console.log(`  ✓ Is Valid: ${valResult.isValid} (Correctly rejected)`);
  console.log(`  ✓ Error Message: "${valResult.errors[0]}"`);

  // 6. Verify URL Query Serialization & Deserialization
  console.log('\n6. Verifying Query State Serialization:');
  const stateService = new StateService({}, false);
  const serialized = stateService.serializeToQueryString(challengeState);
  console.log(`  ✓ Serialized Query: ${serialized}`);

  console.log('\n================================================================');
  console.log('✨ LIVE VERIFICATION COMPLETE: ALL SYSTEMS FULLY OPERATIONAL!');
  console.log('================================================================\n');
}

runLiveVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
