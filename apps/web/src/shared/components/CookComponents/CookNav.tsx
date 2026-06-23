import { useNavigate, NavLink } from "react-router-dom";
import api from "../../lib/axios";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: number; // Real-time counter for pending orders
}

const COOK_NAV_ITEMS: NavItem[] = [
  {
    label: "Kitchen Board",
    to: "/demo/cook",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    
  },
  {
    label: "Completed Today",
    to: "/demo/cook/history",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
];

export default function CookNav() {
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
        <span className="text-xs text-neutral-600 mt-0.5 block">Kitchen Display</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {COOK_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/demo/cook"}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-white/8 text-white font-medium"
                  : "text-neutral-500 hover:text-neutral-200 hover:bg-white/5"
              }`
            }
          >
            <div className="flex items-center gap-3">
              {item.icon}
              {item.label}
            </div>
            {item.badge && item.badge > 0 && (
              <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-bold tracking-tight">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Role Switch */}
      <div className="px-5 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Switch role
        </button>
      </div>
    </aside>
  );
}