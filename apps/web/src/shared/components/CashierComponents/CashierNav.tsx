import { useNavigate, NavLink } from "react-router-dom";
import api from "../../lib/axios";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const CASHIER_NAV_ITEMS: NavItem[] = [
  {
    label: "Point of Sale",
    to: "/demo/cashier",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    label: "Active Orders",
    to: "/demo/cashier/orders",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: "History",
    to: "/demo/cashier/history",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function CashierNav() {
  const router = useNavigate();
  
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router('/demo');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <aside className="w-52 min-h-screen bg-[#0d0d0f] border-r border-white/5 flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-lg">⚡</span>
          <span className="font-semibold tracking-tight text-sm text-white">LiveSales</span>
        </div>
        <span className="text-xs text-neutral-600 mt-0.5 block">Cashier Terminal</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {CASHIER_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/demo/cashier"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-white/8 text-white font-medium"
                  : "text-neutral-500 hover:text-neutral-200 hover:bg-white/5"
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Status */}
      <div className="px-5 py-4 border-t border-white/5 space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-neutral-400">System Online</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Lock Terminal
        </button>
      </div>
    </aside>
  );
}