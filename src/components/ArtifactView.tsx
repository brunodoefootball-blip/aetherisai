import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Code, Eye, Download, X, Copy, Check, Monitor, Smartphone, 
  Terminal, Maximize2, FileCode, FileText, ChevronRight, Folder,
  GitCompare, Zap, Gauge, Wand2
} from "lucide-react";
import Prism from "prismjs";
import ReactDiffViewer from "react-diff-viewer-continued";
import FileTree from "./FileTree";

// Simplified formatting for the demo
const formatCode = (code: string, lang: string) => {
  if (lang === "markup" || lang === "javascript" || lang === "css") {
    // Basic indentation logic for demo if prettier is too complex to setup here
    return code.split("\n").map(line => line.trim()).join("\n")
      .replace(/\{/g, " {\n  ")
      .replace(/\}/g, "\n}\n")
      .replace(/;/g, ";\n  ")
      .replace(/>/g, ">\n  ")
      .split("\n").filter(l => l.trim()).join("\n");
  }
  return code;
};

interface FileData {
  path: string;
  content: string;
}

interface ArtifactViewProps {
  data: {
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
  const codeRef = useRef<HTMLElement>(null);

  const activeFile = data.files[activeFileIndex] || data.files[0];
  const previousFile = previousData?.files.find(f => f.path === activeFile.path);

  useEffect(() => {
    if (mode === "code") {
      Prism.highlightAll();
    }
  }, [mode, activeFileIndex]);

  const copyCode = () => {
    navigator.clipboard.writeText(activeFile.content);
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
    const htmlFile = data.files.find(f => f.path === "index.html");
    if (!htmlFile) return "<h1>No index.html found</h1>";
    let content = htmlFile.content;
    data.files.forEach(f => {
      if (f.path.endsWith(".css")) {
        content = content.replace(/<link.*href=["'].*styles\.css["'].*>/, `<style>${f.content}</style>`);
        if (!content.includes(f.content)) content = content.replace("</head>", `<style>${f.content}</style></head>`);
      }
      if (f.path.endsWith(".js")) {
        content = content.replace(/<script.*src=["'].*main\.js["'].*><\/script>/, `<script>${f.content}</script>`);
        if (!content.includes(f.content)) content = content.replace("</body>", `<script>${f.content}</script></body>`);
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
      optimizations: [
        size > 10000 ? "Minificar código para reduzir payload" : "Tamanho de arquivo otimizado",
        complexity > 50 ? "Refatorar componentes complexos" : "Estrutura modular detectada",
        "Habilitar compressão Gzip no servidor"
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
            <button onClick={copyCode} className="p-2.5 text-zinc-500 hover:text-cyan-neon transition-colors" title="Copy File"><Copy className="w-5 h-5" /></button>
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
              <FileTree files={data.files} activeIndex={activeFileIndex} onSelect={setActiveFileIndex} />
              
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
                  <button className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-mono text-zinc-400 hover:text-cyan-neon transition-all uppercase tracking-widest flex items-center gap-2">
                    <Wand2 className="w-3 h-3" /> Auto-Format
                  </button>
                  <div className="px-3 py-1 bg-black/50 border border-white/10 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                    {getLanguage(activeFile.path)}
                  </div>
                </div>
                <pre className="p-8 text-sm leading-relaxed">
                  <code className={`language-${getLanguage(activeFile.path)}`}>{activeFile.content}</code>
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
                <div className="max-w-3xl mx-auto space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 p-6 border border-white/5">
                      <div className="text-4xl font-display font-bold text-cyan-neon">{metrics.score}</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Performance Score</div>
                    </div>
                    <div className="bg-white/5 p-6 border border-white/5">
                      <div className="text-4xl font-display font-bold text-white">{metrics.loadTime}</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Estimated Load</div>
                    </div>
                    <div className="bg-white/5 p-6 border border-white/5">
                      <div className="text-4xl font-display font-bold text-magenta-neon">{metrics.size}</div>
                      <div className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Payload Size</div>
                    </div>
                  </div>

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
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-white/5 bg-surface-darker/50 flex items-center justify-between">
          <div className="flex gap-3">
            {data.features.slice(0, 3).map((f, i) => (
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
