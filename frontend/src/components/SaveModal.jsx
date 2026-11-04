import React, { useState } from 'react';
import { Icons } from './Icons';
import { createDrawingOnBackend } from '../utils/api';

export default function SaveModal({ isOpen, onClose, elements, appState, currentDrawingName, onSavedSuccess }) {
  const [name, setName] = useState(currentDrawingName || 'My Drawing');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const res = await createDrawingOnBackend({
        name: name.trim(),
        elements,
        appState
      });
      if (res.success && res.data) {
        onSavedSuccess(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to save drawing to backend');
    } finally {
      setSaving(false);
    }
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
      <form
        onSubmit={handleSave}
        className="animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 380,
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
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Save to Cloud Backend</h3>
          <button type="button" onClick={onClose} style={{ padding: 4 }}>
            {Icons.close}
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 12px', borderRadius: 8, fontSize: 12 }}>
            {error}
          </div>
        )}

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            DRAWING NAME
          </label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Architecture Diagram"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-app)',
              fontSize: 14,
            }}
          />
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-hover)', padding: '8px 10px', borderRadius: 8 }}>
          Will persist <strong>{elements.length}</strong> element{elements.length === 1 ? '' : 's'} to backend REST endpoint <code>POST /api/drawings</code>.
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            type="button"
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
            type="submit"
            disabled={saving || !name.trim()}
            style={{
              flex: 1.5,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'var(--primary)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              opacity: saving ? 0.7 : 1,
              cursor: saving ? 'wait' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Drawing'}
          </button>
        </div>
      </form>
    </div>
  );
}

