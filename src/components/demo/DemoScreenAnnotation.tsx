import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  Pen, 
  Highlighter, 
  Eraser, 
  Trash2, 
  X, 
  Palette,
  Undo2,
  Circle,
  MousePointer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type Tool = 'pointer' | 'pen' | 'highlighter' | 'eraser';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  tool: 'pen' | 'highlighter';
  color: string;
  width: number;
}

const COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#000000', // black
  '#FFFFFF', // white
];

interface DemoScreenAnnotationProps {
  isActive: boolean;
  onClose: () => void;
}

export function DemoScreenAnnotation({ isActive, onClose }: DemoScreenAnnotationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#EF4444');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Resize canvas to fill screen
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        redrawCanvas();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redraw canvas when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [strokes]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;

      if (stroke.tool === 'highlighter') {
        ctx.globalAlpha = 0.4;
      } else {
        ctx.globalAlpha = 1;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }, [strokes]);

  const getPointerPosition = (e: React.PointerEvent): Point => {
    return { x: e.clientX, y: e.clientY };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (tool === 'pointer') return;

    setIsDrawing(true);
    const pos = getPointerPosition(e);

    if (tool === 'eraser') {
      // Erase strokes near the touch point
      setStrokes((prev) =>
        prev.filter((stroke) => {
          return !stroke.points.some(
            (p) => Math.hypot(p.x - pos.x, p.y - pos.y) < 20
          );
        })
      );
    } else {
      setCurrentStroke([pos]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;

    const pos = getPointerPosition(e);

    if (tool === 'eraser') {
      setStrokes((prev) =>
        prev.filter((stroke) => {
          return !stroke.points.some(
            (p) => Math.hypot(p.x - pos.x, p.y - pos.y) < 20
          );
        })
      );
    } else {
      setCurrentStroke((prev) => [...prev, pos]);

      // Draw current stroke in real-time
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const points = [...currentStroke, pos];
      if (points.length < 2) return;

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = tool === 'highlighter' ? 20 : 4;

      if (tool === 'highlighter') {
        ctx.globalAlpha = 0.4;
      } else {
        ctx.globalAlpha = 1;
      }

      const lastTwo = points.slice(-2);
      ctx.moveTo(lastTwo[0].x, lastTwo[0].y);
      ctx.lineTo(lastTwo[1].x, lastTwo[1].y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 1 && (tool === 'pen' || tool === 'highlighter')) {
      setStrokes((prev) => [
        ...prev,
        {
          points: currentStroke,
          tool,
          color,
          width: tool === 'highlighter' ? 20 : 4,
        },
      ]);
    }
    setCurrentStroke([]);
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Canvas para dibujar - pointer-events solo cuando tool != pointer */}
      <canvas
        ref={canvasRef}
        className={cn(
          'absolute inset-0',
          tool === 'pointer' ? 'pointer-events-none' : 'cursor-crosshair'
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Toolbar flotante */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-2xl bg-background/95 backdrop-blur border shadow-xl p-2">
        {/* Selector herramienta */}
        <Button
          size="icon"
          variant={tool === 'pointer' ? 'default' : 'ghost'}
          onClick={() => setTool('pointer')}
          title="Puntero (no dibuja)"
        >
          <MousePointer className="h-4 w-4" />
        </Button>
        
        <Button
          size="icon"
          variant={tool === 'pen' ? 'default' : 'ghost'}
          onClick={() => setTool('pen')}
          title="Bolígrafo"
        >
          <Pen className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant={tool === 'highlighter' ? 'default' : 'ghost'}
          onClick={() => setTool('highlighter')}
          title="Resaltador"
        >
          <Highlighter className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant={tool === 'eraser' ? 'default' : 'ghost'}
          onClick={() => setTool('eraser')}
          title="Borrador"
        >
          <Eraser className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Color picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost" title="Color">
              <Circle className="h-4 w-4" style={{ fill: color, color }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="center">
            <div className="grid grid-cols-5 gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={cn(
                    'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',
                    color === c ? 'border-primary scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Acciones */}
        <Button
          size="icon"
          variant="ghost"
          onClick={handleUndo}
          disabled={strokes.length === 0}
          title="Deshacer"
        >
          <Undo2 className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={handleClear}
          disabled={strokes.length === 0}
          title="Limpiar todo"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          title="Cerrar anotaciones"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Instrucción si pointer mode */}
      {tool === 'pointer' && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-muted/90 backdrop-blur px-4 py-2 text-sm text-muted-foreground">
          Modo puntero: puedes hacer clic en la app. Cambia a bolígrafo para dibujar.
        </div>
      )}
    </div>
  );
}
