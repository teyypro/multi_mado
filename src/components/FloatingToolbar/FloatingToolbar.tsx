import React, { useState, useEffect, useRef } from 'react';
import { useQuillContext } from '../QuillContext';
import './FloatingToolbar.css';

const FloatingToolbar: React.FC = () => {
  const { activeQuillRef } = useQuillContext();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Refs cho input color
  const textColorInputRef = useRef<HTMLInputElement>(null);
  const highlightColorInputRef = useRef<HTMLInputElement>(null);

  // State lưu màu (dùng để hiển thị trên nút)
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');

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
          const top = editorRect.top + bounds.top - 60;
          const left = editorRect.left + bounds.left + bounds.width / 2 - 140;

          const finalTop = Math.max(10, top);
          const finalLeft = Math.max(10, Math.min(window.innerWidth - 300, left));

          setPosition({ top: finalTop, left: finalLeft });
          setVisible(true);
        }
      } else {
        setVisible(false);
      }
    };

    quill.on('selection-change', handleSelectionChange);

    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        // Không cần ẩn gì nữa
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

  // Hàm toggle định dạng (bold, italic, underline)
  const toggleFormat = (format: string) => {
    const quill = activeQuillRef?.current?.getEditor?.();
    if (!quill) return;

    const range = quill.getSelection();
    if (!range || range.length === 0) return;

    // Lấy trạng thái hiện tại của định dạng trong selection
    const currentFormat = quill.getFormat(range);

    // Toggle: nếu đang bật → tắt, ngược lại bật
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

  const openTextColorPicker = () => {
    textColorInputRef.current?.click();
  };

  const openHighlightPicker = () => {
    highlightColorInputRef.current?.click();
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
          {/* Bold - toggle */}
          <button onClick={() => toggleFormat('bold')} title="Bold">
            <strong>B</strong>
          </button>

          {/* Italic - toggle */}
          <button onClick={() => toggleFormat('italic')} title="Italic">
            <em>I</em>
          </button>

          {/* Underline - toggle */}
          <button onClick={() => toggleFormat('underline')} title="Underline">
            <u>U</u>
          </button>

          {/* Text Color */}
          <div className="color-picker-wrapper">
            <button
              className="color-btn"
              onClick={openTextColorPicker}
              title="Text Color"
              style={{ color: textColor }}
            >
              A
            </button>

            <input
              type="color"
              ref={textColorInputRef}
              value={textColor}
              onChange={(e) => {
                const newColor = e.target.value;
                setTextColor(newColor);
                applyFormat('color', newColor);
              }}
              style={{ display: 'none' }}
            />
          </div>

          {/* Highlight */}
          <div className="color-picker-wrapper">
            <button
              className="color-btn highlight-btn"
              onClick={openHighlightPicker}
              title="Highlight"
              style={{ backgroundColor: highlightColor }}
            >
              H
            </button>

            <input
              type="color"
              ref={highlightColorInputRef}
              value={highlightColor}
              onChange={(e) => {
                const newColor = e.target.value;
                setHighlightColor(newColor);
                applyFormat('background', newColor);
              }}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingToolbar;