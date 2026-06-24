import { Link } from "react-router-dom";
import AdminNav from "../../../shared/components/AdminComponents/AdminNav";
import api from "../../../shared/lib/axios";
import { useEffect, useState, useCallback } from "react";
import { socket } from "../../../shared/lib/socket";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Metrics {
  salesToday: number;
  salesTrend: string;
  salesTrendUp: boolean;
  orders: number;
  ordersTrend: number;
  ordersTrendUp: boolean;
  avgOrder: number;
  avgOrderTrend: string;
  avgOrderTrendUp: boolean;
  peakHour: string;
  peakHourAmount: number;
}

interface HourlyEntry {
  hour: string;
  amount: number;
}

interface TopItem {
  name: string;
  sold: number;
  revenue: number;
}

interface ActiveOrder {
  id: string;
  receiptNo: string;
  table: string;
  items: number;
  total: number;
  status: string;
  time: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
  preparing: "bg-blue-500/10  text-blue-400  ring-1 ring-blue-500/20",
  ready:     "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
  served:    "bg-neutral-500/10 text-neutral-500 ring-1 ring-neutral-500/15",
  void:      "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
};

const STATUS_DOT: Record<string, string> = {
  pending:   "bg-amber-400",
  preparing: "bg-blue-400 animate-pulse",
  ready:     "bg-emerald-400",
  served:    "bg-neutral-500",
  void:      "bg-red-400",
};

const peso = (n: number) =>
  "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ── Sub-components ────────────────────────────────────────────────────────────

function TrendBadge({ trend, up }: { trend: string; up: boolean }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {up
          ? <path d="M12 19V5M5 12l7-7 7 7" />
          : <path d="M12 5v14M5 12l7 7 7-7" />}
      </svg>
      {trend}
    </span>
  );
}

function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded bg-white/5 ${className}`} style={style} />;
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/3 border border-white/6 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [hourlySales, setHourlySales] = useState<HourlyEntry[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const [metricsRes, hourlyRes, topRes, ordersRes] = await Promise.all([
        api.get("/dashboard/metrics"),
        api.get("/dashboard/hourly-sales"),
        api.get("/dashboard/top-items"),
        api.get("/dashboard/active-orders"),
      ]);
      setMetrics(metricsRes.data);
      setHourlySales(hourlyRes.data);
      setTopItems(topRes.data);
      setActiveOrders(ordersRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Socket ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchDashboard();

    socket.connect();

    // New order arrives - unwrap { sale } and map to ActiveOrder shape
    socket.on("newOrder", (payload: any) => {
      const sale = payload?.sale ?? payload;
      const mapped: ActiveOrder = {
        id: sale.id,
        receiptNo: sale.receiptNo,
        table:
          sale.Ordertype === "DINE_IN"  ? "Dine In"  :
          sale.Ordertype === "TAKEAWAY" ? "Takeout"  : "Delivery",
        items: Array.isArray(sale.items) ? sale.items.length : 0,
        total: parseFloat(sale.total ?? "0"),
        status: (sale.orderstatus ?? "PENDING").toLowerCase(),
        time: new Date(sale.createdAt).toLocaleTimeString("en-PH", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
      setActiveOrders((prev) => [mapped, ...prev].slice(0, 20));
      api.get("/dashboard/metrics").then((r) => setMetrics(r.data)).catch(() => {});
    });

    socket.on("orderStatusUpdated", (payload: any) => {
      const { id, orderstatus } = payload;

      setActiveOrders((prev) =>
        prev.map((order) => (order.id === id ? { ...order, status: orderstatus.toLowerCase() } : order))
      );
      
    });

    return () => {

      socket.off("newOrder");
      socket.off("orderStatusUpdated");
      socket.disconnect();
    };
  }, [fetchDashboard]);

  // ── Derived values ─────────────────────────────────────────────────────────

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const maxHourly = Math.max(...hourlySales.map((h) => h.amount), 1);
  const maxSold   = topItems[0]?.sold ?? 1;

  const METRIC_CARDS = metrics
    ? [
        {
          label: "Sales today",
          value: peso(metrics.salesToday),
          trend: metrics.salesTrend,
          trendUp: metrics.salesTrendUp,
          sub: "vs yesterday",
          icon: (
            <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6v6M9 12h6" strokeLinecap="round"/>
            </svg>
          ),
        },
        {
          label: "Orders",
          value: metrics.orders.toLocaleString(),
          trend: `${metrics.ordersTrend >= 0 ? "+" : ""}${metrics.ordersTrend}`,
          trendUp: metrics.ordersTrendUp,
          sub: "vs yesterday",
          icon: (
            <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <path d="M8 12h8M8 8h5M8 16h3"/>
            </svg>
          ),
        },
        {
          label: "Avg. order",
          value: peso(metrics.avgOrder),
          trend: metrics.avgOrderTrend,
          trendUp: metrics.avgOrderTrendUp,
          sub: "vs yesterday",
          icon: (
            <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          ),
        },
        {
          label: "Peak hour",
          value: metrics.peakHour,
          trend: peso(metrics.peakHourAmount),
          trendUp: true,
          sub: "highest revenue",
          icon: (
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7v5l3 3"/>
            </svg>
          ),
        },
      ]
    : [];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-white">
      <AdminNav />

      <main className="flex-1 overflow-y-auto">

        {/* ── Header ── */}
        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white">Dashboard</h1>
            <p className="text-xs text-neutral-500 mt-0.5">{today}</p>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/6 hover:border-white/10 bg-white/2 hover:bg-white/5 disabled:opacity-40"
          >
            <svg
              className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M8 16H3v5"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mx-8 mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            {error}
            <button onClick={fetchDashboard} className="ml-auto underline text-xs hover:text-red-300">Retry</button>
          </div>
        )}

        <div className="px-8 py-6 space-y-5">

          {/* ── KPI cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <SectionCard key={i} className="p-5">
                    <Skeleton className="h-3 w-20 mb-4" />
                    <Skeleton className="h-8 w-28 mb-3" />
                    <Skeleton className="h-3 w-16" />
                  </SectionCard>
                ))
              : METRIC_CARDS.map((m) => (
                  <SectionCard key={m.label} className="p-5 group hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-neutral-500">{m.label}</p>
                      {m.icon}
                    </div>
                    <p className="text-[28px] font-semibold tracking-tight text-white leading-none mb-2.5 tabular-nums">
                      {m.value}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <TrendBadge trend={m.trend} up={m.trendUp} />
                      <span className="text-xs text-neutral-600">{m.sub}</span>
                    </div>
                  </SectionCard>
                ))}
          </div>

          {/* ── Hourly chart ── */}
          <SectionCard className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm font-medium text-white">Revenue by hour</p>
                <p className="text-xs text-neutral-600 mt-0.5">Today · hover a bar for the amount</p>
              </div>
              {metrics && (
                <span className="text-xs text-neutral-500 tabular-nums font-medium">
                  Total {peso(metrics.salesToday)}
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-end gap-2 h-30">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="flex-1 rounded-t-sm rounded-b-none"
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-end gap-2" style={{ height: "120px" }}>
                {hourlySales.map((h) => {
                  const heightPct = Math.max(Math.round((h.amount / maxHourly) * 100), h.amount > 0 ? 4 : 0);
                  const isPeak    = h.amount === maxHourly && h.amount > 0;
                  return (
                    <div key={h.hour} className="group flex-1 flex flex-col items-center gap-2" style={{ height: "100%" }}>
                      <div className="flex-1" />
                      <div
                        className={`relative w-full rounded-t transition-all cursor-default ${
                          isPeak
                            ? "bg-amber-500/60 group-hover:bg-amber-400"
                            : "bg-white/8 group-hover:bg-white/16"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      >
                        {h.amount > 0 && (
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#18181c] border border-white/10 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                            {peso(h.amount)}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-600 shrink-0">{h.hour}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* ── Bottom two-col ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Top items */}
            <SectionCard className="p-6">
              <div className="mb-5">
                <p className="text-sm font-medium text-white">Top items</p>
                <p className="text-xs text-neutral-600 mt-0.5">Most ordered today</p>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-4 h-3" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-1 w-full" />
                      </div>
                      <Skeleton className="w-12 h-3" />
                    </div>
                  ))}
                </div>
              ) : topItems.length === 0 ? (
                <p className="text-sm text-neutral-600 py-4">No sales recorded today.</p>
              ) : (
                <div className="space-y-4">
                  {topItems.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="text-xs text-neutral-700 w-4 shrink-0 tabular-nums font-medium">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-neutral-300 truncate">{item.name}</span>
                          <span className="text-xs text-neutral-600 ml-2 shrink-0 tabular-nums">
                            {item.sold} sold
                          </span>
                        </div>
                        <div className="h-.75 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              i === 0 ? "bg-amber-500/70" : "bg-white/20"
                            }`}
                            style={{ width: `${Math.round((item.sold / maxSold) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-neutral-500 w-16 text-right shrink-0 tabular-nums">
                        {peso(item.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* Active orders */}
            <SectionCard className="overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Active orders</p>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {activeOrders.length > 0
                      ? `${activeOrders.filter(o => o.status !== "served").length} in progress`
                      : "No active orders"}
                  </p>
                </div>
                <Link
                  to="/demo/admin/orders"
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  View all →
                </Link>
              </div>

              <div className="divide-y divide-white/4 max-h-50 overflow-auto custom-scroll">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-3.5 gap-3">
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-2.5 w-32" />
                      </div>
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  ))
                ) : activeOrders.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-neutral-600">No active orders right now.</p>
                  </div>
                ) : (
                  activeOrders.map((order) => (
                    <div
                      key={order.receiptNo}
                      className="flex items-center justify-between px-6 py-3.5 hover:bg-white/2 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[order.status] ?? "bg-neutral-500"}`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{order.receiptNo}</p>
                          <p className="text-xs text-neutral-600 mt-0.5">
                            {order.table} · {order.items} item{order.items !== 1 ? "s" : ""} · {order.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-medium text-white tabular-nums">
                          {peso(order.total)}
                        </span>
                        <span
                          className={`text-[11px] px-2.5 py-1 rounded-full font-medium capitalize ${
                            STATUS_STYLES[order.status] ?? STATUS_STYLES.served
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>

          </div>
        </div>
      </main>
    </div>
  );
}