import { useState, useEffect } from "react";
import ThreeBackground from "./components/ThreeBackground";
import Hero from "./components/Hero";
import DemoSimulation from "./components/DemoSimulation";
import Features from "./components/Features";
import Pricing from "./components/Pricing";
import Roadmap from "./components/Roadmap";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";
import { motion, AnimatePresence } from "motion/react";
import { Github, Twitter, Linkedin, Menu, X, User, LogOut, Layout, ArrowUp } from "lucide-react";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<"landing" | "dashboard">("landing");
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isLocked = document.body.style.overflow === "hidden";
      
      if (isLocked) {
        setShowNavbar(false);
        return;
      }

      // Always show at the very top
      if (currentScrollY < 10) {
        setShowNavbar(true);
        setLastScrollY(currentScrollY);
        return;
      }
      
      if (currentScrollY < lastScrollY) {
        setShowNavbar(true);
      } else if (currentScrollY > 100 && currentScrollY > lastScrollY) {
        setShowNavbar(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Don't show navbar if a modal is open
      if (document.body.style.overflow === "hidden") {
        setShowNavbar(false);
        return;
      }

      if (e.clientY < 80) {
        setShowNavbar(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [lastScrollY]);

  const scrollTo = (id: string) => {
    if (view !== "landing") {
      setView("landing");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setView("landing");
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white font-sans">
      <ThreeBackground />
      
      <motion.nav
        initial={{ y: -100 }}
        animate={{ 
          y: showNavbar ? 0 : -100,
          backgroundColor: lastScrollY > 50 ? "rgba(3, 5, 10, 0.85)" : "rgba(3, 5, 10, 0)",
          backdropFilter: lastScrollY > 50 ? "blur(20px)" : "blur(0px)",
          borderBottomColor: lastScrollY > 50 ? "rgba(0, 245, 255, 0.1)" : "rgba(0, 245, 255, 0)"
        }}
        className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 flex items-center justify-between border-b transition-colors duration-500"
      >
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setView("landing")}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-neon to-magenta-neon rounded-sm flex items-center justify-center font-display text-lg text-black font-bold shadow-[0_0_15px_rgba(0,245,255,0.3)]">A</div>
          <span className="text-2xl font-display font-bold tracking-wider text-white group-hover:text-cyan-neon transition-colors">
            AETHERIS <span className="text-zinc-600">AI</span>
          </span>
        </motion.div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {view === "landing" ? (
            <>
              {["Recursos", "Demo", "Preços", "Roadmap"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item.toLowerCase())}
                  className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-cyan-neon transition-colors"
                >
                  {item}
                </button>
              ))}
            </>
          ) : (
            <button
              onClick={() => setView("landing")}
              className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-cyan-neon transition-colors"
            >
              Voltar ao Início
            </button>
          )}
          
          <div className="h-4 w-px bg-white/10" />
          
          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView("dashboard")}
                className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white hover:text-cyan-neon transition-colors"
              >
                <Layout className="w-3.5 h-3.5" /> Dashboard
              </button>
              <button 
                onClick={handleLogout}
                className="p-2 text-zinc-500 hover:text-magenta-neon transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-6 py-2 bg-gradient-to-r from-cyan-neon to-magenta-neon text-black font-bold rounded-sm text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,245,255,0.2)]"
            >
              Entrar / Registrar
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {view === "landing" && ["features", "demo", "pricing", "roadmap"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item)}
                  className="text-2xl font-bold text-white text-left capitalize"
                >
                  {item}
                </button>
              ))}
              <hr className="border-white/10" />
              {user ? (
                <>
                  <button onClick={() => { setView("dashboard"); setIsMenuOpen(false); }} className="text-xl font-bold text-white text-left">Dashboard</button>
                  <button onClick={handleLogout} className="text-xl font-bold text-red-400 text-left">Sair</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }} className="text-xl font-bold text-zinc-400 text-left">Login</button>
                  <button onClick={() => { setIsAuthOpen(true); setIsMenuOpen(false); }} className="w-full py-4 bg-white text-black font-bold rounded-2xl">Começar Agora</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative">
        {view === "landing" ? (
          <>
            <Hero onStartDemo={() => scrollTo("demo")} />
            <DemoSimulation user={user} />
            <Features />
            <Pricing />
            <Roadmap />
            
            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/5 bg-surface-dark">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-neon to-magenta-neon rounded-sm flex items-center justify-center font-display text-lg text-black font-bold">A</div>
                    <span className="text-2xl font-display font-bold tracking-wider text-white">
                      AETHERIS <span className="text-zinc-600">AI</span>
                    </span>
                  </div>
                  <p className="text-zinc-500 max-w-sm font-sans leading-relaxed">
                    Liderando a revolução da inteligência artificial na criação de ecossistemas digitais de alta performance.
                  </p>
                </div>
                <div>
                  <h4 className="text-white font-display font-bold uppercase tracking-widest mb-6">Plataforma</h4>
                  <ul className="space-y-4 text-sm text-zinc-500 font-mono uppercase tracking-wider">
                    <li><button onClick={() => scrollTo("features")} className="hover:text-cyan-neon transition-colors">Recursos</button></li>
                    <li><button onClick={() => scrollTo("demo")} className="hover:text-cyan-neon transition-colors">Demo</button></li>
                    <li><button onClick={() => scrollTo("pricing")} className="hover:text-cyan-neon transition-colors">Preços</button></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-display font-bold uppercase tracking-widest mb-6">Social</h4>
                  <div className="flex gap-4">
                    {[Twitter, Github, Linkedin].map((Icon, i) => (
                      <button key={i} className="w-10 h-10 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 hover:text-cyan-neon hover:border-cyan-neon transition-all">
                        <Icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">
                  © 2026 Aetheris AI. Todos os direitos reservados.
                </p>
                <div className="flex gap-8 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                  <button className="hover:text-white transition-colors">Privacidade</button>
                  <button className="hover:text-white transition-colors">Termos</button>
                </div>
              </div>
            </footer>
          </>
        ) : (
          <Dashboard user={user} onNewProject={() => scrollTo("demo")} />
        )}
      </main>

      <AnimatePresence>
        {lastScrollY > 500 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-cyan-neon text-black rounded-sm flex items-center justify-center shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:scale-110 transition-all"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={(userData) => {
          setUser(userData);
          setView("dashboard");
        }} 
      />
    </div>
  );
}
