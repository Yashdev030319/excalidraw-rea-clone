import React from 'react';
import { Icons } from './Icons';

export default function BottomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) {
  const percentage = Math.round(zoom * 100);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 14,
        left: 14,
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-panel)',
        borderRadius: 10,
        padding: '4px 6px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-color)',
        zIndex: 50,
        gap: 4,
      }}
    >
      {/* Zoom Controls */}
      <button
        onClick={onZoomOut}
        title="Zoom Out (-)"
        style={{
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
        }}
      >
        {Icons.zoomOut}
      </button>

      <button
        onClick={onResetZoom}
        title="Reset Zoom (0)"
        style={{
          padding: '0 6px',
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          borderRadius: 6,
          minWidth: 46,
        }}
      >
        {percentage}%
      </button>

      <button
        onClick={onZoomIn}
        title="Zoom In (+)"
        style={{
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
        }}
      >
        {Icons.zoomIn}
      </button>

      <div style={{ width: 1, height: 18, background: 'var(--border-color)', margin: '0 2px' }} />

      {/* History Controls */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        style={{
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          opacity: canUndo ? 1 : 0.35,
          cursor: canUndo ? 'pointer' : 'not-allowed',
        }}
      >
        {Icons.undo}
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        style={{
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          opacity: canRedo ? 1 : 0.35,
          cursor: canRedo ? 'pointer' : 'not-allowed',
        }}
      >
        {Icons.redo}
      </button>
    </div>
  );
}

