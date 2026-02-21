import { Check } from "lucide-react";
import { motion } from "motion/react";

const plans = [
  {
    name: "FREEMIUM",
    price: "R$0",
    credits: "50 créditos/mês grátis",
    features: ["3 sites completos/mês", "Frontend automático", "Design premium", "SEO básico", "Exportação de código"],
    disabledFeatures: ["Backend incluso", "Área de membros", "Integração pagamento", "Modelos 3D", "White label"],
    cta: "Começar Grátis",
    highlight: false,
    badge: "● Gratuito"
  },
  {
    name: "PRO",
    price: "R$197",
    credits: "500 créditos/mês",
    features: ["Sites ilimitados", "Frontend + Backend", "Design premium + 3D", "SEO avançado completo", "Copy persuasiva", "Área de membros", "1 gateway de pagamento", "Exportação + GitHub", "Deploy automático"],
    disabledFeatures: ["White label"],
    cta: "Assinar Pro",
    highlight: true,
    badge: "★ Pro"
  },
  {
    name: "PREMIUM",
    price: "R$497",
    credits: "2.000 créditos/mês",
    features: ["Tudo do Pro", "Todos os gateways", "Animações 3D avançadas", "Modelos 3D customizados", "API access completo", "Priority generation", "Suporte dedicado", "Analytics integrado", "A/B testing automático"],
    disabledFeatures: ["White label"],
    cta: "Assinar Premium",
    highlight: false,
    badge: "⬡ Premium"
  },
  {
    name: "WHITE LABEL",
    price: "R$1.997",
    credits: "10.000 créditos/mês",
    features: ["Tudo do Premium", "Sua marca no produto", "Domínio customizado", "Revenda para clientes", "API white label", "Dashboard de agência", "Gerenciar sub-contas", "Comissão de revenda", "SLA garantido 99.9%", "Onboarding dedicado"],
    disabledFeatures: [],
    cta: "Falar com Vendas",
    highlight: false,
    badge: "◈ Agências"
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 px-4 relative z-10 bg-surface-darker/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="text-xs font-mono text-cyan-neon uppercase tracking-[0.2em] mb-4">// PLANOS E PREÇOS</div>
          <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 uppercase tracking-tight">
            COMECE GRÁTIS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-neon to-magenta-neon">ESCALE COM IA</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 bg-cyan-neon/10 border border-cyan-neon/10">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-10 bg-surface-dark flex flex-col group hover:bg-surface-darker transition-all ${
                plan.highlight ? "ring-1 ring-cyan-neon/30 z-10" : ""
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-5 right-[-35px] px-12 py-1 bg-gradient-to-r from-cyan-neon to-magenta-neon text-black text-[10px] font-bold uppercase tracking-widest rotate-45 shadow-lg">
                  Mais Popular
                </div>
              )}
              
              <div className="mb-10">
                <div className={`text-[10px] font-mono tracking-[0.2em] uppercase mb-4 ${plan.highlight ? "text-cyan-neon" : "text-zinc-500"}`}>
                  {plan.badge}
                </div>
                <h3 className="text-3xl font-display font-bold text-white mb-2 tracking-wider">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-display font-bold text-white">{plan.price}</span>
                  <span className="text-zinc-600 text-sm font-mono uppercase">/mês</span>
                </div>
                <div className="mt-6 py-2 px-4 bg-cyan-neon/5 border-l-2 border-cyan-neon text-cyan-neon text-[10px] font-mono uppercase tracking-widest">
                  🪙 {plan.credits}
                </div>
              </div>

              <ul className="space-y-4 mb-12 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-zinc-400 font-sans">
                    <span className="text-cyan-neon mt-1 text-[10px]">▸</span>
                    {feature}
                  </li>
                ))}
                {plan.disabledFeatures?.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-zinc-600 font-sans line-through opacity-50">
                    <span className="text-zinc-700 mt-1 text-[10px]">–</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-xs transition-all ${
                plan.highlight 
                  ? "bg-gradient-to-r from-cyan-neon to-magenta-neon text-black hover:scale-105 shadow-[0_0_20px_rgba(0,245,255,0.2)]" 
                  : "bg-transparent border border-white/10 text-white hover:border-cyan-neon hover:text-cyan-neon"
              }`}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
