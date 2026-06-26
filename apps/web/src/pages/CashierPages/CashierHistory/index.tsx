import { useState, useEffect } from "react";
import CashierNav from "../../../shared/components/CashierComponents/CashierNav";
import api from "../../../shared/lib/axios";
import { toast } from "react-toastify";
type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
type OrderType = "DINE_IN" | "TAKEOUT" | "TAKEAWAY";

interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  receiptNo: string;
  orderstatus: OrderStatus;
  Ordertype: OrderType;
  total?: number;
  items?: SaleItem[];
  createdAt: string;
  readyAt?: string;
  prepTime?: string;
}

// ── helpers ───────────────────────────────────────────────────────────────────
function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH")}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  SERVED: {
    label: "Served",
    className: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "text-red-400 bg-red-400/10 border border-red-400/20",
  },
  PENDING: {
    label: "Pending",
    className: "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20",
  },
  PREPARING: {
    label: "Preparing",
    className: "text-blue-400 bg-blue-400/10 border border-blue-400/20",
  },
  READY: {
    label: "Ready",
    className: "text-neutral-400 bg-neutral-400/10 border border-neutral-400/20",
  },
};

// ── expanded order row ────────────────────────────────────────────────────────
function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[order.orderstatus];

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden transition-all duration-200 hover:border-white/12">
      {/* Main row — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-white/2 transition-colors"
      >
        {/* Receipt */}
        <span className="font-mono text-xs text-neutral-500 w-44 shrink-0 truncate">
          {order.receiptNo}
        </span>

        {/* Date + time */}
        <div className="flex flex-col w-32 shrink-0">
          <span className="text-xs text-neutral-300">{formatDate(order.createdAt)}</span>
          <span className="text-xs text-neutral-600">{formatTime(order.createdAt)}</span>
        </div>

        {/* Type */}
        <span className="text-xs text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full w-20 text-center shrink-0">
          {order.Ordertype === "DINE_IN" ? "Dine In" : "Takeaway"}
        </span>

        {/* Items count */}
        <span className="text-xs text-neutral-600 w-20 shrink-0">
          {order.items
            ? `${order.items.reduce((sum, i) => sum + i.quantity, 0)} item${order.items.reduce((sum, i) => sum + i.quantity, 0) !== 1 ? "s" : ""}`
            : "—"}
        </span>

        {/* Status */}
        <span
          className={`text-xs px-2 py-0.5 rounded-full w-20 text-center shrink-0 ${meta.className}`}
        >
          {meta.label}
        </span>

        {/* Total */}
        <span className="text-sm font-medium text-white ml-auto shrink-0">
          {order.total != null ? formatPeso(order.total) : "—"}
        </span>

        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-neutral-600 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-white/5 px-4 py-3 bg-white/1.5">
          {order.items && order.items.length > 0 ? (
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-600 w-5 text-right">
                      {item.quantity}×
                    </span>
                    <span className="text-neutral-300">{item.name}</span>
                  </div>
                  <span className="text-neutral-500 text-xs">
                    {formatPeso(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-600">No item breakdown available.</p>
          )}
          {order.total != null && (
            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
              <span className="text-xs text-neutral-600">Order total</span>
              <span className="text-sm font-semibold text-white">
                {formatPeso(order.total)}
              </span>
            </div>
          )}
          {order.prepTime && (
            <div className="mt-1 flex justify-between items-center">
              <span className="text-xs text-neutral-700">Prep time</span>
              <span className="text-xs text-neutral-500">{order.prepTime}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── empty state ───────────────────────────────────────────────────────────────
function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-neutral-600"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <p className="text-sm text-neutral-500">
        {filtered ? "No orders match your search." : "No order history yet."}
      </p>
      {filtered && (
        <p className="text-xs text-neutral-700 mt-1">Try a different receipt number or date.</p>
      )}
    </div>
  );
}

// ── summary bar ───────────────────────────────────────────────────────────────
function SummaryBar({ orders }: { orders: Order[] }) {
  const served = orders.filter((o) => o.orderstatus === "SERVED");
  const cancelled = orders.filter((o) => o.orderstatus === "CANCELLED");
  const revenue = served.reduce((sum, o) => sum + (o.total ? o.total : 0), 0);

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        {
          label: "Total Orders",
          value: orders.length,
          sub: "today",
          color: "text-white",
        },
        {
          label: "Revenue",
          value: formatPeso(revenue),
          sub: `${served.length} served`,
          color: "text-emerald-400",
        },
        {
          label: "Cancelled",
          value: cancelled.length,
          sub: "orders",
          color: cancelled.length > 0 ? "text-red-400" : "text-neutral-500",
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-white/8 bg-white/3 px-4 py-3"
        >
          <p className="text-xs text-neutral-600 mb-1">{stat.label}</p>
          <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
          <p className="text-xs text-neutral-700 mt-0.5">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function CashierHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  const handleFetchOrders = async () =>{
    try {
        const fetch = await api.get('/sales/history/cashier');
        setOrders(fetch.data.orders);
        console.log(fetch.data.orders);
    } catch (error) {
        toast.error("Failed to fetch order history. Please try again later.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch =
      search === "" ||
      o.receiptNo.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "ALL" || o.orderstatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const STATUS_FILTERS: { label: string; value: OrderStatus | "ALL" }[] = [
    { label: "All", value: "ALL" },
    { label: "Served", value: "SERVED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    // 1. Force the root wrapper to exactly the screen height and hide external overflow
    <div className="flex h-screen w-full bg-[#0d0d0f] overflow-hidden">
      <CashierNav />

      {/* 2. Ensure the main content area flexes properly and takes remaining space */}
      <div className="flex flex-col flex-1 h-full min-w-0">
        
        {/* Fixed header (shrink-0 ensures it never gets squished) */}
        <div className="px-6 py-5 border-b border-white/5 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-base font-semibold text-white">History</h1>
              <p className="text-xs text-neutral-600 mt-0.5">
                All orders processed at this terminal
              </p>
            </div>
          </div>

          {/* Search + filter */}
          <div className="flex items-center gap-3 mt-4">
            <div className="relative flex-1 max-w-xs">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search receipt no."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/8 rounded-lg pl-8 pr-3 py-2 text-sm text-neutral-300 placeholder:text-neutral-700 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* Status pill filters */}
            <div className="flex items-center gap-1.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    statusFilter === f.value
                      ? "bg-white/10 text-white"
                      : "text-neutral-600 hover:text-neutral-400 hover:bg-white/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. The content wrapper needs min-h-0 to allow scrolling inside */}
        <div className="px-6 py-5 flex-1 flex flex-col min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <svg
                className="animate-spin w-5 h-5 text-neutral-600"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-0">
              
              {/* Summary & Headers protected with shrink-0 */}
              <div className="shrink-0">
                <SummaryBar orders={orders} />
              </div>

              {filtered.length > 0 && (
                <div className="flex items-center gap-4 px-4 mb-2 shrink-0">
                  <span className="text-xs text-neutral-700 w-44 shrink-0">Receipt No.</span>
                  <span className="text-xs text-neutral-700 w-32 shrink-0">Date</span>
                  <span className="text-xs text-neutral-700 w-20 shrink-0 text-center">Type</span>
                  <span className="text-xs text-neutral-700 w-20 shrink-0">Items</span>
                  <span className="text-xs text-neutral-700 w-20 shrink-0 text-center">Status</span>
                  <span className="text-xs text-neutral-700 ml-auto shrink-0">Total</span>
                  <span className="w-4 shrink-0" />
                </div>
              )}

              {/* 4. The actual list container handling the overflow */}
              <div className="flex-1 overflow-y-auto min-h-0 pb-4 pr-2 custom-scroll">
                {filtered.length === 0 ? (
                    <EmptyState filtered={search !== "" || statusFilter !== "ALL"} />
                ) : (
                    <div className="space-y-2">
                    {filtered.map((order) => (
                        <OrderRow key={order.id} order={order} />
                    ))}
                    </div>
                )}
              </div>
              
            </div>
          )}
        </div>
      </div>
    </div>
  );
}