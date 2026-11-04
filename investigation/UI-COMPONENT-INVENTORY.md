# UI Component Inventory: Excalidraw Reconstruction

This document outlines the component architecture, visual layout, state requirements, and interface specifications for the local Excalidraw-inspired whiteboard application.

---

## 1. Overall Component Hierarchy

```text
<WhiteboardApp>
├── <TopHeader>
│   ├── <MainMenuToggle />              (Hamburger button to open drawer)
│   ├── <MainMenuDrawer />              (Open, Save, Export, Cloud Drawings, Help)
│   ├── <DrawingToolbar />              (Primary tool selection pill)
│   │   ├── <ToolButton tool="select" />
│   │   ├── <ToolButton tool="rectangle" />
│   │   ├── <ToolButton tool="diamond" />
│   │   ├── <ToolButton tool="circle" />
│   │   ├── <ToolButton tool="arrow" />
│   │   ├── <ToolButton tool="line" />
│   │   ├── <ToolButton tool="freehand" />
│   │   ├── <ToolButton tool="text" />
│   │   └── <ToolButton tool="eraser" />
│   └── <ThemeToggle />                 (Light / Dark mode toggle)
│
├── <PropertiesPanel />                 (Contextual sidebar for active/selected styles)
│   ├── <ColorPickerSection label="Stroke" />
│   ├── <ColorPickerSection label="Background" />
│   ├── <StrokeWidthPicker />
│   ├── <StrokeStylePicker />
│   ├── <RoughnessPicker />
│   ├── <OpacitySlider />
│   └── <ElementActions />              (Delete, Duplicate, Send to Back, Bring to Front)
│
├── <CanvasWorkspace>
│   ├── <InteractiveCanvas />           (HTML5 Canvas element rendering vector elements)
│   ├── <SelectionBoundingBox />        (Marquee selection & resize handles overlay)
│   └── <InlineTextEditor />            (Dynamically positioned <textarea> for live editing)
│
├── <BottomControlsBar>
│   ├── <ZoomControls>
│   │   ├── <ZoomOutButton />
│   │   ├── <ZoomLevelDisplay />
│   │   └── <ZoomInButton />
│   └── <HistoryControls>
│       ├── <UndoButton />
│       └── <RedoButton />
│
├── <ExportModal />                     (PNG / SVG export configuration & download)
└── <SavedDrawingsModal />              (Backend API integration: browse, load, delete)
```

---

## 2. Detailed Component Specifications

### 2.1 `<TopHeader>` & `<DrawingToolbar>`
- **Role:** Floating top navigation and tool selector.
- **Visual Appearance:**
  - Floats horizontally centered at the top (`top: 16px`, `left: 50%`, `transform: translateX(-50%)`).
  - Rounded pill container with soft drop shadow (`box-shadow: 0 4px 14px rgba(0,0,0,0.1)`), light background (`#ffffff` or dark `#232329`).
  - Active tool has distinct highlight background (`#e0e7ff` or `#3b3858`) and accent color.
- **Buttons / Tools:**
  1. `select` (Hotkey: `1` or `V`) - Select, drag, resize elements.
  2. `rectangle` (Hotkey: `2` or `R`) - Draw rectangle.
  3. `diamond` (Hotkey: `3` or `D`) - Draw diamond rhombus.
  4. `circle` (Hotkey: `4` or `O` / `C`) - Draw circle/ellipse.
  5. `arrow` (Hotkey: `5` or `A`) - Draw directional arrow.
  6. `line` (Hotkey: `6` or `L`) - Draw straight line.
  7. `freehand` (Hotkey: `7` or `P`) - Freeform hand sketch.
  8. `text` (Hotkey: `8` or `T`) - Create text label.
  9. `eraser` (Hotkey: `9` or `E`) - Delete clicked elements.
- **Props:**
  - `activeTool`: string
  - `onSelectTool`: `(tool: string) => void`
  - `isDark`: boolean

---

### 2.2 `<PropertiesPanel>`
- **Role:** Contextual inspector for element appearance.
- **Visual Appearance:**
  - Floating card on left edge (`top: 80px`, `left: 16px`, `width: 240px`).
  - Clean card surface with section dividers.
- **Sub-Controls:**
  1. **Stroke Color Swatches:** Curated color circle buttons (`#1e1e1e`, `#e03131`, `#2f9e44`, `#1971c2`, `#f08c00`, `#9c36b5`, `#099268`) + hex color input.
  2. **Background Color Swatches:** Curated pastel fill colors + `transparent` button.
  3. **Stroke Width:** Thin (`1px`), Medium (`2px`), Thick (`4px`) toggle buttons.
  4. **Stroke Style:** Solid (`-`), Dashed (`--`), Dotted (`···`) toggle buttons.
  5. **Opacity Slider:** Range `10%` to `100%`.
  6. **Element Actions (when elements selected):**
     - Duplicate (`Ctrl+D`)
     - Delete (`Delete` / `Backspace`)
     - Clear canvas button
- **Props:**
  - `selectedElements`: array of element objects
  - `currentStyles`: style object `{ strokeColor, backgroundColor, strokeWidth, strokeStyle, opacity }`
  - `onUpdateStyle`: `(key, value) => void`
  - `onDeleteSelected`: `() => void`
  - `onDuplicateSelected`: `() => void`

---

### 2.3 `<CanvasWorkspace>` & `<InteractiveCanvas>`
- **Role:** The core vector drawing viewport.
- **Implementation Strategy:**
  - HTML5 `<canvas>` managed by React ref with a deterministic rendering loop.
  - Automatically handles high-DPI (Retina displays) via `window.devicePixelRatio`.
  - Supports continuous pan (`scrollX`, `scrollY`) and zoom scale factor (`zoom`).
  - Double buffering or direct path repainting on state change.
- **Pointer Events:**
  - `onPointerDown`: Checks hit test or starts creating new element.
  - `onPointerMove`: Live updates active drawing shape or moves selected elements.
  - `onPointerUp`: Finalizes element into state and records undo snapshot.

---

### 2.4 `<InlineTextEditor>`
- **Role:** Dynamic DOM textarea appearing directly over the canvas when creating or editing text.
- **Behavior:**
  - Positioned absolute at `(textElement.x * zoom + scrollX, textElement.y * zoom + scrollY)`.
  - Transparent background, zero border, matches font size, family, and color.
  - Auto-adjusts width and height as user types.
  - On `blur` or `Escape`, serializes content and deletes the textarea DOM node.

---

### 2.5 `<BottomControlsBar>`
- **Role:** Bottom-left floating history and zoom navigation.
- **Controls:**
  - Zoom Out (`-` button): Decrements zoom by 10%.
  - Zoom Level readout: Displays current percentage (e.g. `100%`); clicking resets to `100%`.
  - Zoom In (`+` button): Increments zoom by 10%.
  - Undo (`↶` button): Reverts to previous history state. Disabled if `undoStack.length === 0`.
  - Redo (`↷` button): Restores popped state. Disabled if `redoStack.length === 0`.

---

### 2.6 `<MainMenuDrawer>`
- **Role:** Slide-out left panel for high-level operations.
- **Features:**
  - **New Canvas / Clear:** Resets canvas elements with confirmation.
  - **Export to PNG:** Renders bounding box to PNG blob and triggers browser download.
  - **Export to SVG:** Serializes scene elements to vector SVG file.
  - **Save Local JSON File:** Exports `.excalidraw` JSON file.
  - **Load Local JSON File:** File input parsing and loading drawing.
  - **Save to Cloud (Backend API):** Prompts for drawing name and POSTs to `/api/drawings`.
  - **Manage Saved Drawings:** Opens modal to browse, load, or delete saved drawings from backend.
  - **Help / Keyboard Shortcuts:** Modal or popup displaying cheatsheet.

---

### 2.7 `<SavedDrawingsModal>`
- **Role:** Modal interacting with the Node.js Express backend.
- **Features:**
  - Table or grid of saved drawings: Name, Element count, Created At, Updated At.
  - "Load" action button: Fetches `/api/drawings/:id` and populates canvas.
  - "Delete" action button: Calls `DELETE /api/drawings/:id` with instant UI list update.
  - "Save Current Drawing": Input box for drawing title and Save button.

---

## 3. Design Tokens & Styling
- **Typography:** Hand-drawn friendly font fallback stack: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (with handwriting font options for canvas text).
- **Themes:**
  - **Light Theme:**
    - Background: `#f8f9fa`
    - Canvas: `#ffffff`
    - Text: `#212529`
    - Border / Shadow: `#e9ecef`, `rgba(0,0,0,0.08)`
  - **Dark Theme:**
    - Background: `#121212`
    - Canvas: `#18181b`
    - Text: `#f4f4f5`
    - Border / Shadow: `#27272a`, `rgba(0,0,0,0.5)`

