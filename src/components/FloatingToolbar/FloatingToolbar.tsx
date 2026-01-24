// src/components/FloatingToolbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useQuillContext } from '../QuillContext';
import { useSavedContent } from '../SaveData/SavedContentContext';
import SavedContentsViewer from '../SaveData/SavedContentsViewer';
import './FloatingToolbar.css';

// Puter.js sẽ được load qua script tag trong index.html
// <script src="https://js.puter.com/v2/"></script>

const FloatingToolbar: React.FC = () => {
  const { activeQuillRef } = useQuillContext();
  const { addSavedContent } = useSavedContent();

  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);

  // State cho màu
  const [textColor, setTextColor] = useState<string>('#000000');
  const [highlightColor, setHighlightColor] = useState<string>('#fff9c4');
  const [showColorPaletteFor, setShowColorPaletteFor] = useState<'text' | 'highlight' | null>(null);

  // State cho Save
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [isSaving, setIsSaving] = useState(false);
  const [isHoverSave, setIsHoverSave] = useState(false);
  const [showViewer, setShowViewer] = useState(false);

  // Puter TTS
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Danh sách màu
  const textPresetColors = [
    '#000000', '#ffffff', '#b91c1c', '#c2410c', '#a16207', '#047857',
    '#1d4ed8', '#6b21a8', '#be185d', '#7c2d12', '#334155', '#475569',
    '#5b21b6', '#0f766e',
  ];

  const highlightPresetColors = [
    '#FFF176', '#FFD54F', '#FFB74D', '#E57373', '#F06292', '#BA68C8',
    '#9575CD', '#7986CB', '#64B5F6', '#4FC3F7', '#4DB6AC', '#81C784',
    '#AED581', '#DCE775',
  ];

  // ── Xử lý hiển thị toolbar khi chọn text ──
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
        let top = e.clientY - 40;
        let left = e.clientX - 10;
        top = Math.max(10, top);
        left = Math.max(10, Math.min(window.innerWidth - 320, left));
        setPosition({ top, left });
        setVisible(true);
      } else {
        setVisible(false);
        setShowColorPaletteFor(null);
      }
    };

    const handleSelectionChange = () => {
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

  // ── Format helpers ──
  const toggleFormat = (format: string) => {
    const quill = activeQuillRef?.current?.getEditor?.();
    if (!quill) return;
    const range = quill.getSelection();
    if (!range || range.length === 0) return;
    const current = quill.getFormat(range);
    quill.format(format, !current[format]);
    quill.focus();
  };

  const applyFormat = (format: string, value: any) => {
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

  // ── Save content ──
  const handleSave = () => {
    const quill = activeQuillRef?.current?.getEditor?.();
    if (!quill) return;

    const range = quill.getSelection(true);
    let textToSave = range && range.length > 0
      ? quill.getText(range.index, range.length).trim()
      : quill.getText().trim();

    if (textToSave) {
      addSavedContent(textToSave);
      setSaveButtonText('Saved ✓');
      setIsSaving(true);
      setTimeout(() => {
        setSaveButtonText('Save');
        setIsSaving(false);
      }, 3000);
    } else {
      alert('No content to save!');
    }
  };

  // ── Puter.js Japanese TTS ──
  const handleReadAloud = async () => {
    if (isSpeaking) {
      // Nếu đang đọc → dừng lại
      try {
        // Puter không có stop trực tiếp, nhưng ta có thể reload page hoặc dùng hack
        // Cách đơn giản nhất: reload audio (nhưng không có API stop → thông báo)
        alert('Đang phát. Vui lòng chờ hết hoặc reload trang để dừng.');
      } catch {}
      return;
    }

    const quill = activeQuillRef?.current?.getEditor?.();
    if (!quill) return;

    const range = quill.getSelection(true);
    let textToRead = range && range.length > 0
      ? quill.getText(range.index, range.length).trim()
      : quill.getText().trim();

    if (!textToRead) {
      alert('No content to read!');
      return;
    }

    setIsSpeaking(true);

    try {
      // Puter TTS - Japanese (AWS Polly neural voices)
      const audio = await (window as any).puter.ai.txt2speech(textToRead, {
        language: 'ja-JP',
        //voice: 'Mizuki',        // Rất tự nhiên (nữ)
        voice: 'Kazuha',     // Nam - thay đổi nếu muốn
        engine: 'neural',
        provider: 'aws-polly',
      });

      audio.play();

      // Khi kết thúc → reset trạng thái
      audio.onended = () => {
        setIsSpeaking(false);
      };

      audio.onerror = (err: any) => {
        console.error('TTS error:', err);
        setIsSpeaking(false);
        alert('Không thể phát giọng nói. Vui lòng thử lại.');
      };
    } catch (err) {
      console.error('Puter TTS failed:', err);
      setIsSpeaking(false);
      alert('Lỗi kết nối Puter TTS. Vui lòng kiểm tra mạng.');
    }
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
            pointerEvents: 'auto',
          }}
        >
          <div className="toolbar-main">

            {/* Highlight Color */}
            <div
              className="color-picker-group"
              onMouseEnter={() => setShowColorPaletteFor('highlight')}
              onMouseLeave={() => setShowColorPaletteFor(null)}
            >
              <button
                className="color-btn highlight-btn"
                onClick={() => applyFormat('background', highlightColor)}
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
              onMouseLeave={() => setShowColorPaletteFor(null)}
            >
              <button
                className="color-btn"
                onClick={() => applyFormat('color', textColor)}
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

            {/* Save + View */}
            <div
              className="save-group"
              onMouseEnter={() => setIsHoverSave(true)}
              onMouseLeave={() => setIsHoverSave(false)}
            >
              <button
                onClick={handleSave}
                title="Save content"
                disabled={isSaving}
                className={`save-btn ${isSaving ? 'saving' : ''}`}
              >
                {saveButtonText}
              </button>

              {isHoverSave && (
                <button
                  onClick={() => setShowViewer(true)}
                  title="View saved contents"
                  className="view-btn"
                >
                  View
                </button>
              )}
            </div>

            {/* Read Aloud (Puter TTS - Japanese) */}
            <button
              onClick={handleReadAloud}
              title="Read Aloud (Japanese)"
              className={`read-btn ${isSpeaking ? 'speaking' : ''}`}
              disabled={isSpeaking}
            >
              {isSpeaking ? '⏹️' : '🔊'}
            </button>
          </div>
        </div>
      )}

      {/* Modal SavedContentsViewer */}
      {showViewer && (
        <div
          className="viewer-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowViewer(false);
          }}
        >
          <div className="viewer-modal">
            <button
              onClick={() => setShowViewer(false)}
              className="viewer-close-btn"
            >
              ✕
            </button>
            <SavedContentsViewer />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingToolbar;