import React, { useEffect, useState } from 'react';
import { Icons } from './Icons';
import { fetchDrawings, fetchDrawingById, deleteDrawingOnBackend, checkBackendHealth } from '../utils/api';

export default function SavedDrawingsModal({ isOpen, onClose, onLoadDrawing }) {
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadList();
    }
  }, [isOpen]);

  const loadList = async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await checkBackendHealth();
      setBackendStatus(health.online);

      if (!health.online) {
        setError(`Backend is unreachable at ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}. Ensure Node/Express backend is running.`);
        setLoading(false);
        return;
      }

      const res = await fetchDrawings();
      setDrawings(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (id) => {
    try {
      setLoading(true);
      const res = await fetchDrawingById(id);
      if (res.data) {
        onLoadDrawing(res.data);
        onClose();
      }
    } catch (err) {
      alert(`Failed to load drawing: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${name}" from backend storage?`)) return;

    try {
      await deleteDrawingOnBackend(id);
      setDrawings((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

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
          width: 520,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Saved Cloud Drawings</h3>
            {backendStatus !== null && (
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: backendStatus ? '#dcfce7' : '#fee2e2',
                  color: backendStatus ? '#15803d' : '#b91c1c',
                  fontWeight: 600,
                }}
              >
                {backendStatus ? '● Backend Online' : '○ Backend Offline'}
              </span>
            )}
          </div>
          <button onClick={onClose} style={{ padding: 4 }}>
            {Icons.close}
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 12px', borderRadius: 8, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 180 }}>
          {loading && drawings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              Loading saved drawings from backend...
            </div>
          ) : drawings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No drawings saved on backend yet. Click "Save to Cloud Backend" to create one.
            </div>
          ) : (
            drawings.map((d) => (
              <div
                key={d.id}
                onClick={() => handleSelect(d.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-app)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {d.elementCount} elements • {new Date(d.updatedAt || d.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleSelect(d.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      background: 'var(--primary)',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Load
                  </button>
                  <button
                    onClick={(e) => handleDelete(d.id, d.name, e)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      background: 'var(--bg-hover)',
                      color: 'var(--danger)',
                    }}
                    title="Delete drawing"
                  >
                    {Icons.trash}
                  </button>
                </div>
              </div>
            ))
          )}
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

