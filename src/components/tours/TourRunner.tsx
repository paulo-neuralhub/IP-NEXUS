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
  // DESACTIVADO: Los tours automáticos están deshabilitados temporalmente
  // para evitar tooltips molestos en producción
  return null;
}
