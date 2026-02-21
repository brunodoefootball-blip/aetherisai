import { motion } from "motion/react";
import { Layout, Globe, ShoppingBag, User, Cpu, Zap } from "lucide-react";

const templates = [
  {
    id: "saas-modern",
    name: "SaaS Modern",
    category: "Tech",
    icon: Cpu,
    image: "https://picsum.photos/seed/saas/600/400",
    features: ["Dark Mode", "Pricing Grid", "Auth Ready"]
  },
  {
    id: "portfolio-creative",
    name: "Portfolio Creative",
    category: "Design",
    icon: User,
    image: "https://picsum.photos/seed/portfolio/600/400",
    features: ["3D Gallery", "Smooth Scroll", "Contact Form"]
  },
  {
    id: "ecommerce-neon",
    name: "E-commerce Neon",
    category: "Vendas",
    icon: ShoppingBag,
    image: "https://picsum.photos/seed/shop/600/400",
    features: ["Cart System", "Product Filters", "Checkout"]
  },
  {
    id: "landing-page-v2",
    name: "Landing Page v2",
    category: "Marketing",
    icon: Zap,
    image: "https://picsum.photos/seed/landing/600/400",
    features: ["High Conversion", "A/B Ready", "Mobile First"]
  },
  {
    id: "blog-minimal",
    name: "Blog Minimal",
    category: "Conteúdo",
    icon: Globe,
    image: "https://picsum.photos/seed/blog/600/400",
    features: ["SEO Optimized", "Newsletter", "Reading Time"]
  },
  {
    id: "agency-pro",
    name: "Agency Pro",
    category: "Business",
    icon: Layout,
    image: "https://picsum.photos/seed/agency/600/400",
    features: ["Case Studies", "Team Section", "Client Portal"]
  }
];

export default function Templates({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template, i) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="group relative bg-surface-dark border border-white/5 rounded-sm overflow-hidden hover:border-cyan-neon/30 transition-all cursor-pointer"
          onClick={() => onSelect(template.id)}
        >
          <div className="aspect-video overflow-hidden relative">
            <img 
              src={template.image} 
              alt={template.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="px-2 py-1 bg-black/50 backdrop-blur-md border border-white/10 text-[9px] font-mono text-cyan-neon uppercase tracking-widest">
                {template.category}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-display text-xl uppercase tracking-wider">{template.name}</h3>
              <template.icon className="w-5 h-5 text-zinc-600 group-hover:text-cyan-neon transition-colors" />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {template.features.map((feature, j) => (
                <span key={j} className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-sm">
                  {feature}
                </span>
              ))}
            </div>
            
            <button className="w-full mt-6 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-mono uppercase tracking-[0.2em] group-hover:bg-cyan-neon group-hover:text-black transition-all">
              Usar Template
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
