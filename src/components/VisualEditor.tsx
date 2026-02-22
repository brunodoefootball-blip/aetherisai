import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from 'motion/react';
import { 
  ChevronLeft, Save, Rocket, Undo, Redo, 
  Monitor, Smartphone, Tablet, Eye, Code,
  Settings, Layers, Palette
} from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import Canvas from './editor/Canvas';
import ComponentPalette from './editor/ComponentPalette';
import PropertyPanel from './editor/PropertyPanel';
import { useState, useEffect, useCallback } from 'react';

export default function VisualEditor({ onClose, project }: { onClose: () => void, project: any }) {
  const { undo, redo, layout, historyIndex, history, selectedId, loadLayout } = useEditorStore();
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [sidebarTab, setSidebarTab] = useState<'components' | 'layers' | 'settings'>('components');
  const [isSaving, setIsSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [showDeploy, setShowDeploy] = useState(false);
  const [subdomain, setSubdomain] = useState("");

  // Load initial layout
  useEffect(() => {
    if (project?.layout) {
      try {
        const layoutStr = typeof project.layout === 'string' ? project.layout : JSON.stringify(project.layout);
        if (layoutStr && layoutStr !== '""') {
          const parsed = JSON.parse(layoutStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadLayout(parsed);
          }
        }
      } catch (e) {
        console.error("Failed to parse project layout", e);
      }
    }
  }, [project, loadLayout]);

  const handleSave = useCallback(async () => {
    if (!project?.id) return;
    setIsSaving(true);
    try {
      let configObj = {};
      if (project.config) {
        try {
          configObj = typeof project.config === 'string' ? JSON.parse(project.config) : project.config;
        } catch (e) {
          console.error("Failed to parse project config", e);
        }
      }

      await fetch(`/api/projects/${project.id}/layout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout, config: configObj })
      });
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setIsSaving(false);
    }
  }, [project, layout]);

  // Auto-save every 60 seconds
  useEffect(() => {
    const timer = setInterval(handleSave, 60000);
    return () => clearInterval(timer);
  }, [handleSave]);

  const fetchVersions = async () => {
    const res = await fetch(`/api/projects/${project.id}/versions`);
    const data = await res.json();
    setVersions(data);
    setShowVersions(true);
  };

  const handleDeploy = async () => {
    if (!subdomain) return alert("Digite um subdomínio");
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, subdomain })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Site publicado com sucesso em: ${data.url}`);
        setShowDeploy(false);
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col text-white font-sans overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#111]">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-sm transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-white/10" />
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">
              {project?.name || 'Novo Projeto'}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-black/40 p-1 rounded-sm border border-white/5">
            <button 
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded-sm transition-all ${viewMode === 'desktop' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('tablet')}
              className={`p-2 rounded-sm transition-all ${viewMode === 'tablet' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded-sm transition-all ${viewMode === 'mobile' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 mr-4">
              <button 
                onClick={undo} 
                disabled={historyIndex === 0}
                className="p-2 text-zinc-500 hover:text-white disabled:opacity-20"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button 
                onClick={redo}
                disabled={historyIndex === history.length - 1}
                className="p-2 text-zinc-500 hover:text-white disabled:opacity-20"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
            
            <button 
              onClick={fetchVersions}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest rounded-sm transition-all"
            >
              <Layers className="w-3.5 h-3.5" /> Versões
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" /> {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
            <button 
              onClick={() => setShowDeploy(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-neon text-black text-xs font-bold uppercase tracking-widest rounded-sm transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)]"
            >
              <Rocket className="w-3.5 h-3.5" /> Publicar
            </button>
          </div>
        </header>

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <aside className="w-72 border-r border-white/5 bg-[#111] flex flex-col">
            <div className="flex border-b border-white/5">
              <button 
                onClick={() => setSidebarTab('components')}
                className={`flex-1 py-3 flex justify-center transition-all ${sidebarTab === 'components' ? 'text-cyan-neon border-b-2 border-cyan-neon' : 'text-zinc-500'}`}
              >
                <Layers className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSidebarTab('layers')}
                className={`flex-1 py-3 flex justify-center transition-all ${sidebarTab === 'layers' ? 'text-cyan-neon border-b-2 border-cyan-neon' : 'text-zinc-500'}`}
              >
                <Palette className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSidebarTab('settings')}
                className={`flex-1 py-3 flex justify-center transition-all ${sidebarTab === 'settings' ? 'text-cyan-neon border-b-2 border-cyan-neon' : 'text-zinc-500'}`}
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidebarTab === 'components' && <ComponentPalette />}
              {sidebarTab === 'layers' && <div className="p-4 text-zinc-500 text-xs uppercase font-mono">Estrutura de Camadas</div>}
              {sidebarTab === 'settings' && <div className="p-4 text-zinc-500 text-xs uppercase font-mono">Configurações do Projeto</div>}
            </div>
          </aside>

          {/* Canvas Area */}
          <main className="flex-1 bg-[#1a1a1a] overflow-auto p-12 flex justify-center items-start scrollbar-hide">
            <div className={`transition-all duration-500 shadow-2xl bg-white ${
              viewMode === 'desktop' ? 'w-full max-w-6xl' : 
              viewMode === 'tablet' ? 'w-[768px]' : 'w-[375px]'
            }`}>
              <Canvas />
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="w-72 border-l border-white/5 bg-[#111] overflow-y-auto">
            <PropertyPanel />
          </aside>
        </div>

        {/* Footer Status Bar */}
        <footer className="h-8 border-t border-white/5 bg-[#111] px-4 flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-neon" />
              Editor Pronto
            </div>
            <div>{layout.length} Componentes Raiz</div>
            {isSaving && <div className="text-cyan-neon animate-pulse">Salvando alterações...</div>}
          </div>
          <div className="flex items-center gap-4">
            {selectedId && <div>Selecionado: {selectedId}</div>}
            <div>v3.0.0-alpha</div>
          </div>
        </footer>

        {/* Versions Modal */}
        {showVersions && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowVersions(false)} />
            <div className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-sm p-8 max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest mb-6">Histórico de Versões</h3>
              <div className="space-y-4">
                {versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 hover:border-cyan-neon/30 transition-all">
                    <div>
                      <div className="text-xs font-bold text-white">{new Date(v.created_at).toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-1">Backup Automático</div>
                    </div>
                    <button 
                      onClick={() => {
                        loadLayout(JSON.parse(v.layout));
                        setShowVersions(false);
                      }}
                      className="px-4 py-2 bg-white/5 hover:bg-white text-zinc-400 hover:text-black text-[10px] font-mono uppercase tracking-widest transition-all"
                    >
                      Restaurar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Deploy Modal */}
        {showDeploy && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDeploy(false)} />
            <div className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-sm p-8">
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest mb-2">Publicar Projeto</h3>
              <p className="text-zinc-500 text-xs mb-8">Escolha um subdomínio para o seu site.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">Subdomínio</label>
                  <div className="flex items-center">
                    <input 
                      type="text" 
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      placeholder="meu-site" 
                      className="flex-1 bg-black border border-white/10 p-3 text-white text-xs focus:border-cyan-neon outline-none" 
                    />
                    <span className="px-4 py-3 bg-white/5 border border-l-0 border-white/10 text-zinc-500 text-xs font-mono">.aetheris.ai</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleDeploy}
                  className="w-full py-4 bg-cyan-neon text-black font-bold text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(0,245,255,0.3)]"
                >
                  Confirmar Publicação
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
