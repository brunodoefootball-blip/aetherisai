import { useDrag } from 'react-dnd';
import { 
  Type, Square, Image as ImageIcon, 
  MousePointer2, Layout as LayoutIcon,
  Columns, List, Play
} from 'lucide-react';

const COMPONENT_TYPES = [
  { type: 'Container', icon: LayoutIcon, label: 'Container' },
  { type: 'Heading', icon: Type, label: 'Título' },
  { type: 'Text', icon: List, label: 'Texto' },
  { type: 'Button', icon: MousePointer2, label: 'Botão' },
  { type: 'Image', icon: ImageIcon, label: 'Imagem' },
  { type: 'Columns', icon: Columns, label: 'Colunas' },
  { type: 'Video', icon: Play, label: 'Vídeo' },
];

export default function ComponentPalette() {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Componentes Básicos</h4>
        <div className="grid grid-cols-2 gap-2">
          {COMPONENT_TYPES.map((comp) => (
            <DraggableItem key={comp.type} {...comp} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Seções Prontas</h4>
        <div className="space-y-2">
          {['Hero Section', 'Features', 'Pricing Table', 'Footer'].map(section => (
            <button 
              key={section}
              className="w-full p-3 bg-white/5 border border-white/5 rounded-sm text-left text-[10px] font-mono text-zinc-400 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest"
            >
              {section}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DraggableItem({ type, icon: Icon, label }: any) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as any}
      className={`
        flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 rounded-sm cursor-grab transition-all
        hover:bg-white/10 hover:border-white/20
        ${isDragging ? 'opacity-50 grayscale' : 'opacity-100'}
      `}
    >
      <Icon className="w-5 h-5 text-zinc-400 mb-2" />
      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}
