# Rollback Checkpoint — Visual Design Baseline
**Date:** 2026-05-06  
**Purpose:** Full state snapshot before visual unification refactoring

---

## 🎯 Current Application Structure

### Core Files
- **App.jsx** — Main router with 9 routes (Home, ForgedChainConfigurator, RollerConfigurator, RFQCart, ElevatorBuckets, Catalog, TableTopChains, etc.)
- **pages/Home.jsx** — Main catalog hub (1968 lines) with TypeGrid, ProductList, ProductCard, FilterBar, ProductModal, BrandGrid
- **index.css** — Global design tokens (colors: navy #003c5b, gold #C9A84C, green #16a34a, red #dc2626)
- **tailwind.config.js** — Tailwind theme extending CSS variables

### Key Pages (Decentralized Styles)
1. **pages/Home** — Navy/gold theme, Uniking K logo in footer, consistent ProductCard design
2. **pages/TableTopChains** — Large banner design, different text styling
3. **pages/IntraloxCatalog** — Aligned with home page style
4. **pages/ElevatorBuckets** — Material configs, SVG modals
5. **pages/ForgedChain** — Redirect to Home
6. **pages/RollerConfigurator** — Roller-specific layout
7. **components/WireMeshConfigurator** — Wire mesh belts UI
8. **components/fourB/FourBCatalog** — Red color scheme (4B Braime™ branding)
9. **components/sharpTop/SharpTopCatalog** — Sharp top chains
10. **components/intralox/IntraloxCatalog** — Modular belt configs

### Components (Mixed Styling)
- **ProductCard, ProductListRow** (Home.jsx) — Consistent cards
- **RFQCartView** — Main RFQ workflow (multi-step form)
- **ComparePanel** — Product comparison modal
- **FloatingRFQButton** — Floating RFQ indicator (bottom-right, only shows when cart has items)
- **SpecTable, BeltDataTable, SprocketTable** — Data tables in modals

### Branding Elements
- **Logo:** Uniking K logo only in Home footer (`https://media.base44.com/images/.../e48ee59d9_Unitingthestrongestlinks...`)
- **Missing:** Logo in product page headers, inconsistent navbar branding
- **Colors:** Navy (#003c5b), Gold (#C9A84C), Green (#16a34a), Red (#dc2626 — 4B specific)

### RFQ Cart Implementation
- **Storage:** localStorage key `"uniking_rfq_cart"`
- **FloatingButton:** Bottom-right, visible only with items, shows count badge
- **Variants:**
  - Home: Floating button + RFQCartView component
  - TableTopChains: Local RFQ storage, custom UI
  - Intralox: Brand-specific RFQ flow
  - FourB: Red-branded RFQ
  - ElevatorBuckets: Modal-based RFQ config

### Back Buttons
- **Home:** Breadcrumb component with `onClick` handlers
- **TableTopChains:** Custom back button styling
- **IntraloxCatalog:** Brand-specific back button
- **FourB:** Different back button style
- **ElevatorBuckets:** Modal-based, no explicit back button

---

## 📋 Visual Inconsistencies (Before Refactoring)

| Element | Home | TableTop | Intralox | FourB | ElevBuckets |
|---------|------|----------|----------|-------|-------------|
| **Logo** | K (footer only) | Missing | ? | Missing | Missing |
| **Header Colors** | Navy/Gold | Custom yellow | Blue? | Red | Yellow |
| **Back Button** | Breadcrumb | Custom | Brand button | Different | Modal only |
| **RFQ Button** | Floating | Local storage | Brand UI | Red theme | Modal config |
| **Product Card Style** | Consistent | Large banner | Different grid | Red badges | Material cards |
| **Text Colors** | Navy/gray | Yellow/black | ? | Red accents | Mixed |

---

## 🔧 Key Configuration Values

### Colors (from index.css)
```css
--primary: 200 100% 18%;  /* Navy #003c5b */
--accent: 243 75% 96%;    /* Light blue */
--destructive: 0 84.2% 60.2%;  /* Red */
--chart-5: 27 87% 67%;    /* Gold #C9A84C */
```

### Tailwind Extensions
- `bg-primary`, `text-primary` → Navy theme
- `text-muted` → #64748b (gray)
- `border: 1px solid #e2e8f0` — Standard border color
- Custom utils: `.uk-card`, `.uk-btn-rfq`, `.uk-btn-primary`, `.uk-tab-btn`

### Font System
- `--font-inter`: 'Inter', sans-serif (primary)
- `--font-playfair`: 'Playfair Display', serif (accent)

---

## 📁 Complete File List (Key Files to Preserve)

**Pages:**
- pages/Home.jsx (main)
- pages/TableTopChains.jsx
- pages/ElevatorBuckets.jsx
- pages/RollerConfigurator.jsx
- pages/ForgedChain.jsx (redirect)
- pages/ForgedChainConfigurator.jsx
- pages/Catalog.jsx
- pages/RFQCart.jsx

**Components — Core UI:**
- components/RFQCartView.jsx
- components/ComparePanel.jsx
- components/HomeGlobalSearch.jsx
- components/WireMeshConfigurator.jsx
- components/ProtectedRoute.jsx

**Components — Product Categories:**
- components/sharpTop/SharpTopCatalog.jsx
- components/intralox/IntraloxCatalog.jsx
- components/fourB/FourBCatalog.jsx
- components/tableTopChain/TableTopChainCatalog.jsx
- components/chains/ChainCatalog.jsx
- components/elevatorBuckets/ElevBucketsView.jsx

**Components — Utilities:**
- components/catalog/TypeGrid.jsx
- components/chains/WeldedSeriesView.jsx
- components/ui/* (shadcn/ui components)

**Config:**
- index.css (global styles)
- tailwind.config.js (theme)
- App.jsx (routing)

**Data/Libraries:**
- lib/chainCatalogData.js
- lib/fourBData.js
- lib/intraloxData.js
- lib/sharpTopData.js
- lib/tableTopChainData.js
- lib/chainNormalizedDictionary.js

---

## ✅ Known Working Features

1. **Product Discovery:**
   - TypeGrid home screen with category browsing
   - ProductCard + ProductListRow components
   - Global search (HomeGlobalSearch)
   - Filter bar with dynamic filtering

2. **RFQ Cart:**
   - localStorage-based cart persistence
   - FloatingRFQButton indicator
   - RFQCartView multi-step form
   - Email submission workflow

3. **Product Details:**
   - ProductModal with tabs (specs, belt data, sprockets, docs)
   - SpecTable, BeltDataTable, SprocketTable rendering
   - Tear sheet PDF generation
   - Related items (sprockets, pins, attachments)

4. **Category Browsing:**
   - Chain families (ANSI, Engineered, Welded, etc.)
   - Modular belts (Intralox, Movex, SystemPlast)
   - Elevator buckets with material configs
   - Table top chains with large banners
   - 4B electronics with red branding

---

## 🚀 Next Steps (When Ready)

Once approved, we will unify:
1. **Global Layout Component** — Consistent header/navbar with K logo
2. **Standardized RFQ Component** — Single RFQ button/cart UI across all pages
3. **Unified Back Button** — Consistent navigation component
4. **Product Card Standardization** — All categories use same card design
5. **Color Enforcement** — Remove hardcoded colors, use Tailwind tokens only
6. **Modal Consistency** — Unified product detail modal shell

---

**Saved:** 2026-05-06
**Status:** Ready for approval before changes