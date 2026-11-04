import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  renderElement,
  renderSelectionOverlay,
  renderMarquee,
  hitTestElement,
  getElementBounds,
} from '../utils/canvasRenderer';
import InlineTextEditor from './InlineTextEditor';

export default function CanvasWorkspace({
  elements,
  onElementsChange,
  activeTool,
  onSelectTool,
  currentStyles,
  selectedId,
  onSelectElement,
  pan,
  onPanChange,
  zoom,
  onZoomChange,
  isDark,
  onRecordHistory,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Interaction State
  const [draftElement, setDraftElement] = useState(null);
  const [marquee, setMarquee] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingText, setEditingText] = useState(null);
  const panStartRef = useRef({ x: 0, y: 0 });
  const spacePressedRef = useRef(false);

  // Convert Screen (client) coords to World (scene) coords
  const screenToWorld = useCallback(
    (sx, sy) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = sx - rect.left;
      const clientY = sy - rect.top;
      return {
        x: (clientX - pan.x) / zoom,
        y: (clientY - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // Primary Canvas Render Loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Apply Canvas Background
    ctx.fillStyle = isDark ? '#18181b' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Background Grid Dots
    ctx.save();
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const gridSize = 20 * zoom;
    const offsetX = pan.x % gridSize;
    const offsetY = pan.y % gridSize;
    for (let x = offsetX; x < width; x += gridSize) {
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
      }
    }
    ctx.restore();

    // Setup World Transform
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 1. Render all committed elements
    for (const elem of elements) {
      // Don't render text currently being edited in textarea overlay
      if (editingText && editingText.id === elem.id) continue;
      renderElement(ctx, elem);
    }

    // 2. Render active draft element
    if (draftElement) {
      renderElement(ctx, draftElement);
    }

    // 3. Render selection bounding box
    if (selectedId && !draftElement) {
      const selectedElem = elements.find((e) => e.id === selectedId);
      if (selectedElem) {
        renderSelectionOverlay(ctx, selectedElem, isDark);
      }
    }

    // 4. Render marquee selection box
    if (marquee) {
      renderMarquee(ctx, marquee);
    }

    ctx.restore();
  }, [elements, draftElement, selectedId, marquee, pan, zoom, isDark, editingText]);

  // Keep canvas sized to container
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      render();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  useEffect(() => {
    render();
  }, [render]);

  // Track space bar for pan
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement.tagName !== 'TEXTAREA') {
        spacePressedRef.current = true;
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        spacePressedRef.current = false;
        if (containerRef.current) containerRef.current.style.cursor = 'default';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Pointer Down
  const handlePointerDown = (e) => {
    if (e.button === 1 || spacePressedRef.current) {
      // Middle click or Space + Click -> Pan
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    if (e.button !== 0) return; // Only primary button

    const world = screenToWorld(e.clientX, e.clientY);

    // 1. Text Tool
    if (activeTool === 'text') {
      // Check if clicking existing text
      const clicked = [...elements].reverse().find((el) => el.type === 'text' && hitTestElement(world.x, world.y, el));
      if (clicked) {
        setEditingText(clicked);
      } else {
        setEditingText({
          isNew: true,
          x: world.x,
          y: world.y,
          fontSize: 22,
          strokeColor: currentStyles.strokeColor,
        });
      }
      return;
    }

    // 2. Eraser Tool
    if (activeTool === 'eraser') {
      const clickedIndex = [...elements].reverse().findIndex((el) => hitTestElement(world.x, world.y, el));
      if (clickedIndex !== -1) {
        const actualIndex = elements.length - 1 - clickedIndex;
        const newElems = elements.filter((_, i) => i !== actualIndex);
        onElementsChange(newElems);
        onRecordHistory(newElems);
        if (selectedId === elements[actualIndex].id) {
          onSelectElement(null);
        }
      }
      return;
    }

    // 3. Selection Tool
    if (activeTool === 'select') {
      const clicked = [...elements].reverse().find((el) => hitTestElement(world.x, world.y, el));
      if (clicked) {
        onSelectElement(clicked.id);
        setIsDragging(true);
        setDragOffset({
          x: world.x - clicked.x,
          y: world.y - clicked.y,
        });
      } else {
        // Clicked empty area -> Deselect & start marquee
        onSelectElement(null);
        setMarquee({
          startX: world.x,
          startY: world.y,
          currentX: world.x,
          currentY: world.y,
        });
      }
      return;
    }

    // 4. Shape Drawing Tools (rectangle, diamond, circle, line, arrow, freehand)
    const newId = `elem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const baseElement = {
      id: newId,
      type: activeTool,
      x: world.x,
      y: world.y,
      width: 0,
      height: 0,
      strokeColor: currentStyles.strokeColor,
      backgroundColor: currentStyles.backgroundColor,
      strokeWidth: currentStyles.strokeWidth,
      strokeStyle: currentStyles.strokeStyle,
      opacity: currentStyles.opacity,
    };

    if (activeTool === 'freehand') {
      baseElement.points = [[world.x, world.y]];
    }

    setDraftElement(baseElement);
  };

  // Pointer Move
  const handlePointerMove = (e) => {
    // Panning
    if (isPanning) {
      onPanChange({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    const world = screenToWorld(e.clientX, e.clientY);

    // Dragging selected element
    if (isDragging && selectedId) {
      const newElems = elements.map((elem) => {
        if (elem.id === selectedId) {
          const deltaX = world.x - dragOffset.x - elem.x;
          const deltaY = world.y - dragOffset.y - elem.y;

          if (elem.type === 'freehand' && elem.points) {
            return {
              ...elem,
              x: elem.x + deltaX,
              y: elem.y + deltaY,
              points: elem.points.map(([px, py]) => [px + deltaX, py + deltaY]),
            };
          }

          return {
            ...elem,
            x: world.x - dragOffset.x,
            y: world.y - dragOffset.y,
          };
        }
        return elem;
      });
      onElementsChange(newElems);
      return;
    }

    // Marquee Selection
    if (marquee) {
      setMarquee((prev) => ({
        ...prev,
        currentX: world.x,
        currentY: world.y,
      }));
      return;
    }

    // Drawing Draft Element
    if (draftElement) {
      if (draftElement.type === 'freehand') {
        setDraftElement((prev) => ({
          ...prev,
          points: [...prev.points, [world.x, world.y]],
        }));
      } else if (['rectangle', 'circle', 'diamond'].includes(draftElement.type)) {
        const startX = draftElement.x;
        const startY = draftElement.y;
        setDraftElement((prev) => ({
          ...prev,
          width: world.x - startX,
          height: world.y - startY,
        }));
      } else if (['line', 'arrow'].includes(draftElement.type)) {
        setDraftElement((prev) => ({
          ...prev,
          width: world.x - prev.x,
          height: world.y - prev.y,
        }));
      }
    }
  };

  // Pointer Up
  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDragging) {
      setIsDragging(false);
      onRecordHistory(elements);
      return;
    }

    // Finalize Marquee
    if (marquee) {
      const x1 = Math.min(marquee.startX, marquee.currentX);
      const y1 = Math.min(marquee.startY, marquee.currentY);
      const x2 = Math.max(marquee.startX, marquee.currentX);
      const y2 = Math.max(marquee.startY, marquee.currentY);

      // If user just tapped without dragging, deselect
      if (Math.abs(x2 - x1) < 4 && Math.abs(y2 - y1) < 4) {
        onSelectElement(null);
      } else {
        // Select first element falling within marquee bounds
        const inside = elements.find((elem) => {
          const b = getElementBounds(elem);
          return b.x >= x1 && b.x + b.width <= x2 && b.y >= y1 && b.y + b.height <= y2;
        });
        if (inside) {
          onSelectElement(inside.id);
        }
      }
      setMarquee(null);
      return;
    }

    // Finalize Draft Element
    if (draftElement) {
      let valid = false;

      if (draftElement.type === 'freehand') {
        valid = draftElement.points && draftElement.points.length > 2;
      } else if (['rectangle', 'circle', 'diamond'].includes(draftElement.type)) {
        // Normalize negative width/height
        let x = draftElement.x;
        let y = draftElement.y;
        let w = draftElement.width;
        let h = draftElement.height;
        if (w < 0) {
          x += w;
          w = Math.abs(w);
        }
        if (h < 0) {
          y += h;
          h = Math.abs(h);
        }
        draftElement.x = x;
        draftElement.y = y;
        draftElement.width = w;
        draftElement.height = h;
        valid = w > 3 || h > 3;
      } else if (['line', 'arrow'].includes(draftElement.type)) {
        valid = Math.hypot(draftElement.width, draftElement.height) > 5;
      }

      if (valid) {
        const updated = [...elements, draftElement];
        onElementsChange(updated);
        onRecordHistory(updated);
        onSelectElement(draftElement.id);
        onSelectTool('select');
      }

      setDraftElement(null);
    }
  };

  // Mouse Wheel (Zoom & Pan)
  const handleWheel = (e) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const zoomFactor = 1.08;
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
      newZoom = Math.min(3.0, Math.max(0.1, newZoom));

      // Zoom centered on cursor
      const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
      const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

      onZoomChange(newZoom);
      onPanChange({ x: newPanX, y: newPanY });
    } else {
      // Two finger pan or wheel scroll
      onPanChange({
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY,
      });
    }
  };

  // Text Editor Commit
  const handleTextCommit = (textValue) => {
    if (!editingText) return;

    const trimmed = textValue.trim();
    if (trimmed) {
      if (editingText.isNew) {
        const newTextElem = {
          id: `elem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          type: 'text',
          x: editingText.x,
          y: editingText.y,
          text: trimmed,
          fontSize: editingText.fontSize || 22,
          strokeColor: editingText.strokeColor || currentStyles.strokeColor,
        };
        const updated = [...elements, newTextElem];
        onElementsChange(updated);
        onRecordHistory(updated);
        onSelectElement(newTextElem.id);
        onSelectTool('select');
      } else {
        const updated = elements.map((elem) =>
          elem.id === editingText.id ? { ...elem, text: trimmed } : elem
        );
        onElementsChange(updated);
        onRecordHistory(updated);
      }
    } else if (!editingText.isNew) {
      // If cleared, delete it
      const updated = elements.filter((elem) => elem.id !== editingText.id);
      onElementsChange(updated);
      onRecordHistory(updated);
      onSelectElement(null);
    }

    setEditingText(null);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor:
          activeTool === 'select'
            ? 'default'
            : activeTool === 'text'
            ? 'text'
            : activeTool === 'eraser'
            ? 'cell'
            : 'crosshair',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Dynamic Inline Text Editor Overlay */}
      {editingText && (
        <InlineTextEditor
          x={editingText.x}
          y={editingText.y}
          zoom={zoom}
          pan={pan}
          initialText={editingText.text || ''}
          fontSize={editingText.fontSize || 22}
          strokeColor={editingText.strokeColor || currentStyles.strokeColor}
          onCommit={handleTextCommit}
          onCancel={() => setEditingText(null)}
        />
      )}
    </div>
  );
}

