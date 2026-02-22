import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Layout, Plus, ExternalLink, Trash2, Clock, Search, ChevronLeft, ChevronRight, 
  CheckCircle2, Loader2, AlertCircle, Zap, Box, BarChart3, Coins, Settings, 
  ShieldCheck, HelpCircle, User as UserIcon, LogOut, Download, RefreshCw,
  Globe, Search as SearchIcon, Database, Palette, Cpu
} from "lucide-react";
import ArtifactView from "./ArtifactView";
import ModelViewer from "./ModelViewer";
import Templates from "./Templates";
import VisualEditor from "./VisualEditor";

const StatusBadge = ({ status }: { status: string }) => {
  switch (status.toLowerCase()) {
    case "completed":
      return (
        <span className="flex items-center gap-1.5 px-2 py-1 bg-green-neon/10 text-green-neon text-[10px] font-bold uppercase rounded border border-green-neon/20">
          <CheckCircle2 className="w-3 h-3" /> Concluído
        </span>
      );
    case "generating":
      return (
        <span className="flex items-center gap-1.5 px-2 py-1 bg-cyan-neon/10 text-cyan-neon text-[10px] font-bold uppercase rounded border border-cyan-neon/20">
          <Loader2 className="w-3 h-3 animate-spin" /> Gerando
        </span>
      );
    case "error":
      return (
        <span className="flex items-center gap-1.5 px-2 py-1 bg-magenta-neon/10 text-magenta-neon text-[10px] font-bold uppercase rounded border border-magenta-neon/20">
          <AlertCircle className="w-3 h-3" /> Erro
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 bg-zinc-500/10 text-zinc-400 text-[10px] font-bold uppercase rounded border border-zinc-500/20">
          {status}
        </span>
      );
  }
};

interface Project {
  id: number;
  name: string;
  prompt: string;
  status: string;
  config: string;
  created_at: string;
}

export default function Dashboard({ user, onNewProject }: { user: any, onNewProject: () => void }) {
  const [activeTab, setActiveTab] = useState<"projects" | "analytics" | "credits" | "settings" | "whitelabel" | "templates" | "seo" | "design" | "backend">("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorProject, setEditorProject] = useState<any>(null);
  const [whitelabel, setWhitelabel] = useState({
    brandName: "",
    logoUrl: "",
    primaryColor: "#00f5ff",
    customDomain: ""
  });
  const [settings, setSettings] = useState({
    theme: "dark",
    notificationsEnabled: true,
    apiKeyCustom: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const limit = 6;

  useEffect(() => {
    if (activeTab === "whitelabel") {
      fetch(`/api/white-label/${user.id}`)
        .then(res => res.json())
        .then(data => setWhitelabel({
          brandName: data.brand_name || "",
          logoUrl: data.logo_url || "",
          primaryColor: data.primary_color || "#00f5ff",
          customDomain: data.custom_domain || ""
        }));
    }
    if (activeTab === "settings") {
      fetch(`/api/settings/${user.id}`)
        .then(res => res.json())
        .then(data => setSettings({
          theme: data.theme || "dark",
          notificationsEnabled: !!data.notifications_enabled,
          apiKeyCustom: data.api_key_custom || ""
        }));
    }
    if (activeTab === "analytics") {
      fetch(`/api/activity/${user.id}`)
        .then(res => res.json())
        .then(data => setActivityLogs(data));
    }
  }, [activeTab, user.id]);

  const handleTemplateSelect = (prompt: string) => {
    setEditorProject({
      id: 0,
      name: "Template: " + prompt.substring(0, 20),
      layout: JSON.stringify([
        {
          id: 'root',
          type: 'Container',
          props: { className: 'min-h-screen bg-white p-12' },
          children: [
            { id: 'h1', type: 'Heading', props: { text: prompt, level: 1, className: 'text-5xl font-bold mb-8' }, children: [] },
            { id: 'p1', type: 'Text', props: { text: 'Este é um template gerado para você.', className: 'text-xl text-gray-600' }, children: [] }
          ]
        }
      ]),
      config: JSON.stringify({ files: [] })
    });
    setIsEditorOpen(true);
  };

  const saveWhitelabel = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/white-label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...whitelabel })
      });
      alert("Configurações White Label salvas!");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...settings })
      });
      alert("Configurações da conta salvas!");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedProject]);

  useEffect(() => {
    if (activeTab === "projects") {
      setLoading(true);
      const offset = (currentPage - 1) * limit;
      fetch(`/api/projects/${user.id}?limit=${limit}&offset=${offset}`)
        .then(res => res.json())
        .then(data => {
          setProjects(data.projects);
          setTotalProjects(data.total);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user.id, currentPage, activeTab]);

  const totalPages = Math.ceil(totalProjects / limit);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const NavItem = ({ id, icon: Icon, label, badge }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all border-l-2 ${
        activeTab === id 
          ? "text-cyan-neon border-cyan-neon bg-cyan-neon/5" 
          : "text-zinc-500 border-transparent hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
          badge === "Novo" ? "bg-cyan-neon/10 text-cyan-neon" : "bg-white/10 text-zinc-400"
        }`}>
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-surface-darker flex pt-20 relative z-10">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col bg-surface-dark hidden lg:flex">
        <div className="p-6">
          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-4">Principal</div>
          <div className="space-y-1">
            <NavItem id="projects" icon={Box} label="Meus Sites" badge={totalProjects.toString()} />
            <NavItem id="analytics" icon={BarChart3} label="Analytics" />
            <NavItem id="design" icon={Palette} label="Design 3D" />
          </div>

          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] mt-8 mb-4">Ferramentas</div>
          <div className="space-y-1">
            <NavItem id="templates" icon={Layout} label="Templates" badge="Novo" />
            <NavItem id="seo" icon={SearchIcon} label="SEO Engine" />
            <NavItem id="backend" icon={Database} label="Backend" />
          </div>

          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] mt-8 mb-4">Conta</div>
          <div className="space-y-1">
            <NavItem id="credits" icon={Coins} label="Créditos" badge={user.credits.toString()} />
            <NavItem id="settings" icon={Settings} label="Configurações" />
            <NavItem id="whitelabel" icon={ShieldCheck} label="White Label" />
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-neon to-magenta-neon flex items-center justify-center text-xs font-bold text-black">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{user.email}</div>
              <div className="text-[10px] font-mono text-cyan-neon uppercase">Plano Pro</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-wider uppercase">
                {activeTab === "projects" ? "Meus Sites" : 
                 activeTab === "analytics" ? "Analytics" : 
                 activeTab === "credits" ? "Créditos" : 
                 activeTab === "templates" ? "Templates Premium" :
                 activeTab === "seo" ? "SEO Engine" :
                 activeTab === "design" ? "Design 3D" :
                 activeTab === "backend" ? "Backend Services" :
                 "Configurações"}
              </h1>
              <p className="text-zinc-500 text-sm font-mono mt-1">
                {activeTab === "projects" ? `${totalProjects} sites gerados · ${user.credits} créditos disponíveis` : 
                 activeTab === "analytics" ? "Desempenho dos seus sites nos últimos 30 dias" : 
                 activeTab === "credits" ? "Gerencie seu saldo de créditos" : 
                 activeTab === "templates" ? "Escolha um ponto de partida profissional" :
                 activeTab === "seo" ? "Otimize seu site para os motores de busca" :
                 activeTab === "design" ? "Explore as capacidades 3D da Aetheris" :
                 activeTab === "backend" ? "Conecte bancos de dados e funções serverless" :
                 "Ajuste suas preferências"}
              </p>
            </div>
            <button 
              onClick={onNewProject}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-neon to-magenta-neon text-black font-bold rounded-sm text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,245,255,0.2)]"
            >
              <Zap className="w-4 h-4" /> Novo Site
            </button>
          </div>

          {activeTab === "projects" && (
            <>
              <div className="mb-8 relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text"
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white focus:ring-2 focus:ring-cyan-neon outline-none transition-all text-sm"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-12 h-12 text-cyan-neon animate-spin" />
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="text-center py-24 bg-white/5 border border-white/5 rounded-3xl">
                  <Box className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">Nenhum site encontrado</h3>
                  <p className="text-zinc-500 mb-8">Tente outro termo de busca ou crie um novo projeto.</p>
                  <button 
                    onClick={onNewProject}
                    className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-all"
                  >
                    Criar Meu Primeiro Site
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1 bg-white/5 border border-white/5">
                  {filteredProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-surface-dark p-6 group hover:bg-surface-darker transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-neon to-magenta-neon opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-cyan-neon">
                          <Layout className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => {
                              try {
                                const config = JSON.parse(project.config);
                                setSelectedProject({
                                  id: project.id,
                                  name: project.name,
                                  files: config.files || [],
                                  description: project.prompt,
                                  features: config.features || []
                                });
                              } catch (e) {
                                console.error("Failed to parse project config", e);
                              }
                            }}
                            className="p-2 text-zinc-500 hover:text-white transition-colors"
                            title="Visualizar"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setEditorProject(project);
                              setIsEditorOpen(true);
                            }}
                            className="p-2 text-zinc-500 hover:text-cyan-neon transition-colors"
                            title="Editar Visualmente"
                          >
                            <Palette className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-zinc-500 hover:text-magenta-neon transition-colors" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-2 truncate group-hover:text-cyan-neon transition-colors">
                        {project.name || "Site Sem Nome"}
                      </h3>
                      <p className="text-zinc-500 text-sm line-clamp-2 mb-8 font-sans">{project.prompt}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-mono uppercase">
                          <Clock className="w-3 h-3" />
                          {new Date(project.created_at).toLocaleDateString()}
                        </div>
                        <StatusBadge status={project.status} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-2 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <span className="text-sm font-mono text-zinc-400">
                    Página <span className="text-white">{currentPage}</span> de {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="p-2 text-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-1 bg-white/5 border border-white/5">
                {[
                  { label: "Sites Gerados", value: totalProjects.toString(), change: "↑ +4 esse mês", color: "text-green-neon" },
                  { label: "Tempo Médio", value: "6:12", change: "↓ -1:30 vs mês ant.", color: "text-cyan-neon" },
                  { label: "Créditos Usados", value: user.credits.toString(), change: "↑ 72% utilização", color: "text-white" },
                  { label: "SEO Score Médio", value: "94", change: "↑ +6 pontos", color: "text-green-neon" }
                ].map((stat, i) => (
                  <div key={i} className="bg-surface-dark p-8">
                    <div className="text-4xl font-display font-bold text-white">{stat.value}</div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">{stat.label}</div>
                    <div className={`text-[10px] font-mono mt-4 ${stat.color}`}>{stat.change}</div>
                  </div>
                ))}
              </div>

              <div className="bg-surface-dark p-8 border border-white/5">
                <h3 className="text-lg font-display font-bold text-white tracking-widest uppercase mb-8">Atividade Recente do Sistema</h3>
                <div className="space-y-4">
                  {activityLogs.length > 0 ? activityLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 rounded-sm bg-white/5 flex items-center justify-center text-cyan-neon">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white uppercase tracking-wider">{log.action}</div>
                          <div className="text-[10px] text-zinc-500 font-mono uppercase">{log.details}</div>
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-600 font-mono">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 text-zinc-600 font-mono text-xs uppercase tracking-widest border border-dashed border-white/5">
                      Nenhum log de atividade disponível para este período.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <Templates 
              userId={user.id}
              onSelect={handleTemplateSelect} 
            />
          )}

          {activeTab === "design" && (
            <div className="space-y-8">
              <div className="bg-surface-dark p-8 border border-white/5">
                <h3 className="text-xl font-display font-bold text-white mb-4 tracking-widest uppercase">Motor 3D Nativo</h3>
                <p className="text-zinc-500 mb-8 font-sans max-w-2xl">
                  A Aetheris AI utiliza WebGL e Three.js para renderizar elementos 3D interativos diretamente no navegador. 
                  Seus sites podem incluir modelos complexos, animações procedurais e materiais dinâmicos.
                </p>
                <ModelViewer />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Materiais PBR", desc: "Reflexos realistas e texturas de alta fidelidade." },
                  { title: "Animação Física", desc: "Movimentos baseados em física para maior imersão." },
                  { title: "Otimização", desc: "Modelos leves que carregam instantaneamente." }
                ].map((feature, i) => (
                  <div key={i} className="bg-white/5 p-6 border border-white/5">
                    <div className="text-cyan-neon font-display text-lg mb-2 uppercase tracking-wider">{feature.title}</div>
                    <p className="text-zinc-500 text-xs font-sans">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-surface-dark p-8 border border-white/5">
                  <h3 className="text-lg font-display font-bold text-white mb-6 uppercase tracking-widest">Configurações Globais</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">Meta Title</label>
                      <input type="text" className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-white text-sm focus:border-cyan-neon outline-none" placeholder="Ex: Minha Agência Digital | Especialistas em IA" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">Meta Description</label>
                      <textarea className="w-full bg-black/50 border border-white/10 rounded-sm p-3 text-white text-sm h-24 focus:border-cyan-neon outline-none" placeholder="Descreva seu site para o Google..." />
                    </div>
                    <button className="w-full py-3 bg-cyan-neon text-black font-bold text-[10px] uppercase tracking-widest">Salvar Alterações</button>
                  </div>
                </div>

                <div className="bg-surface-dark p-8 border border-white/5">
                  <h3 className="text-lg font-display font-bold text-white mb-6 uppercase tracking-widest">SEO Score</h3>
                  <div className="flex items-center justify-center py-8">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-white/5 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                        <circle className="text-green-neon stroke-current" strokeWidth="8" strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" strokeDasharray="251.2" strokeDashoffset="25.12" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-display font-bold text-white">90</span>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">Excelente</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Velocidade de Carregamento</span>
                      <span className="text-green-neon">Ótimo</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Mobile Friendly</span>
                      <span className="text-green-neon">Sim</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Sitemap XML</span>
                      <span className="text-magenta-neon">Pendente</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-8">
              <div className="bg-surface-dark p-8 border border-white/5">
                <h3 className="text-lg font-display font-bold text-white mb-6 uppercase tracking-widest">Preferências da Conta</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5">
                    <div>
                      <div className="text-sm font-bold text-white">Tema do Sistema</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Escolha entre Dark e Light (Beta)</div>
                    </div>
                    <select 
                      value={settings.theme}
                      onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                      className="bg-black border border-white/10 text-xs font-mono p-2 text-white outline-none"
                    >
                      <option value="dark">Dark Mode</option>
                      <option value="light">Light Mode</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5">
                    <div>
                      <div className="text-sm font-bold text-white">Notificações por E-mail</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Receba alertas de geração concluída</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.notificationsEnabled}
                      onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
                      className="w-5 h-5 accent-cyan-neon" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">Chave API Personalizada (Opcional)</label>
                    <input 
                      type="password" 
                      value={settings.apiKeyCustom}
                      onChange={(e) => setSettings({ ...settings, apiKeyCustom: e.target.value })}
                      placeholder="sk-..." 
                      className="w-full bg-black border border-white/10 p-3 text-white text-xs font-mono focus:border-cyan-neon outline-none" 
                    />
                  </div>

                  <button 
                    onClick={saveSettings}
                    disabled={isSaving}
                    className="w-full py-4 bg-cyan-neon text-black font-bold text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isSaving ? "Salvando..." : "Salvar Configurações"}
                  </button>
                </div>
              </div>

              <div className="bg-magenta-neon/5 p-8 border border-magenta-neon/10">
                <h3 className="text-lg font-display font-bold text-magenta-neon mb-2 uppercase tracking-widest">Zona de Perigo</h3>
                <p className="text-zinc-500 text-xs mb-6">A exclusão da conta é permanente e removerá todos os seus sites gerados.</p>
                <button className="px-6 py-2 border border-magenta-neon/30 text-magenta-neon text-[10px] font-mono uppercase tracking-widest hover:bg-magenta-neon hover:text-black transition-all">Excluir Conta</button>
              </div>
            </div>
          )}

          {activeTab === "whitelabel" && (
            <div className="max-w-3xl space-y-8">
              <div className="bg-surface-dark p-8 border border-white/5">
                <div className="flex items-center gap-4 mb-8">
                  <ShieldCheck className="w-8 h-8 text-cyan-neon" />
                  <div>
                    <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest">Personalização White Label</h3>
                    <p className="text-zinc-500 text-xs font-mono uppercase">Remova a marca Aetheris e use a sua própria</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">Nome da Marca</label>
                      <input 
                        type="text" 
                        value={whitelabel.brandName}
                        onChange={(e) => setWhitelabel({ ...whitelabel, brandName: e.target.value })}
                        placeholder="Minha Agência AI" 
                        className="w-full bg-black border border-white/10 p-3 text-white text-xs focus:border-cyan-neon outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">URL do Logo (SVG/PNG)</label>
                      <input 
                        type="text" 
                        value={whitelabel.logoUrl}
                        onChange={(e) => setWhitelabel({ ...whitelabel, logoUrl: e.target.value })}
                        placeholder="https://..." 
                        className="w-full bg-black border border-white/10 p-3 text-white text-xs focus:border-cyan-neon outline-none" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">Cor Primária</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={whitelabel.primaryColor}
                          onChange={(e) => setWhitelabel({ ...whitelabel, primaryColor: e.target.value })}
                          className="w-12 h-10 bg-transparent border-none cursor-pointer" 
                        />
                        <input 
                          type="text" 
                          value={whitelabel.primaryColor}
                          onChange={(e) => setWhitelabel({ ...whitelabel, primaryColor: e.target.value })}
                          className="flex-1 bg-black border border-white/10 p-3 text-white text-xs font-mono outline-none" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">Domínio Customizado</label>
                      <input 
                        type="text" 
                        value={whitelabel.customDomain}
                        onChange={(e) => setWhitelabel({ ...whitelabel, customDomain: e.target.value })}
                        placeholder="app.suamarca.com" 
                        className="w-full bg-black border border-white/10 p-3 text-white text-xs focus:border-cyan-neon outline-none" 
                      />
                      <p className="text-[9px] text-zinc-600 mt-2">Aponte o CNAME para deploy.aetheris.ai</p>
                    </div>
                    
                    <div className="p-6 bg-cyan-neon/5 border border-cyan-neon/10 rounded-sm">
                      <div className="text-[10px] font-mono text-cyan-neon uppercase tracking-widest mb-4">Preview do Dashboard</div>
                      <div className="w-full h-32 bg-surface-darker rounded border border-white/5 flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: whitelabel.primaryColor }} />
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">{whitelabel.brandName || "Sua Marca"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={saveWhitelabel}
                  disabled={isSaving}
                  className="w-full mt-12 py-4 bg-gradient-to-r from-cyan-neon to-magenta-neon text-black font-bold text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(0,245,255,0.2)] disabled:opacity-50"
                >
                  {isSaving ? "Salvando..." : "Ativar White Label"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "backend" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'supabase', name: "Supabase", desc: "Banco de dados Postgres e Auth.", icon: Database, color: "text-emerald-400" },
                  { id: 'firebase', name: "Firebase", desc: "Realtime DB e Cloud Functions.", icon: Globe, color: "text-orange-400" },
                  { id: 'custom', name: "Custom API", desc: "Conecte seu próprio endpoint REST/GraphQL.", icon: Cpu, color: "text-cyan-neon" }
                ].map((service, i) => (
                  <div key={i} className="bg-surface-dark p-8 border border-white/5 group hover:border-cyan-neon/30 transition-all">
                    <service.icon className={`w-10 h-10 mb-6 ${service.color}`} />
                    <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-wider">{service.name}</h3>
                    <p className="text-zinc-500 text-xs font-sans mb-8">{service.desc}</p>
                    <button 
                      onClick={() => {
                        alert(`${service.name} conectado com sucesso! Redirecionando para o console...`);
                        // Simulate redirection
                        window.open(`https://${service.id}.com`, '_blank');
                      }}
                      className="w-full py-3 bg-white/5 border border-white/10 text-white text-[10px] font-mono uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-all"
                    >
                      Conectar & Configurar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "credits" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-surface-dark p-12 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,#00f5ff,transparent_50%)]" />
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-4">Saldo Atual</div>
                  <div className="text-8xl font-display font-bold text-gold-neon leading-none">{user.credits}</div>
                  <div className="text-sm font-mono text-zinc-500 uppercase tracking-widest mt-2">créditos disponíveis</div>
                  
                  <div className="grid grid-cols-2 gap-1 bg-white/5 border border-white/5 mt-12">
                    <div className="bg-surface-darker p-6">
                      <div className="text-2xl font-display font-bold text-cyan-neon">197</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Do plano Pro</div>
                    </div>
                    <div className="bg-surface-darker p-6">
                      <div className="text-2xl font-display font-bold text-gold-neon">150</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Comprados</div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-dark border border-white/5">
                  <div className="p-6 border-b border-white/5 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Últimas Transações</div>
                  <div className="divide-y divide-white/5">
                    {[
                      { desc: "Landing Page — Clínica Estética Renova", cost: -1, date: "Hoje 14:20", type: "spend" },
                      { desc: "E-commerce — Pet Shop Bicho Feliz", cost: -1, date: "Ontem 10:05", type: "spend" },
                      { desc: "Renovação mensal — Plano Pro", cost: 150, date: "01/02/2026", type: "earn" }
                    ].map((t, i) => (
                      <div key={i} className="p-6 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">{t.desc}</div>
                          <div className="text-[10px] font-mono text-zinc-600 mt-1">{t.date}</div>
                        </div>
                        <div className={`font-mono font-bold ${t.type === "spend" ? "text-magenta-neon" : "text-green-neon"}`}>
                          {t.type === "spend" ? "-" : "+"}{Math.abs(t.cost)} cr
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-display font-bold text-white tracking-widest uppercase">Comprar Créditos</h3>
                {[
                  { credits: 100, price: "R$ 29", label: "Ideal para testar" },
                  { credits: 500, price: "R$ 97", label: "Mais popular" },
                  { credits: 2000, price: "R$ 247", label: "Melhor custo-benefício" }
                ].map((pkg, i) => (
                  <button 
                    key={i}
                    className="w-full bg-surface-dark border border-white/10 p-6 flex items-center justify-between group hover:border-cyan-neon/50 transition-all"
                  >
                    <div className="text-left">
                      <div className="text-2xl font-display font-bold text-gold-neon">🪙 {pkg.credits}</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase mt-1">{pkg.label}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-display font-bold text-white">{pkg.price}</div>
                      <div className="text-[10px] font-mono text-cyan-neon uppercase mt-1 group-hover:underline">Comprar</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedProject && (
          <ArtifactView 
            data={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
        {isEditorOpen && (
          <VisualEditor 
            project={editorProject} 
            onClose={() => setIsEditorOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
