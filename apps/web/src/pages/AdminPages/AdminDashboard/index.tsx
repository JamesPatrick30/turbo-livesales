import { Link } from "react-router-dom";
import AdminNav from "../../../shared/components/AdminComponents/AdminNav";
import api from "../../../shared/lib/axios";
import { useEffect } from "react";
// ── Data ─────────────────────────────────────────────────────────────────────

const METRICS = [
  {
    label: "Sales today",
    value: "₱24,850",
    trend: "+12%",
    trendUp: true,
    sub: "vs yesterday",
  },
  {
    label: "Orders",
    value: "134",
    trend: "+8",
    trendUp: true,
    sub: "vs yesterday",
  },
  {
    label: "Avg. order",
    value: "₱185",
    trend: "-3%",
    trendUp: false,
    sub: "vs yesterday",
  },
  {
    label: "Peak hour",
    value: "7 PM",
    trend: "₱120",
    trendUp: true,
    sub: "highest this hour",
  },
];

const HOURLY_SALES = [
  { hour: "10A", amount: 1260 },
  { hour: "11A", amount: 1140 },
  { hour: "12P", amount: 1650 },
  { hour: "1P",  amount: 1830 },
  { hour: "2P",  amount: 1440 },
  { hour: "3P",  amount: 2160 },
  { hour: "4P",  amount: 2670 },
  { hour: "5P",  amount: 3150 },
  { hour: "6P",  amount: 2940 },
  { hour: "7P",  amount: 3600 },
  { hour: "8P",  amount: 3450 },
  { hour: "9P",  amount: 2640 },
];

const TOP_ITEMS = [
  { name: "Steamed Rice",      sold: 88, revenue: "₱2,640" },
  { name: "Iced Tea",          sold: 66, revenue: "₱3,630" },
  { name: "Sinigang na Baboy", sold: 42, revenue: "₱7,770" },
  { name: "Crispy Pata",       sold: 38, revenue: "₱14,440" },
  { name: "Adobong Manok",     sold: 35, revenue: "₱5,600" },
];

const ACTIVE_ORDERS = [
  { id: "#0041", table: "Table 3", items: 4, total: "₱490", status: "preparing", time: "2:14 PM" },
  { id: "#0042", table: "Table 1", items: 3, total: "₱620", status: "pending",   time: "2:21 PM" },
  { id: "#0043", table: "Takeout", items: 2, total: "₱190", status: "ready",     time: "2:25 PM" },
  { id: "#0044", table: "Table 5", items: 4, total: "₱530", status: "served",    time: "2:08 PM" },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-500/15 text-amber-400",
  preparing: "bg-blue-500/15  text-blue-400",
  ready:     "bg-green-500/15 text-green-400",
  served:    "bg-neutral-500/15 text-neutral-500",
  paid:      "bg-violet-500/15 text-violet-400",
};

const maxAmount = Math.max(...HOURLY_SALES.map((h) => h.amount));
const maxSold   = TOP_ITEMS[0].sold;

// ── Sub-components ────────────────────────────────────────────────────────────

function TrendBadge({ trend, up }: { trend: string; up: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        up ? "text-green-400" : "text-red-400"
      }`}
    >
      {up ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      )}
      {trend}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/auth/me");
                console.log("Profile data:", response.data);
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };
        fetchProfile();
    }, []);
  return (
    <div className="flex min-h-screen bg-[#0d0d0f] text-white">
      <AdminNav />

      <main className="flex-1 overflow-y-auto">

        {/* ── Header ── */}
        <div className="px-8 py-6 border-b border-white/5">
          <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Friday, Jun 13, 2026</p>
        </div>

        <div className="px-8 py-6 space-y-5">

          {/* ── KPI cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {METRICS.map((m) => (
              <div
                key={m.label}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-5"
              >
                <p className="text-xs text-neutral-500 mb-3">{m.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-white leading-none mb-2">
                  {m.value}
                </p>
                <div className="flex items-center gap-1.5">
                  <TrendBadge trend={m.trend} up={m.trendUp} />
                  <span className="text-xs text-neutral-600">{m.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Hourly chart — full width ── */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-white">Revenue by hour</p>
                <p className="text-xs text-neutral-600 mt-0.5">Today · hover a bar for the amount</p>
              </div>
              <span className="text-xs text-neutral-600 tabular-nums">
                Total ₱24,850
              </span>
            </div>

            {/* Bars */}
            <div className="flex items-end gap-2" style={{ height: "120px" }}>
              {HOURLY_SALES.map((h) => {
                const heightPct = Math.round((h.amount / maxAmount) * 100);
                const isPeak    = h.amount === maxAmount;
                return (
                  <div
                    key={h.hour}
                    className="group flex-1 flex flex-col items-center gap-2"
                    style={{ height: "100%" }}
                  >
                    {/* Spacer pushes bar down */}
                    <div className="flex-1" />
                    <div
                      className={`relative w-full rounded-t-sm transition-colors cursor-default ${
                        isPeak
                          ? "bg-amber-500/70 group-hover:bg-amber-500"
                          : "bg-white/10 group-hover:bg-white/20"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1a1a1f] border border-white/10 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        ₱{h.amount.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-600 shrink-0">{h.hour}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Bottom two-col ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Top items */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
              <p className="text-sm font-medium text-white mb-1">Top items</p>
              <p className="text-xs text-neutral-600 mb-5">Most ordered today</p>
              <div className="space-y-4">
                {TOP_ITEMS.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-3">
                    {/* Rank */}
                    <span className="text-xs text-neutral-700 w-4 shrink-0 tabular-nums">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-neutral-300 truncate">{item.name}</span>
                        <span className="text-xs text-neutral-600 ml-2 shrink-0">
                          {item.sold} sold
                        </span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500/50 rounded-full"
                          style={{ width: `${Math.round((item.sold / maxSold) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-neutral-500 w-16 text-right shrink-0 tabular-nums">
                      {item.revenue}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active orders */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Active orders</p>
                  <p className="text-xs text-neutral-600 mt-0.5">Currently in progress</p>
                </div>
                <Link
                  to="/demo/admin/orders"
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  View all →
                </Link>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {ACTIVE_ORDERS.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">{order.id}</p>
                        <p className="text-xs text-neutral-600 mt-0.5">
                          {order.table} · {order.items} items · {order.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-white tabular-nums">
                        {order.total}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                          STATUS_STYLES[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}