import { PlayCircle, RotateCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TOURS, type TourId } from "@/lib/tours/definitions";
import { useTourProgress } from "@/hooks/tours/useTourProgress";

function startTour(tourId: TourId) {
  const fn = (window as any)?.__ipnexus_startTour as ((id: TourId) => void) | undefined;
  fn?.(tourId);
}

export default function ToursPage() {
  const { tours, setTour, isLoading } = useTourProgress();

  const tourCards: Array<{ id: TourId }> = [{ id: "docket" }, { id: "crm" }, { id: "genius" }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tours guiados</h1>
        <p className="text-muted-foreground">Recorre cada módulo paso a paso y guarda tu progreso.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tourCards.map(({ id }) => {
          const state = (tours as any)?.[id] || {};
          const completed = !!state.completed;

          return (
            <Card key={id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{TOURS[id].title}</CardTitle>
                    <CardDescription>{TOURS[id].description}</CardDescription>
                  </div>
                  {completed ? <Badge variant="secondary">Completado</Badge> : <Badge variant="outline">Pendiente</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <Button onClick={() => startTour(id)} disabled={isLoading}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {completed ? "Repetir" : "Iniciar"}
                </Button>
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => setTour(id, { completed: false, dismissed: false, stepIndex: 0 })}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
