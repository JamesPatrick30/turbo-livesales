import { useEffect, useCallback, useRef } from "react";
import { driver, type DriveStep, type Config } from "driver.js";
import "driver.js/dist/driver.css";

// ─── Tour storage keys ────────────────────────────────────────────────────────
const TOUR_KEY_PREFIX = "livesales_tour_seen_";

function hasSeenTour(key: string): boolean {
  return localStorage.getItem(`${TOUR_KEY_PREFIX}${key}`) === "true";
}

function markTourSeen(key: string): void {
  localStorage.setItem(`${TOUR_KEY_PREFIX}${key}`, "true");
}

// ─── Shared driver config ─────────────────────────────────────────────────────
function buildDriver(steps: DriveStep[], onDestroy?: () => void) {
  const config: Config = {
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayOpacity: 0.65,
    stagePadding: 8,
    stageRadius: 8,
    showProgress: true,
    progressText: "{{current}} of {{total}}",
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Got it",
    steps,
    onDestroyStarted: () => {
      driverObj.destroy();
      onDestroy?.();
    },
  };

  const driverObj = driver(config);
  return driverObj;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
interface UseTourOptions {
  /** Unique key used for localStorage — e.g. "admin_dashboard" */
  tourKey: string;
  steps: DriveStep[];
  /** Delay in ms before auto-starting (default: 600ms) */
  delay?: number;
  /** Skip auto-trigger; only run when startTour() is called manually */
  manualOnly?: boolean;
}

export function useTour({ tourKey, steps, delay = 600, manualOnly = false }: UseTourOptions) {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);

  const startTour = useCallback(() => {
    // Destroy any existing instance
    driverRef.current?.destroy();

    driverRef.current = buildDriver(steps, () => {
      markTourSeen(tourKey);
    });

    driverRef.current.drive();
  }, [tourKey, steps]);

  // Auto-trigger on first visit
  useEffect(() => {
    if (manualOnly) return;
    if (hasSeenTour(tourKey)) return;

    const timer = setTimeout(() => {
      // Guard: only start if the first element actually exists in the DOM
      const firstStep = steps[0];
      if (firstStep?.element) {
        const el = document.querySelector(firstStep.element as string);
        if (!el) return;
      }
      startTour();
    }, delay);

    return () => {
      clearTimeout(timer);
      driverRef.current?.destroy();
    };
  }, [tourKey, manualOnly, delay, startTour, steps]);

  return { startTour };
}