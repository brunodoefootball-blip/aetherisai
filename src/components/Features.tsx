import { motion } from "motion/react";
import { Box, Code, Cpu, Layers, Palette, Share2 } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Design Premium",
    desc: "Layouts que seguem as tendências mais modernas de UI/UX, com foco em conversão."
  },
  {
    icon: Box,
    title: "Modelos 3D",
    desc: "Geração automática de elementos 3D interativos para dar vida ao seu site."
  },
  {
    icon: Code,
    title: "Código Limpo",
    desc: "Exportação em React, Next.js ou HTML/CSS puro com estrutura profissional."
  },
  {
    icon: Cpu,
    title: "Backend Robusto",
    desc: "APIs prontas em Node.js com banco de dados configurado automaticamente."
  },
  {
    icon: Layers,
    title: "Área de Membros",
    desc: "Sistemas de login, dashboard e proteção de conteúdo gerados em segundos."
  },
  {
    icon: Share2,
    title: "SEO Automático",
    desc: "Meta tags, sitemaps e copy otimizada para rankear no Google instantaneamente."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
