import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Problem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface ProblemSolutionProps {
  moduleCode: 'spider' | 'market' | 'docket' | 'nexus';
  sectionTitle?: string;
  sectionSubtitle?: string;
  problems: Problem[];
}

const MODULE_ICON_COLORS = {
  spider: 'text-indigo-600 bg-indigo-50',
  market: 'text-teal-600 bg-teal-50',
  docket: 'text-blue-600 bg-blue-50',
  nexus: 'text-blue-700 bg-blue-50',
};

export function ProblemSolution({
  moduleCode,
  sectionTitle = '¿Por qué elegirnos?',
  sectionSubtitle,
  problems,
}: ProblemSolutionProps) {
  const iconColors = MODULE_ICON_COLORS[moduleCode];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="mt-4 text-lg text-slate-600">
              {sectionSubtitle}
            </p>
          )}
        </div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300"
            >
              <div className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center mb-6',
                iconColors
              )}>
                <problem.icon className="w-7 h-7" strokeWidth={1.5} />
              </div>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {problem.title}
              </h3>
              
              <p className="text-slate-600 leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
