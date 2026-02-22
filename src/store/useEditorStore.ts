import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ComponentNode {
  id: string;
  type: string;
  props: any;
  children: ComponentNode[];
}

interface EditorState {
  layout: ComponentNode[];
  history: ComponentNode[][];
  historyIndex: number;
  selectedId: string | null;
  
  // Actions
  setLayout: (layout: ComponentNode[]) => void;
  addComponent: (type: string, parentId?: string) => void;
  updateComponentProps: (id: string, props: any) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  loadLayout: (layout: ComponentNode[]) => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
}

const initialLayout: ComponentNode[] = [
  {
    id: 'root',
    type: 'Container',
    props: { className: 'min-h-screen bg-white p-8' },
    children: [
      {
        id: 'header-1',
        type: 'Heading',
        props: { text: 'Bem-vindo ao seu novo site', level: 1, className: 'text-4xl font-bold mb-4' },
        children: []
      },
      {
        id: 'text-1',
        type: 'Text',
        props: { text: 'Arraste componentes para começar a editar.', className: 'text-gray-600' },
        children: []
      }
    ]
  }
];

export const useEditorStore = create<EditorState>()(
  persist(
    (set, get) => ({
      layout: initialLayout,
      history: [initialLayout],
      historyIndex: 0,
      selectedId: null,

      setLayout: (layout) => set({ layout }),

      saveToHistory: () => {
        const { layout, history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(layout)));
        set({
          history: newHistory,
          historyIndex: newHistory.length - 1
        });
      },

      addComponent: (type, parentId = 'root') => {
        const newComponent: ComponentNode = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          props: getDefaultProps(type),
          children: []
        };

        const updateChildren = (nodes: ComponentNode[]): ComponentNode[] => {
          return nodes.map(node => {
            if (node.id === parentId) {
              return { ...node, children: [...node.children, newComponent] };
            }
            return { ...node, children: updateChildren(node.children) };
          });
        };

        set(state => ({ layout: updateChildren(state.layout) }));
        get().saveToHistory();
      },

      updateComponentProps: (id, props) => {
        const updateNodes = (nodes: ComponentNode[]): ComponentNode[] => {
          return nodes.map(node => {
            if (node.id === id) {
              return { ...node, props: { ...node.props, ...props } };
            }
            return { ...node, children: updateNodes(node.children) };
          });
        };

        set(state => ({ layout: updateNodes(state.layout) }));
        get().saveToHistory();
      },

      deleteComponent: (id) => {
        if (id === 'root') return;
        const deleteFromNodes = (nodes: ComponentNode[]): ComponentNode[] => {
          return nodes
            .filter(node => node.id !== id)
            .map(node => ({ ...node, children: deleteFromNodes(node.children) }));
        };

        set(state => ({ 
          layout: deleteFromNodes(state.layout),
          selectedId: state.selectedId === id ? null : state.selectedId
        }));
        get().saveToHistory();
      },

      selectComponent: (id) => set({ selectedId: id }),

      loadLayout: (layout) => set({ 
        layout, 
        history: [layout], 
        historyIndex: 0,
        selectedId: null 
      }),

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          set({
            layout: JSON.parse(JSON.stringify(history[historyIndex - 1])),
            historyIndex: historyIndex - 1
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          set({
            layout: JSON.parse(JSON.stringify(history[historyIndex + 1])),
            historyIndex: historyIndex + 1
          });
        }
      }
    }),
    {
      name: 'aetheris-editor-storage',
    }
  )
);

function getDefaultProps(type: string) {
  switch (type) {
    case 'Heading': return { text: 'Novo Título', level: 2, className: 'text-2xl font-bold my-4' };
    case 'Text': return { text: 'Novo parágrafo de texto.', className: 'text-base my-2' };
    case 'Button': return { text: 'Clique Aqui', className: 'px-4 py-2 bg-blue-600 text-white rounded' };
    case 'Image': return { src: 'https://picsum.photos/400/300', alt: 'Placeholder', className: 'w-full rounded' };
    case 'Container': return { className: 'p-4 border border-dashed border-gray-300 rounded my-4' };
    default: return {};
  }
}
