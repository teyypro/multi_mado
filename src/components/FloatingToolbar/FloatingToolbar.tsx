import React, { useState, useEffect, useRef } from 'react';
import { useQuillContext } from '../QuillContext';
import './FloatingToolbar.css';
import { useSavedContent } from '../SaveData/SavedContentContext';
import SavedContentsViewer from '../SaveData/SavedContentsViewer';

const FloatingToolbar: React.FC = () => {
  const { activeQuillRef } = useQuillContext();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { addSavedContent } = useSavedContent();

  // State cho màu hiện tại
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#fff9c4');

  // State kiểm soát hiển thị palette
  const [showColorPaletteFor, setShowColorPaletteFor] = useState<'text' | 'highlight' | null>(null);

  // State cho nút Save
  const [saveButtonText, setSaveButtonText] = useState('Save');
  const [isSaving, setIsSaving] = useState(false);

  // State cho việc hiển thị SavedContentsViewer
  const [showViewer, setShowViewer] = useState(false);

  // Hover state cho nút Save
  const [isHoverSave, setIsHoverSave] = useState(false);

  // Ref để lưu giọng nói tốt nhất (chỉ set 1 lần)
  const bestJapaneseVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Danh sách màu cho TEXT
const textPresetColors = [
  '#000000',        // 1. Đen (pure black)
  '#ffffff',        // 2. Trắng (pure white)

  '#b91c1c',        // 3. Đỏ đậm
  '#c2410c',        // 4. Cam đậm
  '#a16207',        // 5. Vàng đậm
  '#047857',        // 6. Xanh lá đậm
  '#1d4ed8',        // 7. Xanh dương đậm
  '#6b21a8',        // 8. Tím đậm
  '#be185d',        // 9. Hồng đậm
  '#7c2d12',        // 10. Nâu đỏ
  '#334155',        // 11. Xám đậm (slate)
  '#475569',        // 12. Xám trung
  '#5b21b6',        // 13. Violet đậm (một sắc tím khác biệt)
  '#0f766e',        // 14. Teal đậm (xanh ngọc đậm, rất đẹp và phổ biến)
];

const highlightPresetColors = [
  '#FFF176',    // Vàng đậm vừa (yellow-300) – highlight kinh điển
  '#FFD54F',    // Vàng cam đậm vừa (amber-300)
  '#FFB74D',    // Cam đậm vừa (orange-300)
  '#E57373',    // Đỏ/hồng đậm vừa (red-300)
  '#F06292',    // Hồng đậm vừa (pink-300)
  '#BA68C8',    // Tím đậm vừa (purple-300)
  '#9575CD',    // Violet đậm vừa (deep purple-300)
  '#7986CB',    // Xanh dương đậm vừa (indigo-300)
  '#64B5F6',    // Xanh dương sáng đậm vừa (blue-300)
  '#4FC3F7',    // Cyan đậm vừa (cyan-300)
  '#4DB6AC',    // Xanh ngọc đậm vừa (teal-300)
  '#81C784',    // Xanh lá đậm vừa (green-300)
  '#AED581',    // Xanh lá sáng đậm vừa (light green-300)
  '#DCE775',    // Lime đậm vừa (lime-300)
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
        let top = e.clientY;
        let left = e.clientX;

        top -= 40;
        left -= 10;

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

  const handleSave = () => {
    const quill = activeQuillRef?.current?.getEditor?.();
    if (!quill) return;

    const range = quill.getSelection(true);
    let textToSave = '';

    if (range && range.length > 0) {
      textToSave = quill.getText(range.index, range.length).trim();
    } else {
      textToSave = quill.getText().trim();
    }

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

  // ── Chọn giọng nói tốt nhất chỉ 1 lần khi mount ──
  useEffect(() => {
    const loadAndSelectBestVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const japaneseVoices = voices.filter(voice => voice.lang === 'ja-JP' || voice.lang === 'ja_JP');

      if (japaneseVoices.length > 0) {
        const preferredVoices = [
          'Google 日本語',
          'Microsoft Haruka - Japanese',
          'Microsoft Nanami - Japanese',
          'Kyoko',
        ];

        let bestVoice = japaneseVoices.find(voice =>
          preferredVoices.some(name => voice.name.includes(name))
        );

        if (!bestVoice) {
          bestVoice = japaneseVoices[0];
        }

        bestJapaneseVoiceRef.current = bestVoice;
      }
    };

    // Gọi lần đầu
    loadAndSelectBestVoice();

    // Đăng ký event để load lại nếu voices chưa sẵn sàng
    window.speechSynthesis.onvoiceschanged = loadAndSelectBestVoice;

    // Cleanup
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  // ── Read Aloud: Nhấn nhiều lần sẽ xếp hàng đọc liên tục ──
  const handleReadAloud = () => {
    const quill = activeQuillRef?.current?.getEditor?.();
    if (!quill) return;

    const range = quill.getSelection(true);
    let textToRead = '';

    if (range && range.length > 0) {
      textToRead = quill.getText(range.index, range.length).trim();
    } else {
      textToRead = quill.getText().trim();
    }

    if (!textToRead) {
      alert('No content to read!');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'ja-JP';

    // Sử dụng giọng đã chọn trước đó (nếu có)
    if (bestJapaneseVoiceRef.current) {
      utterance.voice = bestJapaneseVoiceRef.current;
    }

    utterance.rate = 0.7;
    utterance.pitch = 0.8;
    utterance.volume = 2.0;

    utterance.onerror = (e) => {
      console.error('Speech error:', e);
    };

    window.speechSynthesis.speak(utterance);
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

            {/* Read Aloud Button */}
            <button
              onClick={handleReadAloud}
              title="Read Aloud"
              className="read-btn"
            >
              🔊
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