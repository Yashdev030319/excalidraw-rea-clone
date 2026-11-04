import React, { useEffect, useRef, useState } from 'react';

export default function InlineTextEditor({
  x,
  y,
  zoom,
  pan,
  initialText = '',
  fontSize = 22,
  strokeColor = '#1e1e1e',
  onCommit,
  onCancel,
}) {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef(null);

  // Screen coordinates
  const screenX = x * zoom + pan.x;
  const screenY = y * zoom + pan.y;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      adjustSize();
    }
  }, []);

  const adjustSize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(30, textareaRef.current.scrollHeight)}px`;
      textareaRef.current.style.width = 'auto';
      textareaRef.current.style.width = `${Math.max(120, textareaRef.current.scrollWidth + 10)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onCommit(text);
    }
  };

  const handleBlur = () => {
    onCommit(text);
  };

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        adjustSize();
      }}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      style={{
        position: 'absolute',
        top: screenY,
        left: screenX,
        fontFamily: '"Caveat", "Virgil", "Comic Sans MS", cursive, sans-serif',
        fontSize: `${fontSize * zoom}px`,
        lineHeight: 1.25,
        color: strokeColor,
        background: 'transparent',
        border: '1px dashed #3b82f6',
        borderRadius: 4,
        padding: '2px 4px',
        margin: 0,
        outline: 'none',
        resize: 'none',
        overflow: 'hidden',
        whiteSpace: 'pre',
        zIndex: 60,
        minWidth: 100,
        minHeight: 32,
      }}
    />
  );
}

