import React from 'react';
import { Icons } from './Icons';

const SHORTCUTS = [
  { key: '1 or V', action: 'Selection tool' },
  { key: '2 or R', action: 'Rectangle tool' },
  { key: '3 or D', action: 'Diamond tool' },
  { key: '4 or O', action: 'Circle/Ellipse tool' },
  { key: '5 or A', action: 'Arrow tool' },
  { key: '6 or L', action: 'Line tool' },
  { key: '7 or P', action: 'Freehand Draw (Pencil)' },
  { key: '8 or T', action: 'Text tool' },
  { key: '9 or E', action: 'Eraser tool' },
  { key: 'Delete / Backspace', action: 'Delete selected element' },
  { key: 'Ctrl + Z / Cmd + Z', action: 'Undo' },
  { key: 'Ctrl + Y / Cmd + Y', action: 'Redo' },
  { key: 'Ctrl + D', action: 'Duplicate selected element' },
  { key: 'Space + Drag', action: 'Pan canvas' },
  { key: '+ / -', action: 'Zoom In / Zoom Out' },
  { key: '0', action: 'Reset zoom to 100%' },
  { key: 'Escape', action: 'Deselect / Cancel active tool' },
];

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440,
          maxHeight: '80vh',
          background: 'var(--bg-panel)',
          borderRadius: 14,
          padding: 22,
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Keyboard Shortcuts</h3>
          <button onClick={onClose} style={{ padding: 4 }}>
            {Icons.close}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          {SHORTCUTS.map((s) => (
            <div
              key={s.key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: 6,
                background: 'var(--bg-app)',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>{s.action}</span>
              <kbd
                style={{
                  background: 'var(--bg-panel)',
                  padding: '2px 8px',
                  borderRadius: 4,
                  border: '1px solid var(--border-color)',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  fontWeight: 600,
                }}
              >
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              fontSize: 13,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

