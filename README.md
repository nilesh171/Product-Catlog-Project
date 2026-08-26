# AuraCatalog — Modern E-Commerce Catalog & Filter Engine

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-10b981?style=for-the-badge&logo=githubpages&logoColor=white)](https://nilesh171.github.io/Product-Catlog-Project/)
[![Test Suite](https://img.shields.io/badge/Tests-52%2F52%20Passed%20(100%25)-6366f1?style=for-the-badge&logo=checkmarx&logoColor=white)](https://nilesh171.github.io/Product-Catlog-Project/tests/index.html)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20Modular%20ES6-06b6d4?style=for-the-badge&logo=codefactor&logoColor=white)](src/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-f59e0b?style=for-the-badge&logo=w3c&logoColor=white)](index.html)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20External%20Deps-8b5cf6?style=for-the-badge&logo=javascript&logoColor=white)](package.json)

<p align="center">
  <strong>A high-performance, responsive e-commerce product catalog featuring multi-dimensional AND filtering, deterministic sorting, resilient pagination math, bidirectional URL query state synchronization, and full keyboard accessibility.</strong>
</p>

### 🌐 **[Explore the Live Deployment](https://nilesh171.github.io/Product-Catlog-Project/)**

[✨ Live Application](https://nilesh171.github.io/Product-Catlog-Project/) • [🧪 Interactive Test Suite](https://nilesh171.github.io/Product-Catlog-Project/tests/index.html) • [🛠️ Architecture](#system-architecture) • [🚀 Quickstart](#quickstart--running-locally)

</div>

---

## ⚡ Key Highlights

* **Multi-Dimensional AND Filtering**: Filter simultaneously across Categories, Price Ranges (₹ INR), Minimum Ratings, and Search queries with zero data drop or state corruption.
* **Deterministic Sorting Engine**: 7 sorting strategies with stable secondary and tertiary tie-breakers (price, rating, review count, product ID) to prevent layout shifts.
* **Resilient Pagination Math**: Automatic page-clamping to prevent blank screens when filters reduce total matching results.
* **Bidirectional URL State Synchronization**: Filter parameters automatically mirror to `window.location.search`. Filtered views are bookmarkable, shareable, and fully compatible with browser Back/Forward (`popstate`) navigation.
* **Interactive Modal Details**: Clicking any product card opens a dedicated modal with product imagery, key feature highlights, stock indicators, and full technical specifications.
* **Zero External Runtime Dependencies**: Built entirely with pure ES6+ JavaScript modules, semantic HTML5, and CSS custom property design tokens.

---

## 🛠️ System Architecture

The application follows **Clean Architecture** principles, maintaining strict separation between business logic, reactive state management, and the presentation layer:

```
[ User Interaction / URL Query ]
               │
               ▼
   ┌───────────────────────┐
   │     StateService      │  ◄── Single Source of Truth (Observable Store)
   └───────────┬───────────┘
               │ Dispatches State Update
               ▼
   ┌───────────────────────┐
   │     FilterService     │  ◄── Pure Business Logic Engine (Zero Side-Effects)
   │  - Validate Bounds    │
   │  - Apply AND Filters  │
   │  - Stable Sorting     │
   │  - Safe Pagination    │
   └───────────┬───────────┘
               │ View Models
               ▼
   ┌───────────────────────┐
   │     UI Components     │  ◄── Isolated Presentation Layer (Vanilla DOM)
   │  - FilterSidebar      │
   │  - ProductGrid / Card │
   │  - ActiveFilters      │
   │  - QuickViewModal     │
   └───────────────────────┘
```

---

## 📊 Requirement Traceability Matrix

| Requirement | Implementation Module | Source File | Test Suite | Status |
|---|---|---|---|---|
| **Category Filtering** | `FilterService` | [`filterService.js`](file:///src/services/filterService.js) | Unit & Integration | ✅ Passed |
| **Price Range (₹ INR)** | `FilterService` & `ValidationService` | [`validationService.js`](file:///src/services/validationService.js) | Boundary & Unit | ✅ Passed |
| **Minimum Rating** | `FilterService` | [`filterService.js`](file:///src/services/filterService.js) | Unit Suite | ✅ Passed |
| **Combined AND Logic** | `FilterService` | [`filterService.js`](file:///src/services/filterService.js) | Integration Flow | ✅ Passed |
| **Deterministic Sorting** | `FilterService` (7 algorithms) | [`filterService.js`](file:///src/services/filterService.js) | Sort Unit Suite | ✅ Passed |
| **Safe Pagination** | `FilterService` & `Pagination` | [`filterService.js`](file:///src/services/filterService.js) | Pagination Math | ✅ Passed |
| **Filter Reset & Dismissal** | `StateService` & `ActiveFilters` | [`stateService.js`](file:///src/services/stateService.js) | State Sync Suite | ✅ Passed |
| **Live Result Count** | `SortBar` & `App` | [`SortBar.js`](file:///src/ui/components/SortBar.js) | Pipeline Suite | ✅ Passed |
| **URL State Synchronization** | `StateService` | [`stateService.js`](file:///src/services/stateService.js) | Popstate & Query | ✅ Passed |
| **Accessibility (WCAG 2.1 AA)**| `QuickViewModal` & `tokens.css` | [`components.css`](file:///src/styles/components.css) | Keyboard & a11y | ✅ Passed |

---

## 📁 Project Directory Structure

```
Product_Catlog_Project/
├── index.html                     # Application entry point
├── server.js                      # Zero-dependency local HTTP server
├── verify_live.js                 # Automated live integration verification
├── vercel.json                    # Vercel deployment configuration
├── netlify.toml                   # Netlify deployment configuration
├── package.json                   # Project metadata and test scripts
│
├── src/
│   ├── data/
│   │   ├── products.json          # 36 catalog records with images & INR pricing
│   │   └── productsData.js        # Bundled static fallback dataset for offline/CDN resilience
│   ├── models/
│   │   └── Product.js             # Product domain model entity & schema validator
│   ├── services/
│   │   ├── filterService.js       # Pure functional filtering, sorting, pagination
│   │   ├── validationService.js   # Input validation and boundary sanitization
│   │   ├── stateService.js        # Observable state store and URL query serializer
│   │   └── productRepository.js   # Async data fetching and caching layer
│   ├── styles/
│   │   ├── tokens.css             # Design tokens & color palettes (Dark / Light)
│   │   ├── base.css               # CSS reset and base typography
│   │   ├── components.css         # Component-specific styles & responsive drawer
│   │   └── animations.css         # Micro-animations and transitions
│   ├── ui/
│   │   ├── App.js                 # Root application orchestrator
│   │   └── components/            # UI Components (Header, Grid, Card, Modal, etc.)
│   └── utils/
│       ├── domUtils.js            # DOM helpers, sanitizers, and focus management
│       └── formatters.js          # Currency (₹ INR), numbers, and star ratings
│
└── tests/
    ├── test-framework.js          # Zero-dependency test assertion framework
    ├── run-all-tests.js           # CLI test runner
    ├── index.html                 # In-browser visual test dashboard
    ├── unit/                      # Unit tests (filtering, sorting, pagination, validation)
    └── integration/               # Integration tests (state sync, full pipeline, edge cases)
```

---

## 🚀 Quickstart & Running Locally

### 1. Start the Local Server
```bash
node server.js
```
*On Windows systems without Node in PATH, use the included wrapper:*
```bash
.\node.cmd server.js
```

Open your browser at **`http://localhost:3000`**.

---

### 2. Run the Automated Test Suite (52 Tests)
```bash
node tests/run-all-tests.js
```

Or open **`http://localhost:3000/tests/index.html`** in your browser to view the interactive visual test dashboard.

---

### 3. Run Live Health Verification
```bash
node verify_live.js
```

---

## 🎯 Challenge Query Verification

To test the core specification workflow:

1. **Select Category**: `Audio`
2. **Set Price Range**: `₹3,000` to `₹20,000`
3. **Set Minimum Rating**: `4.0+ Stars`
4. **Sort By**: `Rating: High to Low`

### Results:
* Exactly **6 matching items** are returned, all strictly satisfying every criterion.
* Products are sorted deterministically by user rating, with review count applied as a secondary tie-breaker.
* The URL synchronizes to:
  ```
  ?category=Audio&minPrice=3000&maxPrice=20000&minRating=4&sort=rating-desc
  ```
* Refreshing or using browser Back/Forward retains the exact filtered catalog state.

---

## 🛡️ Edge Cases Handled

| Scenario | Potential Risk | Built-in Resolution |
|---|---|---|
| **Inverted Price Range** | User sets Min ₹25,000 > Max ₹5,000 | `ValidationService` catches condition and displays descriptive alert banner. |
| **Filter Reduction Beyond Page** | User is on Page 4, then applies a filter with 3 results | `calculatePagination` auto-clamps to Page 1, avoiding blank screens. |
| **XSS Payloads in Search** | Malicious script injected in search or URL query | Sanitized via `escapeHTML` and strict parameter sanitization. |
| **Duplicate Sorting Values** | Items sharing identical price or rating | Secondary and tertiary ID tie-breakers ensure 100% stable ordering. |
| **Rapid Filter Changes** | Race conditions during fast typing | Input handlers are debounced (250–400ms) with synchronous state serialization. |

---

## 🌐 Live Deployments & Hosting

| Service | Live Link | Description |
|---|---|---|
| 🚀 **GitHub Pages** | **[nilesh171.github.io/Product-Catlog-Project](https://nilesh171.github.io/Product-Catlog-Project/)** | Production live deployment hosted directly on GitHub Pages |
| 🧪 **Test Suite** | **[Live Browser Test Runner](https://nilesh171.github.io/Product-Catlog-Project/tests/index.html)** | In-browser visual test suite with real-time execution metrics |
| ⚡ **Vercel** | Pre-configured with [`vercel.json`](file:///vercel.json) | 1-click zero-config deployment |
| 📦 **Netlify** | Pre-configured with [`netlify.toml`](file:///netlify.toml) | Drag-and-drop or continuous Git deploy |

---

## 📜 License

MIT License — free for educational, evaluation, and commercial use.
