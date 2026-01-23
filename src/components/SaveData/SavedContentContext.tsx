import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SavedContent {
  id: string;
  content: string;      // HTML string từ Quill
  timestamp: string;    // Thời gian lưu (định dạng dễ đọc)
}

interface SavedContentContextType {
  savedContents: SavedContent[];
  addSavedContent: (html: string) => void;
  clearAll: () => void;
}

const SavedContentContext = createContext<SavedContentContextType | undefined>(undefined);

export const SavedContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedContents, setSavedContents] = useState<SavedContent[]>([]);

  const addSavedContent = (html: string) => {
    const timestamp = new Date().toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newItem: SavedContent = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content: html,
      timestamp,
    };

    setSavedContents((prev) => [newItem, ...prev]);
  };

  const clearAll = () => {
    setSavedContents([]);
  };

  return (
    <SavedContentContext.Provider value={{ savedContents, addSavedContent, clearAll }}>
      {children}
    </SavedContentContext.Provider>
  );
};

export const useSavedContent = () => {
  const context = useContext(SavedContentContext);
  if (!context) {
    throw new Error('useSavedContent phải được dùng trong SavedContentProvider');
  }
  return context;
};