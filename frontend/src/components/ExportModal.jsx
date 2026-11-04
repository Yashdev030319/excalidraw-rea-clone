import React, { useState } from 'react';
import { Icons } from './Icons';
import { exportToPng, exportToSvg } from '../utils/exportUtils';

export default function ExportModal({ isOpen, onClose, elements, isDark }) {
  const [format, setFormat] = useState('png'); // 'png' | 'svg'
  const [includeBg, setIncludeBg] = useState(true);
  const [scale, setScale] = useState(2);

  if (!isOpen) return null;

  const handleExport = () => {
    if (format === 'png') {
      exportToPng(elements, isDark, includeBg, scale);
    } else {
      exportToSvg(elements, isDark, includeBg);
    }
    onClose();
  };

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
          width: 380,
          background: 'var(--bg-panel)',
          borderRadius: 14,
          padding: 20,
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Export Drawing</h3>
          <button onClick={onClose} style={{ padding: 4 }}>
            {Icons.close}
          </button>
        </div>

        {/* Format Selector */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            FORMAT
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setFormat('png')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: format === 'png' ? 'var(--bg-active)' : 'transparent',
                color: format === 'png' ? 'var(--primary)' : 'inherit',
                fontWeight: format === 'png' ? 600 : 400,
                fontSize: 13,
              }}
            >
              PNG Image
            </button>
            <button
              onClick={() => setFormat('svg')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: format === 'svg' ? 'var(--bg-active)' : 'transparent',
                color: format === 'svg' ? 'var(--primary)' : 'inherit',
                fontWeight: format === 'svg' ? 600 : 400,
                fontSize: 13,
              }}
            >
              SVG Vector
            </button>
          </div>
        </div>

        {/* Scale (for PNG) */}
        {format === 'png' && (
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              SCALE / RESOLUTION
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--border-color)',
                    background: scale === s ? 'var(--bg-active)' : 'transparent',
                    color: scale === s ? 'var(--primary)' : 'inherit',
                    fontWeight: scale === s ? 600 : 400,
                    fontSize: 12,
                  }}
                >
                  {s}x {s === 2 ? '(Retina)' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Include Background */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
          <span style={{ fontSize: 13 }}>Include Canvas Background</span>
          <input
            type="checkbox"
            checked={includeBg}
            onChange={(e) => setIncludeBg(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '8px 10px', borderRadius: 8 }}>
          Scene contains <strong>{elements.length}</strong> element{elements.length === 1 ? '' : 's'}. Export will automatically crop to element boundaries.
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            style={{
              flex: 1.5,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'var(--primary)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {Icons.download} Export {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}

