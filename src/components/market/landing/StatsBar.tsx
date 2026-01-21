import { Star } from 'lucide-react';

interface StatsBarProps {
  totalAgents: number;
  avgSuccess: number;
  totalTransactions: number;
  avgRating: string;
}

export function StatsBar({ totalAgents, avgSuccess, totalTransactions, avgRating }: StatsBarProps) {
  return (
    <section className="bg-secondary text-primary-foreground py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-bold">{totalAgents}+</div>
            <div className="text-primary-foreground/70 mt-1">Agentes verificados</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold">{avgSuccess}%</div>
            <div className="text-primary-foreground/70 mt-1">Tasa de éxito</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold">{totalTransactions}+</div>
            <div className="text-primary-foreground/70 mt-1">Transacciones</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-1">
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              {avgRating}
            </div>
            <div className="text-primary-foreground/70 mt-1">Rating promedio</div>
          </div>
        </div>
      </div>
    </section>
  );
}
