import React from 'react';
import { useSavedContent } from './SavedContentContext';
import './SavedContentsViewer.css';

const SavedContentsViewer: React.FC = () => {
  const { savedContents, clearAll } = useSavedContent();

  const copyToClipboard = (text: string, message = 'Đã sao chép nội dung!') => {
    navigator.clipboard.writeText(text).then(
      () => alert(message),
      (err) => alert('Không thể sao chép: ' + err)
    );
  };

  // Copy tất cả nội dung đã lưu (ghép lại thành một khối text)
  const copyAll = () => {
    const allText = savedContents
      .map((item) => `${item.content}`)
      .join('\n');
    copyToClipboard(allText, 'Đã sao chép tất cả nội dung!');
  };

  return (
    <div className="saved-viewer-container">
      <h2>Nội dung đã lưu ({savedContents.length})</h2>

      {savedContents.length === 0 ? (
        <p className="no-content">Chưa có nội dung nào được lưu.</p>
      ) : (
        <>
          <div className="header-actions">
            <button className="clear-all-btn" onClick={clearAll}>
              Xóa tất cả
            </button>
            <button className="copy-all-btn" onClick={copyAll}>
              Copy tất cả
            </button>
          </div>

          {savedContents.map((item) => (
            <div key={item.id} className="saved-item">
              <div className="item-header">
                <small className="timestamp">Lưu lúc: {item.timestamp}</small>
                <button
                  className="copy-item-btn"
                  onClick={() => copyToClipboard(item.content)}
                >
                  Copy
                </button>
              </div>

              {/* Hiển thị nội dung dạng text thuần, giữ nguyên xuống dòng */}
              <div className="content-display">
                {item.content}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default SavedContentsViewer;