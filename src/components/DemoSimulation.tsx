import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, CheckCircle2, Loader2, Code2, Layout, Database, Rocket, Sparkles, Box } from "lucide-react";
import { cn } from "../lib/utils";
import { generateWebsiteStructure } from "../services/gemini";
import ArtifactView from "./ArtifactView";

export default function DemoSimulation({ user }: { user?: any }) {
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const savedPrompt = localStorage.getItem("selected_template_prompt");
    if (savedPrompt) {
      setPrompt(savedPrompt);
      localStorage.removeItem("selected_template_prompt");
    }
  }, []);
  const [backend, setBackend] = useState("none");
  const [seoEnabled, setSeoEnabled] = useState(true);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [previousData, setPreviousData] = useState<any>(null);
  const [showArtifact, setShowArtifact] = useState(false);

  useEffect(() => {
    if (showArtifact) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [showArtifact]);

  const steps = [
    { id: "gs-analysis", icon: Terminal, text: "Analisando briefing com GPT-4o...", color: "text-blue-400", pct: 12 },
    { id: "gs-plan", icon: Layout, text: "Planejando arquitetura do projeto...", color: "text-purple-400", pct: 25 },
    { id: "gs-frontend", icon: Code2, text: "Compilando frontend (React + Tailwind)...", color: "text-indigo-400", pct: 65 },
    { id: "gs-content", icon: Database, text: "Copy + SEO + Design System...", color: "text-emerald-400", pct: 80 },
    { id: "gs-compile", icon: Box, text: "Compilando e otimizando bundles...", color: "text-orange-400", pct: 92 },
    { id: "gs-deploy", icon: Rocket, text: "Preparando entrega e deploy...", color: "text-cyan-neon", pct: 100 }
  ];

  const startDemo = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setStep(0);
    setPreviousData(generatedData);
    setGeneratedData(null);

    try {
      const resultPromise = generateWebsiteStructure(prompt);
      
      for (let i = 0; i < steps.length; i++) {
        setStep(i);
        await new Promise(r => setTimeout(r, Math.random() * 1000 + 1500));
      }

      const result = await resultPromise;
      const dataWithId = { ...result, id: Date.now() };
      setGeneratedData(dataWithId);
      
      if (user) {
        await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            name: result.name,
            prompt: prompt,
            config: { files: result.files, features: result.features }
          })
        });
      }
      
      setIsGenerating(false);
      setStep(steps.length);
    } catch (error) {
      console.error("Generation failed:", error);
      setIsGenerating(false);
      alert("Falha na geração. Tente novamente.");
    }
  };

  return (
    <section id="demo" className="py-32 px-4 relative z-10 bg-surface-dark">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-mono text-cyan-neon uppercase tracking-[0.2em] mb-4">// DEMONSTRAÇÃO AO VIVO</div>
          <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 uppercase tracking-tight">
            VEJA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-neon to-magenta-neon">ACONTECER</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto font-sans">Descreva seu negócio e assista a IA construir seu ecossistema digital em tempo real.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-darker border border-white/10 rounded-sm p-8 backdrop-blur-xl shadow-2xl">
              {!isGenerating && step === 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                    <Terminal className="w-3 h-3" /> Prompt de Entrada
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Crie uma landing page para uma agência de marketing digital com design futurista e seção de serviços..."
                    className="w-full h-40 bg-black/50 border border-white/5 rounded-sm p-6 text-white placeholder:text-zinc-700 focus:outline-none focus:border-cyan-neon/50 transition-all font-mono text-sm"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Integração Backend</label>
                      <select 
                        value={backend}
                        onChange={(e) => setBackend(e.target.value)}
                        className="w-full bg-black/50 border border-white/5 rounded-sm p-3 text-white text-xs font-mono focus:border-cyan-neon outline-none"
                      >
                        <option value="none">Nenhum (Estático)</option>
                        <option value="supabase">Supabase (Postgres + Auth)</option>
                        <option value="firebase">Firebase (Realtime + Functions)</option>
                        <option value="custom">API Customizada (REST)</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Otimização SEO</label>
                      <div className="flex items-center gap-4 h-11 px-4 bg-black/50 border border-white/5 rounded-sm">
                        <input 
                          type="checkbox" 
                          checked={seoEnabled}
                          onChange={(e) => setSeoEnabled(e.target.checked)}
                          className="w-4 h-4 accent-cyan-neon"
                        />
                        <span className="text-xs font-mono text-white uppercase tracking-widest">Habilitar Meta-Tags IA</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={startDemo}
                    className="w-full py-5 bg-gradient-to-r from-cyan-neon to-magenta-neon text-black font-bold rounded-sm transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(0,245,255,0.2)]"
                  >
                    ⚡ Iniciar Geração Real
                  </button>
                </div>
              ) : isGenerating ? (
                <div className="space-y-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-cyan-neon animate-spin" />
                      <span className="text-white font-display text-xl tracking-wider uppercase">Aetheris AI Engine v2.0</span>
                    </div>
                    <span className="text-cyan-neon font-mono text-sm">{Math.round((step / steps.length) * 100)}%</span>
                  </div>

                  <div className="space-y-3">
                    {steps.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ 
                          opacity: i <= step ? 1 : 0.2,
                          x: 0,
                        }}
                        className={cn(
                          "flex items-center gap-4 p-4 border transition-all",
                          i === step ? "bg-cyan-neon/5 border-cyan-neon/20" : "bg-white/5 border-transparent"
                        )}
                      >
                        <s.icon className={cn("w-4 h-4", i < step ? "text-green-neon" : i === step ? "text-cyan-neon" : "text-zinc-600")} />
                        <span className={cn("text-xs font-mono flex-1 uppercase tracking-wider", i === step ? "text-white" : "text-zinc-500")}>
                          {s.text}
                        </span>
                        {i < step && <CheckCircle2 className="w-4 h-4 text-green-neon" />}
                        {i === step && <div className="w-1.5 h-4 bg-cyan-neon animate-pulse" />}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 bg-green-neon/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-neon/20">
                    <CheckCircle2 className="w-12 h-12 text-green-neon" />
                  </div>
                  <h3 className="text-4xl font-display font-bold text-white mb-4 tracking-wider uppercase">Site Gerado com Sucesso!</h3>
                  <p className="text-zinc-500 mb-10 font-sans">O código e o preview estão prontos para visualização e exportação.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => setShowArtifact(true)}
                      className="px-10 py-4 bg-white text-black font-bold rounded-sm hover:scale-105 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                    >
                      Abrir Artifact <Layout className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setStep(0); setPrompt(""); setGeneratedData(null); }}
                      className="px-10 py-4 bg-white/5 text-white font-bold rounded-sm border border-white/10 hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
                    >
                      Novo Projeto
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface-darker border border-white/10 rounded-sm p-8 backdrop-blur-xl h-full">
              <h3 className="text-xl font-display font-bold text-white mb-8 tracking-widest uppercase border-b border-white/5 pb-4">Resumo da Geração</h3>
              
              <div className="space-y-4 mb-12">
                {[
                  { label: "Site Base", cost: 10 },
                  { label: "Frontend React", cost: 5 },
                  { label: "Design System", cost: 3 },
                  { label: "SEO Avançado", cost: 2 }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-500 uppercase tracking-widest">{item.label}</span>
                    <span className="text-gold-neon">{item.cost} cr</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between mb-8">
                <span className="text-sm font-display font-bold text-white uppercase tracking-widest">Total</span>
                <span className="text-3xl font-display font-bold text-gold-neon">20</span>
              </div>

              <div className="p-4 bg-cyan-neon/5 border border-cyan-neon/10 rounded-sm">
                <div className="text-[10px] font-mono text-cyan-neon uppercase tracking-widest mb-1">Saldo Estimado</div>
                <div className="text-lg font-display font-bold text-white">
                  {user ? user.credits - 20 : 30} créditos
                </div>
              </div>

              {isGenerating && (
                <div className="mt-12 space-y-4">
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(step / steps.length) * 100}%` }}
                      className="h-full bg-gradient-to-r from-cyan-neon to-magenta-neon"
                    />
                  </div>
                  <div className="text-[10px] font-mono text-zinc-600 text-center uppercase tracking-widest">
                    Tempo estimado: 5m 42s
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showArtifact && generatedData && (
          <ArtifactView 
            data={generatedData} 
            previousData={previousData}
            onClose={() => setShowArtifact(false)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
}
