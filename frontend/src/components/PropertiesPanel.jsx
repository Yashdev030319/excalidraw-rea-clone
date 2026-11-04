import React from 'react';
import { Icons } from './Icons';

const STROKE_COLORS = [
  '#1e1e1e', // Black
  '#e03131', // Red
  '#2f9e44', // Green
  '#1971c2', // Blue
  '#f08c00', // Orange
  '#9c36b5', // Purple
  '#099268', // Teal
  '#ffffff', // White
];

const BG_COLORS = [
  'transparent',
  '#ffc9c9', // Pastel Red
  '#b2f2bb', // Pastel Green
  '#a5d8ff', // Pastel Blue
  '#ffec99', // Pastel Yellow
  '#ffd8a8', // Pastel Orange
  '#eebefa', // Pastel Violet
  '#e9ecef', // Gray
];

export default function PropertiesPanel({
  selectedElement,
  currentStyles,
  onUpdateStyle,
  onDeleteSelected,
  onDuplicateSelected,
  onSendToBack,
  onBringToFront,
}) {
  const styles = selectedElement || currentStyles;

  return (
    <div
      style={{
        position: 'absolute',
        top: 75,
        left: 14,
        width: 220,
        background: 'var(--bg-panel)',
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-color)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontSize: 12,
      }}
      className="animate-fade-in"
    >
      <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {selectedElement ? 'Element Properties' : 'Default Style'}
      </div>

      {/* Stroke Color */}
      <div>
        <div style={{ marginBottom: 6, fontWeight: 500 }}>Stroke</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {STROKE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onUpdateStyle('strokeColor', c)}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: c,
                border: styles.strokeColor === c ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                boxShadow: styles.strokeColor === c ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : 'none',
              }}
              title={c}
            />
          ))}
          <input
            type="color"
            value={styles.strokeColor && styles.strokeColor.startsWith('#') ? styles.strokeColor : '#1e1e1e'}
            onChange={(e) => onUpdateStyle('strokeColor', e.target.value)}
            style={{
              width: 20,
              height: 20,
              padding: 0,
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              background: 'none',
            }}
            title="Custom Hex Color"
          />
        </div>
      </div>

      {/* Background Color */}
      <div>
        <div style={{ marginBottom: 6, fontWeight: 500 }}>Background</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {BG_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onUpdateStyle('backgroundColor', c)}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: c === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 50% / 8px 8px' : c,
                border: styles.backgroundColor === c ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                boxShadow: styles.backgroundColor === c ? '0 0 0 2px rgba(59, 130, 246, 0.3)' : 'none',
              }}
              title={c === 'transparent' ? 'Transparent' : c}
            />
          ))}
        </div>
      </div>

      {/* Stroke Width */}
      <div>
        <div style={{ marginBottom: 6, fontWeight: 500 }}>Stroke Width</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: 'Thin', width: 1 },
            { label: 'Med', width: 2 },
            { label: 'Thick', width: 4 },
          ].map((w) => (
            <button
              key={w.width}
              onClick={() => onUpdateStyle('strokeWidth', w.width)}
              style={{
                flex: 1,
                padding: '4px 0',
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                background: styles.strokeWidth === w.width ? 'var(--bg-active)' : 'transparent',
                color: styles.strokeWidth === w.width ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: styles.strokeWidth === w.width ? 600 : 400,
                fontSize: 11,
              }}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stroke Style */}
      <div>
        <div style={{ marginBottom: 6, fontWeight: 500 }}>Stroke Style</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'solid', label: 'Solid' },
            { id: 'dashed', label: 'Dashed' },
            { id: 'dotted', label: 'Dotted' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => onUpdateStyle('strokeStyle', s.id)}
              style={{
                flex: 1,
                padding: '4px 0',
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                background: (styles.strokeStyle || 'solid') === s.id ? 'var(--bg-active)' : 'transparent',
                color: (styles.strokeStyle || 'solid') === s.id ? 'var(--primary)' : 'var(--text-main)',
                fontWeight: (styles.strokeStyle || 'solid') === s.id ? 600 : 400,
                fontSize: 11,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontWeight: 500 }}>
          <span>Opacity</span>
          <span>{styles.opacity !== undefined ? styles.opacity : 100}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={styles.opacity !== undefined ? styles.opacity : 100}
          onChange={(e) => onUpdateStyle('opacity', parseInt(e.target.value, 10))}
          style={{ width: '100%', accentColor: 'var(--primary)' }}
        />
      </div>

      {/* Actions (if element selected) */}
      {selectedElement && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={onDuplicateSelected}
              style={{
                flex: 1,
                padding: '5px 8px',
                borderRadius: 6,
                background: 'var(--bg-hover)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                fontSize: 11,
              }}
              title="Duplicate (Ctrl+D)"
            >
              {Icons.duplicate} Duplicate
            </button>
            <button
              onClick={onDeleteSelected}
              style={{
                flex: 1,
                padding: '5px 8px',
                borderRadius: 6,
                background: 'var(--bg-hover)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                fontSize: 11,
              }}
              title="Delete (Backspace/Delete)"
            >
              {Icons.trash} Delete
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={onSendToBack}
              style={{
                flex: 1,
                padding: '4px 0',
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                fontSize: 10,
              }}
            >
              Send to Back
            </button>
            <button
              onClick={onBringToFront}
              style={{
                flex: 1,
                padding: '4px 0',
                borderRadius: 6,
                border: '1px solid var(--border-color)',
                fontSize: 10,
              }}
            >
              Bring to Front
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

