import React, { useState, useEffect, useRef } from 'react';
import { useQuillContext } from '../QuillContext';
import './FloatingToolbar.css';

const FloatingToolbar: React.FC = () => {
  const { activeQuillRef } = useQuillContext();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  // State cho màu hiện tại
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#fff9c4');

  // State kiểm soát hiển thị palette
  const [showColorPaletteFor, setShowColorPaletteFor] = useState<'text' | 'highlight' | null>(null);

  // Danh sách màu cho TEXT
  const textPresetColors = [
    '#000000', '#ffffff', '#d32f2f', '#388e3c', '#1976d2',
    '#f57c00', '#7b1fa2', '#0288d1', '#689f38', '#e64a19',
    '#455a64', '#757575', '#ef5350', '#ab47bc',
  ];

  // Danh sách màu HIGHLIGHT
  const highlightPresetColors = [
    '#FFFFFF', '#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#0000FF', '#FF0000',
    '#B3D4FF', '#B2DFDB', '#C8E6C9', '#E1BEE7', '#FFCDD2', '#FFF9C4', '#000000',
  ];

  useEffect(() => {
    const quill = activeQuillRef?.current?.getEditor?.();
    if (!quill) {
      setVisible(false);
      return;
    }

    const handleSelectionChange = () => {
      const range = quill.getSelection();
      if (range && range.length > 0) {
        const bounds = quill.getBounds(range.index, range.length);
        if (bounds) {
          const editorRect = quill.container.getBoundingClientRect();
          const top = editorRect.top + bounds.top - 100;
          const left = editorRect.left + bounds.left + bounds.width / 2 - 140;

          const finalTop = Math.max(10, top);
          const finalLeft = Math.max(10, Math.min(window.innerWidth - 300, left));

          setPosition({ top: finalTop, left: finalLeft });
          setVisible(true);
        }
      } else {
        setVisible(false);
        setShowColorPaletteFor(null);
      }
    };

    quill.on('selection-change', handleSelectionChange);

    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowColorPaletteFor(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', () => setVisible(false), true);

    return () => {
      quill.off('selection-change', handleSelectionChange);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', () => setVisible(false), true);
    };
  }, [activeQuillRef]);

  const toggleFormat = (format: string) => {
    const quill = activeQuillRef?.current?.getEditor?.();
    if (!quill) return;

    const range = quill.getSelection();
    if (!range || range.length === 0) return;

    const currentFormat = quill.getFormat(range);
    const newValue = !currentFormat[format];

    quill.format(format, newValue);
    quill.focus();
  };

  const applyFormat = (format: string, value: any = true) => {
    const quill = activeQuillRef?.current?.getEditor?.();
    if (quill) {
      quill.format(format, value);
      quill.focus();
    }
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    applyFormat('color', color);
    setShowColorPaletteFor(null);
  };

  const handleHighlightColorChange = (color: string) => {
    setHighlightColor(color);
    applyFormat('background', color);
    setShowColorPaletteFor(null);
  };

  // Áp dụng màu hiện tại khi click button
  const applyCurrentTextColor = () => {
    applyFormat('color', textColor);
    setShowColorPaletteFor(null); // Đóng palette nếu đang mở
  };

  const applyCurrentHighlightColor = () => {
    applyFormat('background', highlightColor);
    setShowColorPaletteFor(null);
  };

  return (
    <>
      {visible && (
        <div
          ref={toolbarRef}
          className="floating-toolbar"
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 10000,
          }}
        >
          <div className="toolbar-main">
            <button onClick={() => toggleFormat('bold')} title="Bold">
              <strong>B</strong>
            </button>

            <button onClick={() => toggleFormat('italic')} title="Italic">
              <em>I</em>
            </button>

            <button onClick={() => toggleFormat('underline')} title="Underline">
              <u>U</u>
            </button>

            {/* Text Color */}
            <div
              className="color-picker-group"
              onMouseEnter={() => setShowColorPaletteFor('text')}
              // onMouseLeave={() => setShowColorPaletteFor(null)}
            >
              <button
                className="color-btn"
                onClick={applyCurrentTextColor}           // Click → áp dụng màu hiện tại
                title="Text Color (Click to apply current / Hover to choose)"
                style={{ color: textColor }}
              >
                A
              </button>

              {showColorPaletteFor === 'text' && (
                <div className="color-palette">
                  {textPresetColors.map((color) => (
                    <button
                      key={color}
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      onClick={() => handleTextColorChange(color)}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Highlight Color */}
            <div
              className="color-picker-group"
              onMouseEnter={() => setShowColorPaletteFor('highlight')}
              onMouseLeave={() => setShowColorPaletteFor(null)}
            >
              <button
                className="color-btn highlight-btn"
                onClick={applyCurrentHighlightColor}     // Click → áp dụng màu hiện tại
                title="Highlight (Click to apply current / Hover to choose)"
                style={{ backgroundColor: highlightColor }}
              >
                H
              </button>

              {showColorPaletteFor === 'highlight' && (
                <div className="color-palette">
                  {highlightPresetColors.map((color) => (
                    <button
                      key={color}
                      className="color-swatch"
                      style={{ backgroundColor: color }}
                      onClick={() => handleHighlightColorChange(color)}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>

            <button title="Save selection">
              💾 Save
            </button>

            <button title="Read aloud">
              🔊 Read
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingToolbar;