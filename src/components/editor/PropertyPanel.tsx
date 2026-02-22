import { useEditorStore, ComponentNode } from '../../store/useEditorStore';
import { Trash2, ChevronDown, Settings2, Palette, Zap } from 'lucide-react';

export default function PropertyPanel() {
  const { selectedId, layout, updateComponentProps, deleteComponent } = useEditorStore();

  const findComponent = (nodes: ComponentNode[]): ComponentNode | null => {
    for (const node of nodes) {
      if (node.id === selectedId) return node;
      const found = findComponent(node.children);
      if (found) return found;
    }
    return null;
  };

  const selectedComponent = selectedId ? findComponent(layout) : null;

  if (!selectedComponent) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Settings2 className="w-6 h-6 text-zinc-700" />
        </div>
        <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Nada Selecionado</h4>
        <p className="text-[10px] font-mono text-zinc-600 uppercase leading-relaxed">
          Selecione um elemento no canvas para editar suas propriedades.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-cyan-neon" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
            {selectedComponent.type}
          </span>
        </div>
        <button 
          onClick={() => deleteComponent(selectedComponent.id)}
          className="p-1.5 text-zinc-600 hover:text-magenta-neon transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Content Section */}
        <section>
          <h5 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ChevronDown className="w-3 h-3" /> Conteúdo
          </h5>
          <div className="space-y-4">
            {selectedComponent.props.text !== undefined && (
              <div>
                <label className="text-[9px] font-mono text-zinc-600 uppercase block mb-2">Texto</label>
                <textarea 
                  value={selectedComponent.props.text}
                  onChange={(e) => updateComponentProps(selectedComponent.id, { text: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-sm p-2 text-xs text-white focus:border-cyan-neon outline-none h-20 resize-none"
                />
              </div>
            )}
            {selectedComponent.props.src !== undefined && (
              <div>
                <label className="text-[9px] font-mono text-zinc-600 uppercase block mb-2">URL da Imagem</label>
                <input 
                  type="text"
                  value={selectedComponent.props.src}
                  onChange={(e) => updateComponentProps(selectedComponent.id, { src: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-sm p-2 text-xs text-white focus:border-cyan-neon outline-none"
                />
              </div>
            )}
          </div>
        </section>

        {/* Style Section */}
        <section>
          <h5 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ChevronDown className="w-3 h-3" /> Estilo (Tailwind)
          </h5>
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-mono text-zinc-600 uppercase block mb-2">Classes CSS</label>
              <textarea 
                value={selectedComponent.props.className}
                onChange={(e) => updateComponentProps(selectedComponent.id, { className: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-sm p-2 text-xs text-white font-mono focus:border-cyan-neon outline-none h-24 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Layout Section */}
        <section>
          <h5 className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ChevronDown className="w-3 h-3" /> Layout
          </h5>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-mono text-zinc-600 uppercase block mb-2">Padding</label>
              <select className="w-full bg-black border border-white/10 rounded-sm p-2 text-xs text-white outline-none">
                <option>p-0</option>
                <option>p-2</option>
                <option>p-4</option>
                <option>p-8</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-mono text-zinc-600 uppercase block mb-2">Margin</label>
              <select className="w-full bg-black border border-white/10 rounded-sm p-2 text-xs text-white outline-none">
                <option>m-0</option>
                <option>m-2</option>
                <option>m-4</option>
                <option>m-8</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
