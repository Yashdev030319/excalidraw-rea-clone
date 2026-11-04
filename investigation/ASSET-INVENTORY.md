# Asset Inventory: Fonts, Palettes, Icons & Schemas

This document catalogs the design assets, typography, color palettes, vector iconography, and file schemas required for the whiteboard application.

---

## 1. Typography & Font Specifications

Excalidraw achieves its casual, sketch-like note aesthetic through tailored typography:
- **Primary Hand-Drawn Font:** Virgil / Caveat / Comic / Handlee style fallback stack:
  ```css
  font-family: "Virgil", "Caveat", "Comic Sans MS", cursive, sans-serif;
  ```
- **Monospace Code Font:** Cascadia / Fira Code fallback stack:
  ```css
  font-family: "Cascadia", "Fira Code", monospace;
  ```
- **UI System Font:**
  ```css
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  ```

---

## 2. Color Palette System

The palette uses curated, high-contrast, harmonious colors derived from Open Color:

### 2.1 Stroke Colors
| Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| Black / Charcoal | `#1e1e1e` | Default stroke in light mode, high contrast |
| White | `#ffffff` | Default stroke in dark mode |
| Red | `#e03131` | Highlighting, critical alerts |
| Green | `#2f9e44` | Success, approvals, nature |
| Blue | `#1971c2` | Primary connectors, structures |
| Orange | `#f08c00` | Warm callouts, warnings |
| Violet | `#9c36b5` | Accents, labels |
| Teal | `#099268` | Subtle markers |
| Yellow | `#f59f00` | Highlights |

### 2.2 Background / Fill Colors
| Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| Transparent | `transparent` | Default unfilled shapes |
| Pastel Red | `#ffc9c9` | Soft red fill |
| Pastel Green | `#b2f2bb` | Soft green fill |
| Pastel Blue | `#a5d8ff` | Soft blue fill |
| Pastel Yellow | `#ffec99` | Soft yellow fill |
| Pastel Orange | `#ffd8a8` | Soft orange fill |
| Pastel Violet | `#eebefa` | Soft purple fill |
| Pastel Gray | `#e9ecef` | Neutral gray fill |

### 2.3 UI Chrome Theme Variables
| Element | Light Mode | Dark Mode |
| :--- | :--- | :--- |
| App Background | `#f8f9fa` | `#121212` |
| Canvas Background | `#ffffff` | `#18181b` |
| Toolbar Background | `#ffffff` | `#27272a` |
| Text Primary | `#212529` | `#f4f4f5` |
| Text Muted | `#6c757d` | `#a1a1aa` |
| Border Color | `#dee2e6` | `#3f3f46` |
| Active Tool Highlight | `#e0e7ff` (text `#4338ca`) | `#312e81` (text `#c7d2fe`) |

---

## 3. Vector Iconography (Clean SVG Paths)

All toolbar buttons and UI controls use lightweight, inline SVG icons without external dependencies:

```javascript
export const ICONS = {
  select: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3l7 18 3-7 7-3L3 3z" />
    </svg>
  ),
  rectangle: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  diamond: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12,2 22,12 12,22 2,12" />
    </svg>
  ),
  circle: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="19" x2="19" y2="5" />
      <polyline points="9 5 19 5 19 15" />
    </svg>
  ),
  line: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="20" x2="20" y2="4" />
    </svg>
  ),
  freehand: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
    </svg>
  ),
  text: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  eraser: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13l-5 5L3 8l5-5 10 10z" />
      <line x1="18" y1="20" x2="6" y2="20" />
    </svg>
  ),
  undo: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
    </svg>
  ),
  redo: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  )
};
```

---

## 4. File Schema Specifications

### 4.1 JSON Drawing File (`.excalidraw` Compatible)
```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "http://localhost:3000",
  "elements": [
    {
      "id": "elem_1730000001",
      "type": "rectangle",
      "x": 120,
      "y": 80,
      "width": 240,
      "height": 140,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "#a5d8ff",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "opacity": 100
    },
    {
      "id": "elem_1730000002",
      "type": "text",
      "x": 140,
      "y": 120,
      "width": 120,
      "height": 30,
      "text": "Hello Whiteboard",
      "fontSize": 20,
      "strokeColor": "#1e1e1e"
    }
  ],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "zoom": 1,
    "scrollX": 0,
    "scrollY": 0
  }
}
```

### 4.2 SVG Vector Export Format
SVG export wraps elements inside `<svg xmlns="http://www.w3.org/2000/svg">` with calculated `viewBox="minX minY width height"`:
- `<rect>` for rectangles
- `<polygon>` for diamonds
- `<ellipse>` for circles
- `<path>` for freehand strokes, arrows, and lines
- `<text>` for textual labels with appropriate font styles

