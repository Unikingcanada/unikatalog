# Uniking Design System — Unified Visual Language

## 🎨 Color Palette

### Primary Colors
- **Navy (Primary):** `#003c5b` — Main brand color for headers, buttons, accents
- **Navy Mid:** `#1A3A5C` — Hover states, secondary elements
- **Navy Light:** `#2A5080` — Backgrounds, borders

### Accent Colors
- **Gold:** `#C9A84C` — Highlights, decorative elements
- **Gold Light:** `#e8c96d` — Light accents

### Status Colors
- **Green:** `#16a34a` — Success, added items, confirmation
- **Red:** `#dc2626` — Errors, warnings (use sparingly)
- **Orange:** `#c2410c` — Warnings, alerts
- **Blue:** `#2563eb` — Links, primary actions

### Neutral Colors
- **Background:** `#f8fafc` — Main page background
- **Card:** `#ffffff` — Card/modal backgrounds
- **Border:** `#e2e8f0` — Borders, dividers
- **Text:** `#0f172a` — Primary text
- **Text Mid:** `#1e293b` — Secondary text
- **Muted:** `#64748b` — Muted/disabled text
- **Slate:** `#334155` — Alternative neutral

---

## 📝 Typography System

### Font Family
- **Primary:** 'Inter', sans-serif (all text)
- **Accent:** 'Playfair Display', serif (not currently used, reserved for future)

### Text Styles

| Use Case | Size | Weight | Color | Example |
|----------|------|--------|-------|---------|
| **Page Title** | 22px | 800 | Text | "Modular Plastic Belting" |
| **Section Title** | 14px | 700 | Text | "SPECIFICATIONS" (uppercase) |
| **Card Title** | 13px | 800 | Text | "Series Name" in product cards |
| **Description** | 12px | 400 | Muted | Product category/subtitle |
| **Label** | 11px | 600 | Muted Light | "Belt Category", "Style" |
| **Small Text** | 10px | 400 | Muted | "Page reference", extra details |

### Key Rules
- **Always use 'Inter' font** for all text across all pages
- **Maintain consistent weight** for same use case (e.g., all card titles = 13px/800)
- **Use muted colors** for secondary/description text
- **Use navy for primary text** and headings
- **Section titles are uppercase** with increased letter-spacing

---

## 🎯 Component Standards

### RFQ Buttons
- **Small:** 10px font, 4px 10px padding, green when added, blue when pending
- **Medium:** 11px font, 6px 12px padding (default)
- **Large:** 13px font, 10px 20px padding
- **Colors:** Blue (`#2563eb`) → Green (`#16a34a`) on added

### Back Buttons
- **Style:** Light gray background (`#f1f5f9`), 12px font weight 600
- **Hover:** Border color changes to `#e2e8f0`
- **All pages must use consistent back button**

### Product Cards
- **Title:** 13px weight 800
- **Style/Subtitle:** 12px color muted
- **Description:** 11px color muted
- **Tags:** 10px background light gray, border light
- **Images:** Never remove from cards (preserve all product visuals)

### Modals
- **Header background:** Navy (`#003c5b`)
- **Header text:** White, 20px weight 800 for title
- **Body background:** White
- **Padding:** Standard 20px/24px

### Product Details Modals
- **Tabs:** 12px weight 700 text
- **Table headers:** Navy background, white text
- **Table rows:** Alternating #f8fafc/#fff
- **Labels:** 11px weight 600 muted

---

## 🏗️ Layout Standards

### Header/Navbar
- **Background:** Navy (`#003c5b`)
- **Logo:** White/inverted Uniking K logo
- **Height:** 56px
- **Padding:** Responsive clamp(16px, 4vw, 40px)

### Page Content
- **Max width:** 1280px centered
- **Horizontal padding:** clamp(12px, 4vw, 36px)
- **Vertical padding:** 20px
- **Background:** Light gray (`#f8fafc`)

### Footer
- **Background:** White
- **Border top:** 1px solid `#e2e8f0`
- **Text:** 11px muted
- **Always include:** "Uniking Canada · Final specifications must be confirmed before supply"

---

## ✅ Color Usage Guidelines

### DO USE
- **Navy** for primary text, headers, buttons
- **Muted/Slate** for descriptions and secondary information
- **Green** for success states and "added" indicators
- **Blue** for primary actions and links
- **Gold** as decorative accents only

### DON'T USE
- **Red** as a primary color (reserved for errors/warnings only)
- **Yellow** for text (conflicts with brand identity)
- **Bright/neon colors** outside the defined palette
- **Custom/hardcoded colors** — always use the palette above

---

## 🔄 Imports for All Components

```javascript
import { COLORS, TYPOGRAPHY, getTypography } from "@/lib/designSystem";
```

Then use like:
```javascript
style={{ ...TYPOGRAPHY.cardTitle }}  // Apply card title style
style={{ color: COLORS.navy, fontSize: 14 }} // Use color constants
```

---

## 🚀 Enforcement Checklist

Before publishing a component:
- [ ] All text uses 'Inter' font family
- [ ] Product/card titles are 13px weight 800
- [ ] Descriptions are 12px weight 400 muted color
- [ ] Labels are 11px weight 600
- [ ] Section titles are uppercase with letter-spacing
- [ ] All colors come from COLORS palette
- [ ] RFQ buttons match standard sizes
- [ ] Back buttons are consistent
- [ ] No images are removed from cards
- [ ] Navy/gold brand colors are preserved
- [ ] No custom inline color values (use COLORS)

---

**Last Updated:** 2026-05-06