import React, { useState, useRef } from 'react';
import {
  Layout,
  Model,
  TabNode,
  IJsonModel,
  Actions,
  TabSetNode,
  ITabSetRenderValues,
  DockLocation,
} from 'flexlayout-react';
import 'flexlayout-react/style/light.css';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { QuillProvider, useQuillContext } from '../QuillContext';
import FloatingToolbar from '../FloatingToolbar/FloatingToolbar'

// ================== Editor Component cho mỗi tab ==================
function QuillEditorTab({ tabId }: { tabId: string }) {
  const [value, setValue] = useState('');
  const quillRef = useRef<ReactQuill>(null);
  const { setActiveQuillRef } = useQuillContext();

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  const handleFocus = () => {
    if (quillRef.current) {
      setActiveQuillRef(quillRef);
    }
  };

  return (
    <div spellCheck={false} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={setValue}
        modules={modules}
        placeholder="Bắt đầu nhập nội dung..."
        style={{ flex: 1 }}
        id={`editor-${tabId}`}
        onFocus={handleFocus}
      />
    </div>
  );
}

// ================== Factory cho FlexLayout ==================
const factory = (node: TabNode) => {
  const component = node.getComponent();
  const tabId = node.getId();

  if (component === 'quill-editor') {
    return <QuillEditorTab tabId={tabId} />;
  }

  return <div>Unknown component</div>;
};

// ================== Initial Layout ==================
const initialJson: IJsonModel = {
  global: {},
  borders: [],
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'tabset',
        id: 'main',
        weight: 100,
        children: [
          {
            type: 'tab',
            id: 'welcome',
            name: 'Welcome',
            component: 'quill-editor',
          },
        ],
      },
    ],
  },
};

// ================== Main Component ==================
function MainPage() {
  const [model, setModel] = useState(Model.fromJson(initialJson));
  const nextTabId = useRef(2);

  const onRenderTabSet = (node: TabSetNode | any, renderValues: ITabSetRenderValues) => {
    if (node instanceof TabSetNode) {
      renderValues.stickyButtons.push(
        <button
          key="add-tab"
          className="flexlayout__tab_toolbar_button"
          title="Thêm tab mới"
          onClick={() => {
            const newTabId = `tab-${nextTabId.current++}`;

            model.doAction(
              Actions.addNode(
                {
                  type: 'tab',
                  id: newTabId,
                  name: `Tab ${nextTabId.current - 1}`,
                  component: 'quill-editor',
                },
                node.getId(),
                DockLocation.CENTER,
                -1
              )
            );
          }}
        >
          +
        </button>
      );
    }
  };

  return (
    <QuillProvider>
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <Layout
          model={model}
          factory={factory}
          onRenderTabSet={onRenderTabSet}
        />

        {/* Floating toolbar chung cho toàn bộ app */}
        <FloatingToolbar />
      </div>
    </QuillProvider>
  );
}

export default MainPage;