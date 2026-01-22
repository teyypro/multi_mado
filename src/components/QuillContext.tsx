import React, { createContext, useContext, useState, ReactNode } from 'react';
import ReactQuill from 'react-quill-new';

interface QuillContextType {
  activeQuillRef: React.RefObject<ReactQuill | null> | null;
  setActiveQuillRef: (ref: React.RefObject<ReactQuill | null> | null) => void;
}

const QuillContext = createContext<QuillContextType | undefined>(undefined);

export function QuillProvider({ children }: { children: ReactNode }) {
  const [activeQuillRef, setActiveQuillRef] = useState<React.RefObject<ReactQuill | null> | null>(null);

  return (
    <QuillContext.Provider value={{ activeQuillRef, setActiveQuillRef }}>
      {children}
    </QuillContext.Provider>
  );
}

export function useQuillContext() {
  const context = useContext(QuillContext);
  if (!context) {
    throw new Error('useQuillContext must be used within QuillProvider');
  }
  return context;
}