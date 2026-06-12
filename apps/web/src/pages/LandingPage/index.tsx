import { useEffect, useState } from "react";

const TICKET_LINES = [
  { qty: "2×", name: "Sinigang na Baboy", price: "₱370" },
  { qty: "1×", name: "Crispy Pata", price: "₱380" },
  { qty: "3×", name: "Iced Tea", price: "₱165" },
  { qty: "4×", name: "Steamed Rice", price: "₱120" },
];

const FEATURES = [
  {
    icon: "⚡",
    title: "Real-time order sync",
    desc: "Orders placed by the cashier appear on the kitchen screen instantly — no shouting, no paper slips.",
  },
  {
    icon: "🧾",
    title: "Live sales tracking",
    desc: "Every transaction updates the admin dashboard the moment it's paid. Always know today's numbers.",
  },
  {
    icon: "🎯",
    title: "Role-based views",
    desc: "Cashier, cook, and boss each see exactly what they need — nothing more, nothing less.",
  },
  {
    icon: "📊",
    title: "Sales analytics",
    desc: "Top items, peak hours, revenue by category — all in one place, no spreadsheets required.",
  },
];

const ROLES = [
  {
    role: "Cashier",
    color: "border-amber-500/40 bg-amber-500/5",
    badge: "bg-amber-500/15 text-amber-400",
    points: [
      "Browse menu by category",
      "Build orders with live totals",
      "Place orders straight to kitchen",
      "View all active order statuses",
    ],
  },
  {
    role: "Cook",
    color: "border-orange-500/40 bg-orange-500/5",
    badge: "bg-orange-500/15 text-orange-400",
    points: [
      "Kitchen queue with ticket view",
      "One tap to start cooking",
      "Mark orders ready when done",
      "Active vs completed separation",
    ],
  },
  {
    role: "Admin / Boss",
    color: "border-violet-500/40 bg-violet-500/5",
    badge: "bg-violet-500/15 text-violet-400",
    points: [
      "Real-time sales dashboard",
      "Hourly revenue breakdown",
      "Top-selling items ranked",
      "Full order log with filters",
    ],
  },
];

function AnimatedTicket() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showTotal, setShowTotal] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= TICKET_LINES.length) {
        clearInterval(interval);
        setTimeout(() => setShowTotal(true), 300);
        setTimeout(() => setStatusText("preparing"), 800);
      }
    }, 420);
    return () => clearInterval(interval);
  }, []);

  const total = TICKET_LINES.slice(0, visibleLines).reduce((acc, l) => {
    const num = parseInt(l.price.replace("₱", "").replace(",", ""));
    return acc + num;
  }, 0);

  return (
    <div className="font-mono text-sm bg-neutral-900 border border-dashed border-neutral-600 rounded-xl p-5 w-72 shadow-2xl">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-neutral-400 text-xs tracking-widest uppercase">
            Order
          </p>
          <p className="text-white font-bold text-lg leading-tight">#0041</p>
          <p className="text-neutral-500 text-xs mt-0.5">Table 3</p>
        </div>
        {statusText && (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/15 text-blue-400 font-sans animate-pulse">
            Preparing
          </span>
        )}
      </div>

      <div className="border-t border-dashed border-neutral-700 pt-3 space-y-2 min-h-[88px]">
        {TICKET_LINES.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className="flex justify-between items-center animate-in fade-in duration-300"
          >
            <span>
              <span className="text-amber-400 font-semibold">{line.qty}</span>{" "}
              <span className="text-neutral-300">{line.name}</span>
            </span>
            <span className="text-neutral-400">{line.price}</span>
          </div>
        ))}
      </div>

      {showTotal && (
        <div className="border-t border-dashed border-neutral-700 mt-3 pt-3 flex justify-between items-center animate-in fade-in duration-300">
          <span className="text-neutral-400 text-xs uppercase tracking-wider">
            Total
          </span>
          <span className="text-white font-bold text-base">
            ₱{total.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5 sticky top-0 bg-[#0d0d0f]/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-xl">⚡</span>
          <span className="font-semibold tracking-tight text-base">
            LiveSales
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#roles" className="hover:text-white transition-colors">
            Roles
          </a>
          <a href="#demo" className="hover:text-white transition-colors">
            Demo
          </a>
        </div>
        <a
          href="#demo"
          className="text-sm px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors"
        >
          Try demo
        </a>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col lg:flex-row items-center justify-between gap-12 px-8 lg:px-16 py-20 lg:py-28 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex-1 relative z-10 max-w-xl">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-400 mb-4">
            Real-time POS system
          </p>
          <h1 className="text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-6">
            Orders go in.
            <br />
            <span className="text-amber-400">Food comes out.</span>
            <br />
            Boss stays happy.
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed mb-8">
            LiveSales connects your cashier, kitchen, and admin in one live
            loop — no delays, no confusion, no missed orders.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#demo"
              className="px-6 py-3 rounded-lg bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors"
            >
              Try the demo
            </a>
            <a
              href="#features"
              className="px-6 py-3 rounded-lg border border-white/10 text-neutral-300 text-sm hover:border-white/25 hover:text-white transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Ticket animation */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-400/5 rounded-3xl blur-2xl scale-110 pointer-events-none" />
          <AnimatedTicket />
        </div>
      </section>

      {/* Stats strip */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-3 divide-x divide-white/5">
          {[
            { val: "3", label: "Roles in one system" },
            { val: "Live", label: "Order sync via WebSocket" },
            { val: "0", label: "Spreadsheets needed" },
          ].map(({ val, label }) => (
            <div key={label} className="px-8 text-center">
              <div className="text-3xl font-bold text-amber-400">{val}</div>
              <div className="text-sm text-neutral-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-20">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-400 mb-3">
          Built for food service
        </p>
        <h2 className="text-3xl font-bold tracking-tight mb-12">
          Everything the floor needs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white/[0.03] border border-white/8 rounded-xl p-6 hover:border-amber-500/30 transition-colors group"
            >
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-sm text-white mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed group-hover:text-neutral-400 transition-colors">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="max-w-7xl mx-auto px-8 py-20">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-400 mb-3">
          Three roles, one system
        </p>
        <h2 className="text-3xl font-bold tracking-tight mb-12">
          Everyone sees what they need
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ROLES.map((r) => (
            <div
              key={r.role}
              className={`border rounded-xl p-6 ${r.color}`}
            >
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.badge}`}>
                {r.role}
              </span>
              <ul className="mt-5 space-y-2.5">
                {r.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5 text-sm text-neutral-300"
                  >
                    <span className="text-neutral-600 mt-0.5">—</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Demo CTA */}
      <section
        id="demo"
        className="max-w-7xl mx-auto px-8 py-20 text-center"
      >
        <div className="relative border border-white/8 rounded-2xl bg-white/[0.02] px-8 py-16 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-400 mb-4 relative">
            Live demo
          </p>
          <h2 className="text-4xl font-bold tracking-tight mb-4 relative">
            See it run in real time
          </h2>
          <p className="text-neutral-400 text-base mb-8 max-w-md mx-auto relative">
            Switch between cashier, cook, and admin views. Place an order and
            watch it hit the kitchen queue instantly.
          </p>
          <a
            href="/demo"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-amber-500 text-black font-semibold text-sm hover:bg-amber-400 transition-colors relative"
          >
            Open the demo
            <span className="text-base">→</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-amber-400">⚡</span>
          <span>LiveSales</span>
          <span className="text-neutral-700">·</span>
          <span>Sales demo — no inventory</span>
        </div>
        <div className="flex items-center gap-6">
          <span>React + Vite</span>
          <span>NestJS</span>
          <span>Socket.IO</span>
          <span>PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
}