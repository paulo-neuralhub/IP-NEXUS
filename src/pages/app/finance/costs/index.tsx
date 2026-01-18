import { CostsList } from '@/components/features/finance';

export default function CostsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Costes</h1>
        <p className="text-muted-foreground">Gestión de costes por expediente</p>
      </div>
      <CostsList showMatterColumn={true} />
    </div>
  );
}
