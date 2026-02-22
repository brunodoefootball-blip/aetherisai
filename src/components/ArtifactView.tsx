import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Code, Eye, Download, X, Copy, Check, Monitor, Smartphone, 
  Terminal, Maximize2, FileCode, FileText, ChevronRight, Folder,
  GitCompare, Zap, Gauge, Wand2, Loader2, ShieldCheck, Activity, Share2
} from "lucide-react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-markdown";
import ReactDiffViewer from "react-diff-viewer-continued";
import FileTree from "./FileTree";
import * as prettier from "prettier/standalone";
import * as prettierPluginHtml from "prettier/plugins/html";
import * as prettierPluginEstree from "prettier/plugins/estree";
import * as prettierPluginBabel from "prettier/plugins/babel";
import * as prettierPluginPostcss from "prettier/plugins/postcss";

interface FileData {
  path: string;
  content: string;
}

interface ArtifactViewProps {
  data: {
    id?: string | number;
    name: string;
    description: string;
    features: string[];
    files: FileData[];
  };
  previousData?: {
    files: FileData[];
  };
  onClose: () => void;
}

export default function ArtifactView({ data, previousData, onClose }: ArtifactViewProps) {
  const [mode, setMode] = useState<"preview" | "code" | "diff" | "performance">("preview");
  const [viewSize, setViewSize] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [isFormatting, setIsFormatting] = useState(false);
  const [localFiles, setLocalFiles] = useState<FileData[]>(data.files || []);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (data.files) {
      setLocalFiles(data.files);
      setActiveFileIndex(0);
    }
  }, [data]);

  const activeFile = localFiles[activeFileIndex] || localFiles[0] || { path: "error.txt", content: "No files found" };
  const previousFile = previousData?.files?.find(f => f.path === activeFile.path);

  const formatActiveFile = async () => {
    setIsFormatting(true);
    try {
      let parser = "";
      let plugins = [];
      
      if (activeFile.path.endsWith(".html")) {
        parser = "html";
        plugins = [prettierPluginHtml];
      } else if (activeFile.path.endsWith(".js")) {
        parser = "babel";
        plugins = [prettierPluginBabel, prettierPluginEstree];
      } else if (activeFile.path.endsWith(".css")) {
        parser = "css";
        plugins = [prettierPluginPostcss];
      }

      if (parser) {
        const formatted = await prettier.format(activeFile.content, {
          parser,
          plugins,
          printWidth: 80,
          tabWidth: 2,
        });
        
        const newFiles = [...localFiles];
        newFiles[activeFileIndex] = { ...activeFile, content: formatted };
        setLocalFiles(newFiles);
      }
    } catch (e) {
      console.error("Formatting failed", e);
    } finally {
      setIsFormatting(false);
    }
  };

  useEffect(() => {
    if (mode === "code" && codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [mode, activeFileIndex, localFiles]);

  const copyCode = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAllFiles = () => {
    const allContent = localFiles.map(f => `// FILE: ${f.path}\n${f.content}`).join("\n\n");
    navigator.clipboard.writeText(allContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadProject = () => {
    const blob = new Blob([activeFile.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.path;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLanguage = (path: string) => {
    if (path.endsWith(".html")) return "markup";
    if (path.endsWith(".js")) return "javascript";
    if (path.endsWith(".css")) return "css";
    if (path.endsWith(".md")) return "markdown";
    return "clike";
  };

  const getPreviewHtml = () => {
    const htmlFile = localFiles.find(f => f.path === "index.html");
    if (!htmlFile) return "<h1>No index.html found</h1>";
    let content = htmlFile.content;
    localFiles.forEach(f => {
      if (f.path.endsWith(".css")) {
        const styleTag = `<style>${f.content}</style>`;
        content = content.replace(/<link.*href=["'].*styles\.css["'].*>/, () => styleTag);
        if (!content.includes(f.content)) content = content.replace("</head>", () => `${styleTag}</head>`);
      }
      if (f.path.endsWith(".js")) {
        const scriptTag = `<script>${f.content}</script>`;
        content = content.replace(/<script.*src=["'].*main\.js["'].*><\/script>/, () => scriptTag);
        if (!content.includes(f.content)) content = content.replace("</body>", () => `${scriptTag}</body>`);
      }
    });
    return content;
  };

  const metrics = useMemo(() => {
    const size = activeFile.content.length;
    const lines = activeFile.content.split("\n").length;
    const complexity = (activeFile.content.match(/\{/g) || []).length;
    const loadTime = (size / 1024 / 2).toFixed(2); // Simulated 2MB/s
    
    return {
      size: (size / 1024).toFixed(1) + " KB",
      lines,
      loadTime: loadTime + "ms",
      score: Math.max(40, 100 - (complexity / 2) - (size / 5000)).toFixed(0),
      accessibility: Math.min(100, 85 + Math.random() * 15).toFixed(0),
      seo: Math.min(100, 90 + Math.random() * 10).toFixed(0),
      optimizations: [
        size > 10000 ? "Minificar código para reduzir payload" : "Tamanho de arquivo otimizado",
        complexity > 50 ? "Refatorar componentes complexos" : "Estrutura modular detectada",
        "Habilitar compressão Gzip no servidor",
        "Adicionar tags alt em imagens (se houver)",
        "Utilizar fontes variáveis para reduzir requisições"
      ]
    };
  }, [activeFile]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-surface-darker/95 backdrop-blur-xl" onClick={onClose} />
      
      <div className={`relative w-full h-full ${isFullscreen ? "max-w-none" : "max-w-7xl"} bg-surface-dark border border-white/10 rounded-sm overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-500`}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-surface-darker/50">
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-neon to-magenta-neon rounded-sm flex items-center justify-center font-display text-xl text-black font-bold">A</div>
            <div>
              <h3 className="text-white font-display text-xl tracking-wider uppercase leading-none">{data.name}</h3>
              <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest mt-1.5">Aetheris IDE v3.0 Platinum</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-black/50 rounded-sm p-1 border border-white/5">
              {[
                { id: "preview", icon: Eye, label: "Preview" },
                { id: "code", icon: Code, label: "Code" },
                { id: "diff", icon: GitCompare, label: "Diff" },
                { id: "performance", icon: Gauge, label: "Stats" }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setMode(t.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-all ${
                    mode === t.id ? "bg-white text-black" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              ))}
            </div>

            {mode === "preview" && (
              <div className="flex bg-black/50 rounded-sm p-1 border border-white/5">
                <button onClick={() => setViewSize("desktop")} className={`p-2 rounded-sm transition-all ${viewSize === "desktop" ? "bg-zinc-800 text-cyan-neon" : "text-zinc-600 hover:text-white"}`}><Monitor className="w-4 h-4" /></button>
                <button onClick={() => setViewSize("mobile")} className={`p-2 rounded-sm transition-all ${viewSize === "mobile" ? "bg-zinc-800 text-cyan-neon" : "text-zinc-600 hover:text-white"}`}><Smartphone className="w-4 h-4" /></button>
              </div>
            )}

            <div className="w-px h-6 bg-white/5 mx-2" />

            <button onClick={() => setIsFullscreen(!isFullscreen)} className={`p-2.5 transition-colors ${isFullscreen ? "text-cyan-neon" : "text-zinc-500 hover:text-white"}`} title="Full Screen"><Maximize2 className="w-5 h-5" /></button>
            <button onClick={copyAllFiles} className="p-2.5 text-zinc-500 hover:text-cyan-neon transition-colors" title="Copy All Files"><Copy className="w-5 h-5" /><span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-neon rounded-full" /></button>
            <button onClick={copyCode} className="p-2.5 text-zinc-500 hover:text-cyan-neon transition-colors" title="Copy File"><Copy className="w-5 h-5" /></button>
            <button onClick={() => {
              const url = `${window.location.origin}/preview/${data.id || 'temp'}`;
              navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }} className="p-2.5 text-zinc-500 hover:text-cyan-neon transition-colors" title="Share Project"><Share2 className="w-5 h-5" /></button>
            <button onClick={downloadProject} className="p-2.5 text-zinc-500 hover:text-cyan-neon transition-colors" title="Download File"><Download className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-2.5 text-zinc-500 hover:text-magenta-neon transition-colors ml-2"><X className="w-6 h-6" /></button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden bg-black">
          {/* Sidebar */}
          {(mode === "code" || mode === "diff" || mode === "performance") && (
            <div className="w-64 border-r border-white/5 bg-surface-darker/50 flex flex-col">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">File Explorer</span>
                <Folder className="w-3 h-3 text-zinc-600" />
              </div>
              <FileTree files={localFiles} activeIndex={activeFileIndex} onSelect={setActiveFileIndex} />
              
              <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Active File Stats</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono"><span className="text-zinc-500">Lines</span><span className="text-cyan-neon">{metrics.lines}</span></div>
                  <div className="flex justify-between text-[9px] font-mono"><span className="text-zinc-500">Size</span><span className="text-cyan-neon">{metrics.size}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Main Viewer */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            {mode === "preview" ? (
              <div className="p-6 w-full h-full flex items-center justify-center">
                <div className={`h-full bg-white shadow-[0_0_100px_rgba(0,0,0,0.8)] transition-all duration-700 ease-in-out overflow-hidden rounded-sm ${viewSize === "desktop" ? "w-full" : "w-[375px]"}`}>
                  <iframe srcDoc={getPreviewHtml()} className="w-full h-full border-none" title="Preview" />
                </div>
              </div>
            ) : mode === "code" ? (
              <div className="w-full h-full bg-[#1e1e1e] overflow-auto relative group">
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button 
                    onClick={formatActiveFile}
                    disabled={isFormatting}
                    className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-400 hover:text-cyan-neon disabled:opacity-50 transition-all uppercase tracking-widest flex items-center gap-2"
                  >
                    {isFormatting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} 
                    Auto-Format
                  </button>
                  <div className="px-3 py-1 bg-black/50 border border-white/10 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                    {getLanguage(activeFile.path)}
                  </div>
                </div>
                <pre className="p-8 text-sm leading-relaxed">
                  <code ref={codeRef} className={`language-${getLanguage(activeFile.path)}`}>{activeFile.content}</code>
                </pre>
              </div>
            ) : mode === "diff" ? (
              <div className="w-full h-full bg-[#1e1e1e] overflow-auto p-8">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <GitCompare className="w-3 h-3" /> Comparando: {activeFile.path}
                </div>
                <ReactDiffViewer
                  oldValue={previousFile?.content || ""}
                  newValue={activeFile.content}
                  splitView={true}
                  useDarkTheme={true}
                  styles={{
                    variables: { dark: { diffViewerBackground: "#1e1e1e", addedBackground: "#00f5ff10", wordAddedBackground: "#00f5ff30" } }
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-full bg-surface-darker p-12 overflow-auto">
                <div className="max-w-4xl mx-auto space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white/5 p-6 border border-white/5 rounded-sm">
                      <div className="flex items-center gap-2 text-cyan-neon mb-2">
                        <Gauge className="w-4 h-4" />
                        <span className="text-[10px] font-mono uppercase tracking-widest">Performance</span>
                      </div>
                      <div className="text-4xl font-display font-bold text-white">{metrics.score}</div>
                    </div>
                    <div className="bg-white/5 p-6 border border-white/5 rounded-sm">
                      <div className="flex items-center gap-2 text-green-neon mb-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-mono uppercase tracking-widest">Acessibilidade</span>
                      </div>
                      <div className="text-4xl font-display font-bold text-white">{metrics.accessibility}</div>
                    </div>
                    <div className="bg-white/5 p-6 border border-white/5 rounded-sm">
                      <div className="flex items-center gap-2 text-gold-neon mb-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] font-mono uppercase tracking-widest">SEO Score</span>
                      </div>
                      <div className="text-4xl font-display font-bold text-white">{metrics.seo}</div>
                    </div>
                    <div className="bg-white/5 p-6 border border-white/5 rounded-sm">
                      <div className="flex items-center gap-2 text-magenta-neon mb-2">
                        <Zap className="w-4 h-4" />
                        <span className="text-[10px] font-mono uppercase tracking-widest">Load Time</span>
                      </div>
                      <div className="text-4xl font-display font-bold text-white">{metrics.loadTime}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h4 className="text-white font-display font-bold uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-4 h-4 text-gold-neon" /> Otimizações Sugeridas
                      </h4>
                      <div className="space-y-3">
                        {metrics.optimizations.map((opt, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-neon" />
                            <span className="text-xs font-mono text-zinc-300 uppercase tracking-wider">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-white font-display font-bold uppercase tracking-widest flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-cyan-neon" /> Detalhes do Arquivo
                      </h4>
                      <div className="bg-white/5 border border-white/5 p-6 rounded-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">Nome</span>
                          <span className="text-xs font-mono text-white">{activeFile.path}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">Tamanho</span>
                          <span className="text-xs font-mono text-white">{metrics.size}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-4">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">Linhas</span>
                          <span className="text-xs font-mono text-white">{metrics.lines}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">Linguagem</span>
                          <span className="text-xs font-mono text-cyan-neon uppercase">{getLanguage(activeFile.path)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-white/5 bg-surface-darker/50 flex items-center justify-between">
          <div className="flex gap-3">
            {data.features?.slice(0, 3).map((f, i) => (
              <span key={i} className="px-2.5 py-1 bg-cyan-neon/5 text-cyan-neon text-[9px] font-mono uppercase tracking-widest border border-cyan-neon/10">■ {f}</span>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-green-neon animate-pulse" /> Live Runtime Active
            </div>
            <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest italic hidden md:block">
              {data.description.substring(0, 60)}...
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
