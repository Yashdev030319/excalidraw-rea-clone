/**
 * Canvas Renderer for Whiteboard Application
 * Handles coordinate transformation, vector shapes, freehand paths, text, and selection outlines.
 */

// Helper to set stroke styling (solid, dashed, dotted)
function applyStrokeStyle(ctx, strokeStyle, strokeWidth) {
  if (strokeStyle === 'dashed') {
    ctx.setLineDash([strokeWidth * 4, strokeWidth * 3]);
  } else if (strokeStyle === 'dotted') {
    ctx.setLineDash([strokeWidth * 1.5, strokeWidth * 2]);
  } else {
    ctx.setLineDash([]);
  }
}

// Render a single element onto the 2D context
export function renderElement(ctx, elem) {
  ctx.save();

  // Opacity
  ctx.globalAlpha = (elem.opacity !== undefined ? elem.opacity : 100) / 100;
  ctx.lineWidth = elem.strokeWidth || 2;
  ctx.strokeStyle = elem.strokeColor || '#1e1e1e';
  ctx.fillStyle = elem.backgroundColor && elem.backgroundColor !== 'transparent' ? elem.backgroundColor : 'transparent';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  applyStrokeStyle(ctx, elem.strokeStyle, elem.strokeWidth || 2);

  const { x, y, width, height, type } = elem;

  switch (type) {
    case 'rectangle': {
      if (ctx.fillStyle !== 'transparent') {
        ctx.fillRect(x, y, width, height);
      }
      ctx.strokeRect(x, y, width, height);
      break;
    }

    case 'circle': {
      const rx = Math.abs(width) / 2;
      const ry = Math.abs(height) / 2;
      const cx = x + width / 2;
      const cy = y + height / 2;
      if (rx > 0 && ry > 0) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        if (ctx.fillStyle !== 'transparent') {
          ctx.fill();
        }
        ctx.stroke();
      }
      break;
    }

    case 'diamond': {
      const cx = x + width / 2;
      const cy = y + height / 2;
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(x + width, cy);
      ctx.lineTo(cx, y + height);
      ctx.lineTo(x, cy);
      ctx.closePath();
      if (ctx.fillStyle !== 'transparent') {
        ctx.fill();
      }
      ctx.stroke();
      break;
    }

    case 'line': {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y + height);
      ctx.stroke();
      break;
    }

    case 'arrow': {
      const endX = x + width;
      const endY = y + height;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Draw Arrowhead
      const angle = Math.atan2(height, width);
      const headLength = Math.max(12, (elem.strokeWidth || 2) * 4);
      const arrowAngle = Math.PI / 7;

      ctx.save();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(angle - arrowAngle),
        endY - headLength * Math.sin(angle - arrowAngle)
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(angle + arrowAngle),
        endY - headLength * Math.sin(angle + arrowAngle)
      );
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'freehand': {
      if (elem.points && elem.points.length > 0) {
        ctx.beginPath();
        const [first, ...rest] = elem.points;
        ctx.moveTo(first[0], first[1]);
        for (const pt of rest) {
          ctx.lineTo(pt[0], pt[1]);
        }
        ctx.stroke();
      }
      break;
    }

    case 'text': {
      const fontSize = elem.fontSize || 22;
      ctx.font = `${fontSize}px "Caveat", "Virgil", "Comic Sans MS", cursive, sans-serif`;
      ctx.fillStyle = elem.strokeColor || '#1e1e1e';
      ctx.textBaseline = 'top';

      const lines = (elem.text || '').split('\n');
      const lineHeight = fontSize * 1.25;
      lines.forEach((line, index) => {
        ctx.fillText(line, x, y + index * lineHeight);
      });
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

// Render selection bounding box and resize handles
export function renderSelectionOverlay(ctx, elem, isDark) {
  if (!elem) return;

  const bounds = getElementBounds(elem);
  const padding = 6;
  const bx = bounds.x - padding;
  const by = bounds.y - padding;
  const bw = bounds.width + padding * 2;
  const bh = bounds.height + padding * 2;

  ctx.save();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(bx, by, bw, bh);

  // Corner resize handles
  const handleSize = 8;
  const handles = [
    { x: bx - handleSize / 2, y: by - handleSize / 2 },
    { x: bx + bw - handleSize / 2, y: by - handleSize / 2 },
    { x: bx + bw - handleSize / 2, y: by + bh - handleSize / 2 },
    { x: bx - handleSize / 2, y: by + bh - handleSize / 2 },
  ];

  ctx.setLineDash([]);
  ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.5;

  for (const h of handles) {
    ctx.fillRect(h.x, h.y, handleSize, handleSize);
    ctx.strokeRect(h.x, h.y, handleSize, handleSize);
  }

  ctx.restore();
}

// Render marquee selection rectangle
export function renderMarquee(ctx, marquee) {
  if (!marquee || marquee.width === 0 || marquee.height === 0) return;

  const x = Math.min(marquee.startX, marquee.currentX);
  const y = Math.min(marquee.startY, marquee.currentY);
  const w = Math.abs(marquee.currentX - marquee.startX);
  const h = Math.abs(marquee.currentY - marquee.startY);

  ctx.save();
  ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

// Calculate normal bounding box for any element
export function getElementBounds(elem) {
  const { x, y, width = 0, height = 0, type } = elem;

  if (type === 'freehand' && elem.points && elem.points.length > 0) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [px, py] of elem.points) {
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
    }
    return {
      x: minX,
      y: minY,
      width: Math.max(maxX - minX, 10),
      height: Math.max(maxY - minY, 10)
    };
  }

  const normX = width < 0 ? x + width : x;
  const normY = height < 0 ? y + height : y;
  const normW = Math.abs(width);
  const normH = Math.abs(height);

  return {
    x: normX,
    y: normY,
    width: Math.max(normW, 10),
    height: Math.max(normH, 10)
  };
}

// Hit test whether point (px, py) is inside or near element
export function hitTestElement(px, py, elem) {
  const bounds = getElementBounds(elem);
  const tolerance = Math.max(8, (elem.strokeWidth || 2) * 2);

  // Quick bounding box filter
  if (
    px < bounds.x - tolerance ||
    px > bounds.x + bounds.width + tolerance ||
    py < bounds.y - tolerance ||
    py > bounds.y + bounds.height + tolerance
  ) {
    return false;
  }

  // Exact shape tests
  if (elem.type === 'rectangle' || elem.type === 'text') {
    return (
      px >= bounds.x - tolerance &&
      px <= bounds.x + bounds.width + tolerance &&
      py >= bounds.y - tolerance &&
      py <= bounds.y + bounds.height + tolerance
    );
  }

  if (elem.type === 'circle') {
    const rx = bounds.width / 2;
    const ry = bounds.height / 2;
    const cx = bounds.x + rx;
    const cy = bounds.y + ry;
    if (rx <= 0 || ry <= 0) return false;
    const norm = Math.pow((px - cx) / rx, 2) + Math.pow((py - cy) / ry, 2);
    return norm <= 1.25;
  }

  if (elem.type === 'line' || elem.type === 'arrow') {
    const x1 = elem.x;
    const y1 = elem.y;
    const x2 = elem.x + elem.width;
    const y2 = elem.y + elem.height;
    return distanceToSegment(px, py, x1, y1, x2, y2) <= tolerance;
  }

  if (elem.type === 'freehand' && elem.points) {
    for (let i = 0; i < elem.points.length - 1; i++) {
      const [x1, y1] = elem.points[i];
      const [x2, y2] = elem.points[i + 1];
      if (distanceToSegment(px, py, x1, y1, x2, y2) <= tolerance) {
        return true;
      }
    }
    return false;
  }

  return true;
}

// Point to line segment distance
function distanceToSegment(px, py, x1, y1, x2, y2) {
  const l2 = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

