import { getElementBounds, renderElement } from './canvasRenderer';

// Helper to calculate union bounding box of elements
export function getSceneBounds(elements, padding = 30) {
  if (!elements || elements.length === 0) {
    return { minX: 0, minY: 0, width: 800, height: 600 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const elem of elements) {
    const b = getElementBounds(elem);
    if (b.x < minX) minX = b.x;
    if (b.y < minY) minY = b.y;
    if (b.x + b.width > maxX) maxX = b.x + b.width;
    if (b.y + b.height > maxY) maxY = b.y + b.height;
  }

  return {
    minX: minX - padding,
    minY: minY - padding,
    width: Math.max(maxX - minX + padding * 2, 200),
    height: Math.max(maxY - minY + padding * 2, 200)
  };
}

// Export canvas elements to PNG image
export function exportToPng(elements, isDark = false, includeBackground = true, scale = 2) {
  if (!elements || elements.length === 0) {
    alert('Canvas is empty. Draw something before exporting.');
    return;
  }

  const bounds = getSceneBounds(elements, 40);
  const canvas = document.createElement('canvas');
  canvas.width = bounds.width * scale;
  canvas.height = bounds.height * scale;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  // Background
  if (includeBackground) {
    ctx.fillStyle = isDark ? '#18181b' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Scale and translate
  ctx.scale(scale, scale);
  ctx.translate(-bounds.minX, -bounds.minY);

  // Render elements
  for (const elem of elements) {
    renderElement(ctx, elem);
  }

  // Trigger download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whiteboard-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

// Export canvas elements to clean SVG
export function exportToSvg(elements, isDark = false, includeBackground = true) {
  if (!elements || elements.length === 0) {
    alert('Canvas is empty. Draw something before exporting.');
    return;
  }

  const bounds = getSceneBounds(elements, 40);
  const bgColor = isDark ? '#18181b' : '#ffffff';

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}" width="${bounds.width}" height="${bounds.height}">\n`;

  if (includeBackground) {
    svgContent += `  <rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.width}" height="${bounds.height}" fill="${bgColor}" />\n`;
  }

  for (const elem of elements) {
    const stroke = elem.strokeColor || '#1e1e1e';
    const fill = elem.backgroundColor && elem.backgroundColor !== 'transparent' ? elem.backgroundColor : 'none';
    const strokeWidth = elem.strokeWidth || 2;
    const opacity = (elem.opacity !== undefined ? elem.opacity : 100) / 100;
    const dash = elem.strokeStyle === 'dashed' ? `stroke-dasharray="${strokeWidth * 4},${strokeWidth * 3}"` : elem.strokeStyle === 'dotted' ? `stroke-dasharray="${strokeWidth * 1.5},${strokeWidth * 2}"` : '';

    const { x, y, width, height, type } = elem;

    switch (type) {
      case 'rectangle':
        svgContent += `  <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" ${dash} />\n`;
        break;

      case 'circle': {
        const rx = Math.abs(width) / 2;
        const ry = Math.abs(height) / 2;
        const cx = x + width / 2;
        const cy = y + height / 2;
        svgContent += `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" ${dash} />\n`;
        break;
      }

      case 'diamond': {
        const cx = x + width / 2;
        const cy = y + height / 2;
        const pts = `${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`;
        svgContent += `  <polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" ${dash} />\n`;
        break;
      }

      case 'line':
        svgContent += `  <line x1="${x}" y1="${y}" x2="${x + width}" y2="${y + height}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" ${dash} stroke-linecap="round" />\n`;
        break;

      case 'arrow': {
        const endX = x + width;
        const endY = y + height;
        const angle = Math.atan2(height, width);
        const headLength = Math.max(12, strokeWidth * 4);
        const a1 = angle - Math.PI / 7;
        const a2 = angle + Math.PI / 7;
        const p1x = endX - headLength * Math.cos(a1);
        const p1y = endY - headLength * Math.sin(a1);
        const p2x = endX - headLength * Math.cos(a2);
        const p2y = endY - headLength * Math.sin(a2);

        svgContent += `  <g opacity="${opacity}">\n`;
        svgContent += `    <line x1="${x}" y1="${y}" x2="${endX}" y2="${endY}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" ${dash} />\n`;
        svgContent += `    <path d="M ${p1x} ${p1y} L ${endX} ${endY} L ${p2x} ${p2y}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round" />\n`;
        svgContent += `  </g>\n`;
        break;
      }

      case 'freehand':
        if (elem.points && elem.points.length > 0) {
          const pathData = elem.points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`).join(' ');
          svgContent += `  <path d="${pathData}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round" />\n`;
        }
        break;

      case 'text': {
        const fontSize = elem.fontSize || 22;
        const lines = (elem.text || '').split('\n');
        const lineHeight = fontSize * 1.25;
        svgContent += `  <text x="${x}" y="${y + fontSize * 0.9}" font-family="Caveat, cursive, sans-serif" font-size="${fontSize}" fill="${stroke}" opacity="${opacity}">\n`;
        lines.forEach((line, index) => {
          svgContent += `    <tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>\n`;
        });
        svgContent += `  </text>\n`;
        break;
      }

      default:
        break;
    }
  }

  svgContent += '</svg>';

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `whiteboard-${Date.now()}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Export drawing as local JSON file
export function exportToJson(elements, appState, filename = 'drawing') {
  const data = {
    type: 'excalidraw',
    version: 2,
    source: 'http://localhost:3000',
    elements: elements || [],
    appState: appState || {}
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename.replace(/\s+/g, '_')}-${Date.now()}.excalidraw`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Load drawing from local JSON file
export function loadFromJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (json && Array.isArray(json.elements)) {
          resolve(json);
        } else if (Array.isArray(json)) {
          resolve({ elements: json, appState: {} });
        } else {
          reject(new Error('Invalid file format: missing elements array'));
        }
      } catch (err) {
        reject(new Error('Failed to parse JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsText(file);
  });
}

