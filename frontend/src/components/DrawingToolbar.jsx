import React from 'react';
import { Icons } from './Icons';

const TOOLS = [
  { id: 'select', label: 'Select', hotkey: '1', icon: Icons.select },
  { id: 'rectangle', label: 'Rectangle', hotkey: '2', icon: Icons.rectangle },
  { id: 'diamond', label: 'Diamond', hotkey: '3', icon: Icons.diamond },
  { id: 'circle', label: 'Circle', hotkey: '4', icon: Icons.circle },
  { id: 'arrow', label: 'Arrow', hotkey: '5', icon: Icons.arrow },
  { id: 'line', label: 'Line', hotkey: '6', icon: Icons.line },
  { id: 'freehand', label: 'Draw', hotkey: '7', icon: Icons.freehand },
  { id: 'text', label: 'Text', hotkey: '8', icon: Icons.text },
  { id: 'eraser', label: 'Eraser', hotkey: '9', icon: Icons.eraser },
];

export default function DrawingToolbar({ activeTool, onSelectTool }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-panel)',
        borderRadius: 12,
        padding: '4px 6px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-color)',
        zIndex: 50,
        gap: 3,
        maxWidth: 'calc(100vw - 160px)',
        overflowX: 'auto',
      }}
    >
      {TOOLS.map((t) => {
        const isActive = activeTool === t.id;
        return (
          <button
            key={t.id}
            title={`${t.label} (${t.hotkey})`}
            onClick={() => onSelectTool(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: 38,
              height: 38,
              borderRadius: 8,
              color: isActive ? 'var(--primary)' : 'var(--text-main)',
              background: isActive ? 'var(--bg-active)' : 'transparent',
              border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {t.icon}
            <span
              style={{
                position: 'absolute',
                bottom: 2,
                right: 3,
                fontSize: 9,
                fontWeight: 600,
                opacity: isActive ? 0.9 : 0.45,
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              }}
            >
              {t.hotkey}
            </span>
          </button>
        );
      })}
    </div>
  );
}

