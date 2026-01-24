import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TOURS, type TourId } from "@/lib/tours/definitions";
import { useTourProgress } from "@/hooks/tours/useTourProgress";

type ActiveTour = {
  id: TourId;
  stepIndex: number;
  run: boolean;
};

function tourToJoyrideSteps(tourId: TourId): Step[] {
  return TOURS[tourId].steps.map((s) => ({
    target: s.target,
    title: s.title,
    content: s.content,
    disableBeacon: true,
    spotlightClicks: false,
  }));
}

export function TourRunner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tours, setTour } = useTourProgress();

  const [active, setActive] = useState<ActiveTour | null>(null);

  const joyrideSteps = useMemo(() => {
    if (!active) return [];
    return tourToJoyrideSteps(active.id);
  }, [active]);

  // Auto-start (Mixto): si el usuario entra por primera vez a la vista “entry” del módulo.
  useEffect(() => {
    const path = location.pathname;

    const candidates: Array<{ tourId: TourId; entry: string }> = [
      { tourId: "docket", entry: "/app/docket" },
      { tourId: "crm", entry: "/app/crm/contacts" },
      { tourId: "genius", entry: "/app/genius/analysis" },
    ];

    const candidate = candidates.find((c) => path === c.entry);
    if (!candidate) return;

    const state = (tours as any)?.[candidate.tourId] || {};
    if (state.completed || state.dismissed) return;
    if (active?.run) return;

    setActive({ id: candidate.tourId, stepIndex: state.stepIndex ?? 0, run: true });
  }, [location.pathname, tours, active?.run]);

  const startTour = (tourId: TourId) => {
    const state = (tours as any)?.[tourId] || {};
    setActive({ id: tourId, stepIndex: state.stepIndex ?? 0, run: true });
  };

  // Exponer método global sencillo para la página de Help.
  useEffect(() => {
    (window as any).__ipnexus_startTour = startTour;
    return () => {
      delete (window as any).__ipnexus_startTour;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tours]);

  const handleCallback = async (data: CallBackProps) => {
    if (!active) return;

    const { status, index, type } = data;
    const tourId = active.id;

    if (status === STATUS.FINISHED) {
      await setTour(tourId, { completed: true, stepIndex: 0 });
      setActive(null);
      return;
    }

    if (status === STATUS.SKIPPED) {
      await setTour(tourId, { dismissed: true, stepIndex: 0 });
      setActive(null);
      return;
    }

    // Persistir avance (híbrido)
    if (type === "step:after" || type === "error:target_not_found") {
      const nextIndex = (index ?? 0) + 1;
      await setTour(tourId, { stepIndex: nextIndex });
      setActive((prev) => (prev ? { ...prev, stepIndex: nextIndex } : prev));

      const nextStep = TOURS[tourId].steps[nextIndex];
      if (nextStep && location.pathname !== nextStep.route) {
        navigate(nextStep.route);
      }
    }
  };

  if (!active) return null;

  return (
    <Joyride
      steps={joyrideSteps}
      run={active.run}
      stepIndex={active.stepIndex}
      continuous
      scrollToFirstStep
      showSkipButton
      showProgress
      disableOverlayClose
      callback={handleCallback}
      styles={{
        options: {
          zIndex: 10000,
        },
      }}
    />
  );
}
