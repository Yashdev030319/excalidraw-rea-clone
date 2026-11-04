import React, { useRef } from 'react';
import { Icons } from './Icons';

export default function MainMenuDrawer({
  isOpen,
  onClose,
  onClearCanvas,
  onSaveJson,
  onLoadJson,
  onOpenExportModal,
  onOpenSaveModal,
  onOpenSavedDrawings,
  onOpenShortcuts,
}) {
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      onLoadJson(file);
      e.target.value = '';
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.25)',
          zIndex: 80,
        }}
      />

      {/* Drawer */}
      <div
        className="animate-slide-left"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 280,
          background: 'var(--bg-panel)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 90,
          padding: '18px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>✎</span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Whiteboard Lab</span>
          </div>
          <button onClick={onClose} style={{ padding: 4, borderRadius: 6 }}>
            {Icons.close}
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept=".json,.excalidraw"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          <button
            onClick={() => {
              if (confirm('Clear the entire canvas? Unsaved changes will be lost.')) {
                onClearCanvas();
                onClose();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              textAlign: 'left',
              color: 'var(--danger)',
            }}
            className="hover:bg-hover"
          >
            {Icons.trash} Clear Canvas
          </button>

          <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />

          <button
            onClick={() => {
              onOpenExportModal();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              textAlign: 'left',
            }}
          >
            {Icons.download} Export (PNG / SVG)
          </button>

          <button
            onClick={() => {
              onSaveJson();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              textAlign: 'left',
            }}
          >
            {Icons.save} Save to File (.excalidraw)
          </button>

          <button
            onClick={() => {
              fileInputRef.current?.click();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              textAlign: 'left',
            }}
          >
            {Icons.folder} Open Local File
          </button>

          <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />

          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 12px' }}>
            CLOUD / BACKEND API
          </div>

          <button
            onClick={() => {
              onOpenSaveModal();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              textAlign: 'left',
            }}
          >
            {Icons.save} Save to Cloud Backend
          </button>

          <button
            onClick={() => {
              onOpenSavedDrawings();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              textAlign: 'left',
            }}
          >
            {Icons.folder} Browse Saved Drawings
          </button>

          <div style={{ height: 1, background: 'var(--border-color)', margin: '4px 0' }} />

          <button
            onClick={() => {
              onOpenShortcuts();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              textAlign: 'left',
            }}
          >
            {Icons.help} Keyboard Shortcuts
          </button>
        </div>

        <div style={{ marginTop: 'auto', fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
          Excalidraw Reconstruction Lab
          <br />
          Next.js App Router + Express.js API
        </div>
      </div>
    </>
  );
}

