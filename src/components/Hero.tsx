import { motion } from "motion/react";
import { Sparkles, ArrowRight, Zap, Globe, Shield, Cpu } from "lucide-react";

export default function Hero({ onStartDemo }: { onStartDemo: () => void }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 overflow-hidden">
      {/* Animated 3D-like Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-neon/10 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-magenta-neon/10 rounded-full blur-[120px]" 
        />
        
        {/* Floating Icons (3D Feel) */}
        <motion.div
          animate={{ y: [0, -30, 0], rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-[15%] text-cyan-neon/10"
        >
          <Cpu size={120} strokeWidth={0.5} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 40, 0], rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/3 left-[10%] text-magenta-neon/10"
        >
          <Globe size={180} strokeWidth={0.5} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-6xl mx-auto z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-neon/20 bg-cyan-neon/5 backdrop-blur-md mb-8">
          <Sparkles className="w-4 h-4 text-cyan-neon animate-pulse" />
          <span className="text-xs font-mono font-medium text-cyan-neon uppercase tracking-[0.2em]">
            IA Generativa de Nova Geração — v2.0
          </span>
        </div>
        
        <h1 className="text-[clamp(4rem,12vw,10rem)] font-display font-bold text-white mb-6 tracking-tight leading-[0.85] uppercase">
          SITES <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-neon via-magenta-neon to-gold-neon animate-gradient-x">
            PROFISSIONAIS
          </span> <br />
          EM MINUTOS
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-sans">
          A única IA que gera frontend, backend, design premium, animações 3D, SEO e copy persuasiva de forma totalmente autônoma.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
          <button 
            onClick={onStartDemo}
            className="group relative px-10 py-5 bg-gradient-to-r from-cyan-neon to-magenta-neon text-black font-bold rounded-sm overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,245,255,0.3)] uppercase tracking-widest text-sm"
          >
            <span className="relative z-10 flex items-center gap-2">
              Gerar Meu Site Agora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          
          <button className="px-10 py-5 bg-white/5 text-white font-bold rounded-sm border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all uppercase tracking-widest text-sm">
            Ver Demo ao Vivo →
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-80">
          {[
            { num: "47K+", label: "Sites Gerados" },
            { num: "6MIN", label: "Tempo Médio" },
            { num: "99.2%", label: "Satisfação" },
            { num: "$0", label: "Para Começar" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-display font-bold text-white tracking-wider">{stat.num}</div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full z-10">
        {[
          { icon: Zap, title: "Instantâneo", desc: "De 0 a Deploy em 5 minutos." },
          { icon: Globe, title: "Full-Stack", desc: "Frontend + Backend + DB inclusos." },
          { icon: Shield, title: "Enterprise", desc: "Segurança e SEO otimizados." }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-colors"
          >
            <item.icon className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-white font-bold mb-2">{item.title}</h3>
            <p className="text-zinc-500 text-sm">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
