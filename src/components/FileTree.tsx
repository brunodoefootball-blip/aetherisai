import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, FileCode, FileText, Folder } from "lucide-react";

interface FileData {
  path: string;
  content: string;
}

interface FileTreeProps {
  files: FileData[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

interface TreeNode {
  name: string;
  path: string;
  index?: number;
  children?: TreeNode[];
}

export default function FileTree({ files, activeIndex, onSelect }: FileTreeProps) {
  const tree = useMemo(() => {
    const root: TreeNode = { name: "root", path: "", children: [] };
    
    files.forEach((file, idx) => {
      const parts = file.path.split("/");
      let current = root;
      
      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          current.children?.push({ name: part, path: file.path, index: idx });
        } else {
          let folder = current.children?.find(c => c.name === part && c.children);
          if (!folder) {
            folder = { name: part, path: parts.slice(0, i + 1).join("/"), children: [] };
            current.children?.push(folder);
          }
          current = folder;
        }
      });
    });
    
    return root.children || [];
  }, [files]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "root": true });

  const toggle = (path: string) => {
    setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isFolder = !!node.children;
    const isExpanded = expanded[node.path];
    const isActive = node.index === activeIndex;

    return (
      <div key={node.path}>
        <button
          onClick={() => isFolder ? toggle(node.path) : onSelect(node.index!)}
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-sm text-[11px] font-mono transition-all ${
            isActive 
              ? "bg-cyan-neon/10 text-cyan-neon border-l-2 border-cyan-neon" 
              : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
          }`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
          {isFolder ? (
            <>
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <Folder className="w-3.5 h-3.5 text-zinc-600" />
            </>
          ) : (
            <>
              {node.name.endsWith(".md") ? <FileText className="w-3.5 h-3.5" /> : <FileCode className="w-3.5 h-3.5" />}
            </>
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {isFolder && isExpanded && (
          <div>{node.children?.map(child => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
      {tree.map(node => renderNode(node))}
    </div>
  );
}
