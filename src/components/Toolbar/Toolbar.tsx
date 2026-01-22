// src/components/Toolbar.tsx
import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  TextFormatType,
} from 'lexical';

interface ToolbarProps {
  // Có thể thêm props nếu cần tùy chỉnh sau này
}

const Toolbar: React.FC<ToolbarProps> = () => {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState<Set<TextFormatType>>(new Set());

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const newFormats = new Set<TextFormatType>();
          if (selection.hasFormat('bold')) newFormats.add('bold');
          if (selection.hasFormat('italic')) newFormats.add('italic');
          if (selection.hasFormat('underline')) newFormats.add('underline');
          // Thêm các format khác nếu cần: 'code', 'strikethrough', 'subscript',...
          setActiveFormats(newFormats);
        } else {
          setActiveFormats(new Set());
        }
      });
    });
  }, [editor]);

  const toggleFormat = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '50px',
        background: '#f0f0f0',
        borderBottom: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        zIndex: 1000,
        gap: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <button
        onClick={() => toggleFormat('bold')}
        style={{
          fontWeight: activeFormats.has('bold') ? 'bold' : 'normal',
          background: activeFormats.has('bold') ? '#ddd' : 'transparent',
          padding: '6px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Bold
      </button>
      <button
        onClick={() => toggleFormat('italic')}
        style={{
          fontStyle: activeFormats.has('italic') ? 'italic' : 'normal',
          background: activeFormats.has('italic') ? '#ddd' : 'transparent',
          padding: '6px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Italic
      </button>
      <button
        onClick={() => toggleFormat('underline')}
        style={{
          textDecoration: activeFormats.has('underline') ? 'underline' : 'none',
          background: activeFormats.has('underline') ? '#ddd' : 'transparent',
          padding: '6px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Underline
      </button>

      {/* Bạn có thể thêm các nút khác ở đây */}
    </div>
  );
};

export default Toolbar;