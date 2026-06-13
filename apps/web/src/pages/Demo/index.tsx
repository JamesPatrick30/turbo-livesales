import { useNavigate } from "react-router-dom";
import { useState, type JSX } from "react";
import api from "../../lib/axios";
type Role = "cashier" | "cook" | "admin";

interface RoleConfig {
  role: Role;
  label: string;
  email: string;
  password: string;
  description: string;
  access: string[];
  accent: {
    badge: string;
    border: string;
    bg: string;
    icon: string;
    spinner: string;
  };
}

const ROLES: RoleConfig[] = [
  {
    role: "cashier",
    label: "Cashier",
    email: "cashier@demo.com",
    password: "demo1234",
    description: "Take orders, build the cart, send to kitchen.",
    access: ["New order", "Menu browser", "Order status"],
    accent: {
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      border: "border-amber-500/30 hover:border-amber-500/60",
      bg: "hover:bg-amber-500/5",
      icon: "text-amber-400",
      spinner: "border-amber-400",
    },
  },
  {
    role: "cook",
    label: "Cook",
    email: "cook@demo.com",
    password: "demo1234",
    description: "See the live kitchen queue, mark orders ready.",
    access: ["Kitchen queue", "Order tickets", "Status updates"],
    accent: {
      badge: "bg-orange-500/15 text-orange-400 border-orange-500/20",
      border: "border-orange-500/30 hover:border-orange-500/60",
      bg: "hover:bg-orange-500/5",
      icon: "text-orange-400",
      spinner: "border-orange-400",
    },
  },
  {
    role: "admin",
    label: "Admin",
    email: "admin@demo.com",
    password: "demo1234",
    description: "Full sales dashboard, analytics, and order log.",
    access: ["Sales dashboard", "Revenue analytics", "Orders log"],
    accent: {
      badge: "bg-violet-500/15 text-violet-400 border-violet-500/20",
      border: "border-violet-500/30 hover:border-violet-500/60",
      bg: "hover:bg-violet-500/5",
      icon: "text-violet-400",
      spinner: "border-violet-400",
    },
  },
];

const ICONS: Record<Role, JSX.Element> = {
  cashier: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M7 8h2m2 0h2m2 0h2M7 11h2" />
    </svg>
  ),
  cook: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </svg>
  ),
  admin: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 17.5h7M17.5 14v7" />
    </svg>
  ),
};

export default function Demo() {
  const [loading, setLoading] = useState<Role | null>(null);
  const navigate = useNavigate();

  const roleRoutes: Record<Role, string> = {
    cashier: "/demo",
    cook: "/demo",
    admin: "/demo/admin",
  };

  const handleLogin = async (config: RoleConfig) => {
    if (loading) return;
    setLoading(config.role);

    try {
        await api.post("/auth/login", {
            role: config.role,
            email: config.email,
            password: config.password,
        });
        // Don't clear loading here — let the page transition handle it
        navigate(roleRoutes[config.role]);
    } catch (e) {
        setLoading(null); // only clear on failure
        alert("Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <a href="/" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </a>
        <div className="flex items-center gap-2">
          <span className="text-amber-400">⚡</span>
          <span className="font-semibold tracking-tight text-sm">LiveSales</span>
        </div>
        <div className="w-16" />
      </nav>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">

        {/* Header */}
        <div className="text-center mb-12 max-w-md">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-amber-400 mb-4">
            Interactive demo
          </span>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Choose a role to enter
          </h1>
          <p className="text-neutral-500 text-base leading-relaxed">
            Each role has its own view and permissions. No sign-up needed —
            pick one and explore.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
          {ROLES.map((config) => {
            const isLoading = loading === config.role;
            const isDisabled = loading !== null && !isLoading;

            return (
              <button
                key={config.role}
                onClick={() => handleLogin(config)}
                disabled={isDisabled}
                className={`
                  relative text-left border rounded-xl p-6 transition-all duration-200 group
                  bg-white/[0.02] ${config.accent.border} ${config.accent.bg}
                  disabled:opacity-40 disabled:cursor-not-allowed
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30
                `}
              >
                {/* Role icon + badge */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`${config.accent.icon}`}>
                    {ICONS[config.role]}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${config.accent.badge}`}>
                    {config.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-neutral-300 leading-snug mb-5 font-medium">
                  {config.description}
                </p>

                {/* Access list */}
                <ul className="space-y-1.5 mb-6">
                  {config.access.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-neutral-500">
                      <span className="w-1 h-1 rounded-full bg-neutral-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className={`
                  flex items-center justify-between text-xs font-semibold
                  transition-colors duration-150
                  ${isLoading ? "text-neutral-500" : `${config.accent.icon} group-hover:opacity-80`}
                `}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin ${config.accent.spinner}`} />
                      Signing in...
                    </span>
                  ) : (
                    <>
                      <span>Enter as {config.label}</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Credentials note */}
        <div className="mt-10 border border-white/5 rounded-xl bg-white/[0.02] px-6 py-4 w-full max-w-3xl">
          <p className="text-xs text-neutral-600 font-medium mb-3 uppercase tracking-wider">
            Demo credentials
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ROLES.map((r) => (
              <div key={r.role} className="flex flex-col gap-1">
                <span className={`text-xs font-semibold ${r.accent.icon}`}>{r.label}</span>
                <span className="font-mono text-xs text-neutral-500">{r.email}</span>
                <span className="font-mono text-xs text-neutral-600">{r.password}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-5 text-center text-xs text-neutral-700">
        Demo data resets on every session · No real transactions are processed
      </footer>

    </div>
  );
}