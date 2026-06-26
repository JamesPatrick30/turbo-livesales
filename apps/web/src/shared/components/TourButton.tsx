import { HelpCircle } from "lucide-react";

interface TourButtonProps {
  onClick: () => void;
  label?: string;
}

/**
 * A small floating button that re-triggers the page tour.
 * Drop it anywhere in the page layout — typically bottom-right or near the page header.
 *
 * Usage:
 *   const { startTour } = useTour({ ... });
 *   <TourButton onClick={startTour} />
 */
export function TourButton({ onClick, label = "Take a tour" }: TourButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="
        inline-flex items-center gap-1.5
        rounded-full
        bg-zinc-900 border border-amber-500/20
        text-amber-500 hover:text-amber-400
        hover:border-amber-500/40 hover:bg-zinc-800
        px-3 py-1.5
        text-xs font-medium
        transition-all duration-150
        shadow-sm
      "
    >
      <HelpCircle size={14} strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
}