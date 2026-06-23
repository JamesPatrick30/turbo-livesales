import { useEffect, useState } from "react";

const MESSAGES = [
  "Connecting to backend…",
  "Waking up the server…",
  "Almost there…",
  "Still warming up, just a moment…",
];

export default function WakingUpScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => Math.min(prev + 1, MESSAGES.length - 1));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Pulsing server icon */}
      <div className="relative flex items-center justify-center w-20 h-20 mb-8">
        {/* Pulse rings */}
        <span className="absolute inset-0 rounded-full border border-blue-500/40 animate-ping" />
        <span
          className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping"
          style={{ animationDelay: "0.6s" }}
        />

        {/* Spinning border */}
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />

        {/* Icon circle */}
        <div className="relative z-10 w-20 h-20 rounded-full bg-[#0e2a45] border border-blue-900 flex items-center justify-center">
          <ServerIcon className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      {/* Text */}
      <h1 className="text-white text-lg font-medium mb-2 text-center">
        Waking up the server
      </h1>
      <p className="text-gray-500 text-sm text-center max-w-xs leading-relaxed mb-8">
        The backend is starting from sleep. This only happens after a period of
        inactivity — it'll be ready in a moment.
      </p>

      {/* Progress bar */}
      <div className="w-64 h-1 bg-[#1e2330] rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{
            animation: "wakeup-progress 40s cubic-bezier(0.3,0,0.7,1) forwards",
          }}
        />
      </div>

      {/* Animated status */}
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-xs text-gray-600 font-mono tracking-wide transition-all duration-500">
          {MESSAGES[messageIndex]}
        </span>
      </div>

      {/* ETA badge */}
      <div className="mt-8 px-4 py-1.5 rounded-full border border-[#1e2d3d] bg-[#111827] text-xs text-gray-600">
        Usually takes <span className="text-blue-700/80">~30–50 seconds</span> on first load
      </div>

      {/* Keyframe for progress bar */}
      <style>{`
        @keyframes wakeup-progress {
          0%   { width: 0%; }
          30%  { width: 40%; }
          60%  { width: 65%; }
          85%  { width: 85%; }
          100% { width: 95%; }
        }
      `}</style>
    </div>
  );
}

function ServerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  );
}