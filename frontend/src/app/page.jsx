'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import DrawingToolbar from '../components/DrawingToolbar';
import PropertiesPanel from '../components/PropertiesPanel';
import BottomControls from '../components/BottomControls';
import MainMenuDrawer from '../components/MainMenuDrawer';
import ExportModal from '../components/ExportModal';
import SaveModal from '../components/SaveModal';
import SavedDrawingsModal from '../components/SavedDrawingsModal';
import ShortcutsModal from '../components/ShortcutsModal';
import CanvasWorkspace from '../components/CanvasWorkspace';
import { Icons } from '../components/Icons';
import { exportToJson, loadFromJsonFile } from '../utils/exportUtils';

export default function WhiteboardPage() {
  // Elements & History
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Active Tool & Styles
  const [activeTool, setActiveTool] = useState('select');
  const [currentStyles, setCurrentStyles] = useState({
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    strokeWidth: 2,
    strokeStyle: 'solid',
    opacity: 100,
  });

  // Selection
  const [selectedId, setSelectedId] = useState(null);

  // Viewport
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);

  // Theme
  const [isDark, setIsDark] = useState(false);

  // Modals
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isSavedDrawingsOpen, setIsSavedDrawingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [currentDrawingName, setCurrentDrawingName] = useState('Untitled Drawing');

  // Load theme and auto-recovery from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('whiteboard_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    const savedState = localStorage.getItem('whiteboard_elements');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setElements(parsed);
          setHistory([parsed]);
          setHistoryIndex(0);
        }
      } catch (e) {
        console.error('Failed to parse cached canvas:', e);
      }
    }
  }, []);

  // Sync theme changes
  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('whiteboard_theme', 'dark');
      // If default stroke was black, change to white for dark mode
      if (currentStyles.strokeColor === '#1e1e1e') {
        setCurrentStyles((s) => ({ ...s, strokeColor: '#ffffff' }));
      }
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('whiteboard_theme', 'light');
      if (currentStyles.strokeColor === '#ffffff') {
        setCurrentStyles((s) => ({ ...s, strokeColor: '#1e1e1e' }));
      }
    }
  };

  // Auto-save active elements to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('whiteboard_elements', JSON.stringify(elements));
    } catch (e) {
      // Ignore quota exceeded
    }
  }, [elements]);

  // History Recording
  const recordHistory = useCallback(
    (newElements) => {
      setHistory((prev) => {
        const truncated = prev.slice(0, historyIndex + 1);
        return [...truncated, newElements];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setElements(history[targetIndex]);
      setHistoryIndex(targetIndex);
      setSelectedId(null);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setElements(history[targetIndex]);
      setHistoryIndex(targetIndex);
      setSelectedId(null);
    }
  }, [historyIndex, history]);

  // Update Style (for selected element or default)
  const handleUpdateStyle = (key, value) => {
    if (selectedId) {
      const updated = elements.map((elem) => {
        if (elem.id === selectedId) {
          return { ...elem, [key]: value };
        }
        return elem;
      });
      setElements(updated);
      recordHistory(updated);
    } else {
      setCurrentStyles((prev) => ({ ...prev, [key]: value }));
    }
  };

  // Delete Selected Element
  const handleDeleteSelected = useCallback(() => {
    if (selectedId) {
      const updated = elements.filter((elem) => elem.id !== selectedId);
      setElements(updated);
      recordHistory(updated);
      setSelectedId(null);
    }
  }, [selectedId, elements, recordHistory]);

  // Duplicate Selected Element
  const handleDuplicateSelected = useCallback(() => {
    if (!selectedId) return;
    const target = elements.find((elem) => elem.id === selectedId);
    if (!target) return;

    const newId = `elem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const duplicated = {
      ...target,
      id: newId,
      x: target.x + 20,
      y: target.y + 20,
    };
    if (target.type === 'freehand' && target.points) {
      duplicated.points = target.points.map(([px, py]) => [px + 20, py + 20]);
    }

    const updated = [...elements, duplicated];
    setElements(updated);
    recordHistory(updated);
    setSelectedId(newId);
  }, [selectedId, elements, recordHistory]);

  // Layer Ordering
  const handleSendToBack = useCallback(() => {
    if (!selectedId) return;
    const target = elements.find((e) => e.id === selectedId);
    if (!target) return;
    const filtered = elements.filter((e) => e.id !== selectedId);
    const updated = [target, ...filtered];
    setElements(updated);
    recordHistory(updated);
  }, [selectedId, elements, recordHistory]);

  const handleBringToFront = useCallback(() => {
    if (!selectedId) return;
    const target = elements.find((e) => e.id === selectedId);
    if (!target) return;
    const filtered = elements.filter((e) => e.id !== selectedId);
    const updated = [...filtered, target];
    setElements(updated);
    recordHistory(updated);
  }, [selectedId, elements, recordHistory]);

  // Clear Canvas
  const handleClearCanvas = () => {
    setElements([]);
    recordHistory([]);
    setSelectedId(null);
    setCurrentDrawingName('Untitled Drawing');
  };

  // Zoom Helpers
  const handleZoomIn = () => setZoom((z) => Math.min(3.0, Math.round((z + 0.1) * 10) / 10));
  const handleZoomOut = () => setZoom((z) => Math.max(0.1, Math.round((z - 0.1) * 10) / 10));
  const handleResetZoom = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept when typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      // Hotkeys: Tools
      if (e.key === '1' || e.key.toLowerCase() === 'v') setActiveTool('select');
      if (e.key === '2' || e.key.toLowerCase() === 'r') setActiveTool('rectangle');
      if (e.key === '3' || e.key.toLowerCase() === 'd') setActiveTool('diamond');
      if (e.key === '4' || e.key.toLowerCase() === 'o' || e.key.toLowerCase() === 'c') setActiveTool('circle');
      if (e.key === '5' || e.key.toLowerCase() === 'a') setActiveTool('arrow');
      if (e.key === '6' || e.key.toLowerCase() === 'l') setActiveTool('line');
      if (e.key === '7' || e.key.toLowerCase() === 'p') setActiveTool('freehand');
      if (e.key === '8' || e.key.toLowerCase() === 't') setActiveTool('text');
      if (e.key === '9' || e.key.toLowerCase() === 'e') setActiveTool('eraser');

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      }

      // Escape
      if (e.key === 'Escape') {
        setSelectedId(null);
        setActiveTool('select');
        setIsMenuOpen(false);
      }

      // Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }

      // Zoom
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
      if (e.key === '0') handleResetZoom();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteSelected, handleDuplicateSelected, handleUndo, handleRedo]);

  // Load from backend
  const handleLoadDrawing = (drawing) => {
    if (drawing && Array.isArray(drawing.elements)) {
      setElements(drawing.elements);
      recordHistory(drawing.elements);
      setSelectedId(null);
      setCurrentDrawingName(drawing.name || 'Untitled Drawing');
      if (drawing.appState) {
        if (drawing.appState.zoom) setZoom(drawing.appState.zoom);
        if (drawing.appState.pan) setPan(drawing.appState.pan);
      }
    }
  };

  // Load from local file
  const handleLoadJsonFile = async (file) => {
    try {
      const data = await loadFromJsonFile(file);
      setElements(data.elements || []);
      recordHistory(data.elements || []);
      setSelectedId(null);
      setCurrentDrawingName(file.name.replace(/\.[^/.]+$/, ''));
      alert(`Successfully loaded ${data.elements?.length || 0} elements from ${file.name}`);
    } catch (err) {
      alert(`Error loading file: ${err.message}`);
    }
  };

  const selectedElement = elements.find((e) => e.id === selectedId) || null;

  return (
    <main
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-app)',
      }}
    >
      {/* Top Left Menu Button */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <button
          onClick={() => setIsMenuOpen(true)}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Open Menu"
        >
          {Icons.menu}
        </button>

        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-muted)',
            display: 'none',
          }}
          className="md:inline"
        >
          {currentDrawingName}
        </span>
      </div>

      {/* Primary Floating Toolbar */}
      <DrawingToolbar activeTool={activeTool} onSelectTool={setActiveTool} />

      {/* Top Right Utility Controls (Theme Toggle & Help) */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <button
          onClick={() => setIsShortcutsOpen(true)}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Keyboard Shortcuts"
        >
          {Icons.help}
        </button>

        <button
          onClick={toggleTheme}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? Icons.sun : Icons.moon}
        </button>
      </div>

      {/* Left Contextual Properties Panel */}
      <PropertiesPanel
        selectedElement={selectedElement}
        currentStyles={currentStyles}
        onUpdateStyle={handleUpdateStyle}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={handleDuplicateSelected}
        onSendToBack={handleSendToBack}
        onBringToFront={handleBringToFront}
      />

      {/* Center Interactive Vector Canvas */}
      <CanvasWorkspace
        elements={elements}
        onElementsChange={setElements}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        currentStyles={currentStyles}
        selectedId={selectedId}
        onSelectElement={setSelectedId}
        pan={pan}
        onPanChange={setPan}
        zoom={zoom}
        onZoomChange={setZoom}
        isDark={isDark}
        onRecordHistory={recordHistory}
      />

      {/* Bottom Left Zoom & History Bar */}
      <BottomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Modals & Drawers */}
      <MainMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onClearCanvas={handleClearCanvas}
        onSaveJson={() => exportToJson(elements, { pan, zoom }, currentDrawingName)}
        onLoadJson={handleLoadJsonFile}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenSaveModal={() => setIsSaveOpen(true)}
        onOpenSavedDrawings={() => setIsSavedDrawingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        elements={elements}
        isDark={isDark}
      />

      <SaveModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        elements={elements}
        appState={{ pan, zoom }}
        currentDrawingName={currentDrawingName}
        onSavedSuccess={(saved) => {
          setCurrentDrawingName(saved.name);
          alert(`Drawing "${saved.name}" saved to backend!`);
        }}
      />

      <SavedDrawingsModal
        isOpen={isSavedDrawingsOpen}
        onClose={() => setIsSavedDrawingsOpen(false)}
        onLoadDrawing={handleLoadDrawing}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </main>
  );
}

