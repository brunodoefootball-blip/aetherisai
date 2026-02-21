import { motion } from "motion/react";

export default function Roadmap() {
  const steps = [
    {
      phase: "Q1 2026",
      title: "Lançamento Aetheris v1",
      desc: "Geração de Landing Pages e Blogs com SEO avançado.",
      status: "Em andamento"
    },
    {
      phase: "Q2 2026",
      title: "Ecossistema E-commerce",
      desc: "Checkout nativo, gestão de estoque e integração com Stripe/PayPal.",
      status: "Planejado"
    },
    {
      phase: "Q3 2026",
      title: "Aetheris 3D Engine",
      desc: "IA capaz de criar mundos 3D navegáveis para o navegador.",
      status: "Planejado"
    },
    {
      phase: "Q4 2026",
      title: "White Label & API",
      desc: "Abertura para agências criarem suas próprias ferramentas de IA.",
      status: "Planejado"
    }
  ];

  return (
    <section id="roadmap" className="py-24 px-4 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Caminho para o Unicórnio</h2>
          <p className="text-zinc-400">Nossa visão para transformar o desenvolvimento web.</p>
        </div>

        <div className="space-y-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex flex-col md:flex-row gap-8 items-start"
            >
              <div className="w-32 shrink-0">
                <span className="text-indigo-400 font-bold text-lg">{step.phase}</span>
              </div>
              <div className="flex-1 p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase">
                    {step.status}
                  </span>
                </div>
                <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
