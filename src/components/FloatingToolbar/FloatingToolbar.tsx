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
    if (!quill) return;

    let mouseDown = false;

    const handleMouseDown = () => {
      mouseDown = true;
      setVisible(false);
      setShowColorPaletteFor(null);
    };

    const handleMouseUp = (e: MouseEvent) => {
      mouseDown = false;

      const range = quill.getSelection();
      if (range && range.length > 0) {
        // Lấy tọa độ chuột lúc thả chuột
        let top = e.clientY;
        let left = e.clientX;

        // Dịch toolbar lên trên và lệch trái để không che vùng text
        top -= 40;   // cách phía trên con trỏ khoảng 70px
        left -= 10; // lệch trái khoảng 150px (tùy độ rộng toolbar của bạn)

        // Giới hạn không cho toolbar ra ngoài màn hình
        top = Math.max(10, top);
        left = Math.max(10, Math.min(window.innerWidth - 320, left)); // 320 là độ rộng ước tính của toolbar

        setPosition({ top, left });
        setVisible(true);
      } else {
        setVisible(false);
        setShowColorPaletteFor(null);
      }
    };

    const handleSelectionChange = () => {
      // Chỉ ẩn khi không có selection và không đang bấm chuột
      if (!mouseDown) {
        const range = quill.getSelection();
        if (!range || range.length === 0) {
          setVisible(false);
          setShowColorPaletteFor(null);
        }
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setShowColorPaletteFor(null);
      }
    };

    // Thêm event listener vào vùng soạn thảo Quill
    quill.root.addEventListener('mousedown', handleMouseDown);
    quill.root.addEventListener('mouseup', handleMouseUp as EventListener);

    quill.on('selection-change', handleSelectionChange);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', () => setVisible(false), true);

    return () => {
      quill.root.removeEventListener('mousedown', handleMouseDown);
      quill.root.removeEventListener('mouseup', handleMouseUp as EventListener);
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

  const applyCurrentTextColor = () => {
    applyFormat('color', textColor);
    setShowColorPaletteFor(null);
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
            pointerEvents: 'auto', // đảm bảo toolbar có thể click được
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
            >
              <button
                className="color-btn"
                onClick={applyCurrentTextColor}
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
                onClick={applyCurrentHighlightColor}
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