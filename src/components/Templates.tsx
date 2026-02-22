import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Layout, Sparkles, ChevronRight, Zap, ArrowRight,
  RefreshCw, Wand2, Check, AlertCircle, Loader2
} from "lucide-react";

interface TemplatePrompt {
  id: number;
  category: string;
  simple_prompt: string;
  medium_prompt: string;
  complex_prompt: string;
}

export default function Templates({ onSelect, userId }: { onSelect: (prompt: string) => void, userId: number }) {
  const [templates, setTemplates] = useState<TemplatePrompt[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [improving, setImproving] = useState(false);
  const [remainingImprovements, setRemainingImprovements] = useState(100);

  useEffect(() => {
    fetch("/api/template-prompts")
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        setLoading(false);
      });
  }, []);

  const improvePrompt = async (prompt: string, type: 'simple' | 'medium' | 'complex') => {
    setImproving(true);
    try {
      const res = await fetch("/api/improve-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, prompt })
      });
      const data = await res.json();
      if (res.ok) {
        setRemainingImprovements(data.remaining);
        if (selectedTemplate) {
          const updated = { ...selectedTemplate };
          if (type === 'simple') updated.simple_prompt = data.improved;
          if (type === 'medium') updated.medium_prompt = data.improved;
          if (type === 'complex') updated.complex_prompt = data.improved;
          setSelectedTemplate(updated);
        }
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImproving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-neon" /></div>;

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {!selectedTemplate ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className="bg-surface-dark p-8 border border-white/5 group hover:border-cyan-neon/30 transition-all text-left relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <Layout className="w-16 h-16" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2 uppercase tracking-wider">{t.category}</h3>
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">3 Níveis de Complexidade Disponíveis</p>
                <div className="mt-8 flex items-center gap-2 text-cyan-neon text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                  Explorar Prompts <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setSelectedTemplate(null)}
              className="text-[10px] font-mono text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-2 mb-4"
            >
              <ChevronRight className="w-3 h-3 rotate-180" /> Voltar para Categorias
            </button>

            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-display font-bold text-white uppercase tracking-wider">{selectedTemplate.category}</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-gold-neon/10 border border-gold-neon/20 rounded-full">
                <Sparkles className="w-3 h-3 text-gold-neon" />
                <span className="text-[9px] font-mono text-gold-neon uppercase font-bold">{remainingImprovements} Melhorias Restantes</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[
                { type: 'simple' as const, label: 'Simples', prompt: selectedTemplate.simple_prompt, color: 'text-blue-400', bg: 'bg-blue-400/5' },
                { type: 'medium' as const, label: 'Mediano', prompt: selectedTemplate.medium_prompt, color: 'text-purple-400', bg: 'bg-purple-400/5' },
                { type: 'complex' as const, label: 'Complexo (3D/Realismo)', prompt: selectedTemplate.complex_prompt, color: 'text-magenta-neon', bg: 'bg-magenta-neon/5' }
              ].map((level) => (
                <div key={level.type} className={`p-8 border border-white/5 rounded-sm ${level.bg} group relative`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-[0.2em] ${level.color}`}>{level.label}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => improvePrompt(level.prompt, level.type)}
                        disabled={improving}
                        className="p-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-gold-neon transition-all rounded-sm"
                        title="Melhorar Prompt com IA"
                      >
                        {improving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-white text-sm font-sans mb-8 leading-relaxed">{level.prompt}</p>
                  <button 
                    onClick={() => onSelect(level.prompt)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    Usar Este Prompt <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
