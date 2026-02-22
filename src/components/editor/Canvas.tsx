import { useEditorStore, ComponentNode } from '../../store/useEditorStore';
import { useDrop } from 'react-dnd';
import { cn } from '../../lib/utils';

export default function Canvas() {
  const { layout, addComponent, selectComponent, selectedId } = useEditorStore();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT',
    drop: (item: { type: string }) => {
      addComponent(item.type);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div 
      ref={drop as any}
      className={cn(
        "min-h-[800px] relative transition-colors",
        isOver && "bg-cyan-neon/5"
      )}
      onClick={() => selectComponent(null)}
    >
      {layout.map(node => (
        <RenderNode key={node.id} node={node} />
      ))}
    </div>
  );
}

function RenderNode({ node }: { node: ComponentNode }) {
  const { selectComponent, selectedId } = useEditorStore();
  const isSelected = selectedId === node.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectComponent(node.id);
  };

  const commonProps = {
    onClick: handleClick,
    className: cn(
      node.props.className,
      "relative group cursor-pointer transition-all",
      isSelected && "outline outline-2 outline-cyan-neon outline-offset-[-2px]"
    )
  };

  const SelectionOverlay = () => isSelected && (
    <div className="absolute -top-6 left-0 bg-cyan-neon text-black text-[10px] font-bold px-2 py-0.5 rounded-t-sm uppercase tracking-widest pointer-events-none z-50">
      {node.type}
    </div>
  );

  switch (node.type) {
    case 'Container':
      return (
        <div {...commonProps}>
          <SelectionOverlay />
          {node.children.map(child => <RenderNode key={child.id} node={child} />)}
          {node.children.length === 0 && (
            <div className="p-8 border border-dashed border-gray-200 text-gray-300 text-center text-sm">
              Container Vazio
            </div>
          )}
        </div>
      );
    case 'Heading':
      const Tag = `h${node.props.level || 1}` as any;
      return (
        <Tag {...commonProps}>
          <SelectionOverlay />
          {node.props.text}
        </Tag>
      );
    case 'Text':
      return (
        <p {...commonProps}>
          <SelectionOverlay />
          {node.props.text}
        </p>
      );
    case 'Button':
      return (
        <button {...commonProps}>
          <SelectionOverlay />
          {node.props.text}
        </button>
      );
    case 'Image':
      return (
        <div {...commonProps}>
          <SelectionOverlay />
          <img src={node.props.src} alt={node.props.alt} className="w-full h-auto" />
        </div>
      );
    default:
      return null;
  }
}
