import { useState, useEffect } from "react";
import CashierNav from "../../../shared/components/CashierComponents/CashierNav";
import api from '../../../shared/lib/axios';
import {socket} from '../../../shared/lib/socket';
type OrderStatus = "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
type OrderType = "DINE_IN" | "TAKEOUT";
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
  total: number;
  items: SaleItem[];
  createdAt: string;
}

// ── helpers ───────────────────────────────────────────────────────────────────
function elapsed(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  return `${mins} mins ago`;
}

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH")}`;
}

const STATUS_META: Record<
  OrderStatus,
  { label: string; dot: string; badge: string }
> = {
  PENDING: {
    label: "Pending",
    dot: "bg-yellow-400",
    badge: "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20",
  },
  PREPARING: {
    label: "Preparing",
    dot: "bg-blue-400",
    badge: "text-blue-400 bg-blue-400/10 border border-blue-400/20",
  },
  READY: {
    label: "Ready",
    dot: "bg-emerald-400 animate-pulse",
    badge: "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20",
  },
  SERVED: {
    label: "Served",
    dot: "bg-neutral-500",
    badge: "text-neutral-500 bg-neutral-500/10 border border-neutral-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    dot: "bg-red-500",
    badge: "text-red-500 bg-red-500/10 border border-red-500/20",
  },
};

// ── order card ────────────────────────────────────────────────────────────────
function OrderCard({
  order,
  onServe,
  serving,
}: {
  order: Order;
  onServe: (id: string) => void;
  serving: boolean;
}) {
    const meta = STATUS_META[order.orderstatus];
    const isReady = order.orderstatus === "READY";

    return (
        <div
        className={`rounded-xl border transition-all duration-200 ${
            isReady
            ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
            : "border-white/8 bg-white/3"
        }`}
        >
        {/* Card header */}
        <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-white/5">
            <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-neutral-500 tracking-wide">
                {order.receiptNo}
            </span>
            <div className="flex items-center gap-2">
                <span
                className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${meta.badge}`}
                >
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
                </span>
                <span className="text-xs text-neutral-600 bg-white/5 px-2 py-0.5 rounded-full">
                {order.Ordertype === "DINE_IN" ? "Dine In" : "Takeout"}
                </span>
            </div>
            </div>
            <div className="text-right">
            <p className="text-base font-semibold text-white">
                {formatPeso(order.total)}
            </p>
            <p className="text-xs text-neutral-600 mt-0.5">{elapsed(order.createdAt)}</p>
            </div>
        </div>

        {/* Items */}
        <div className="px-4 py-3 space-y-1.5">
            {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 w-4 text-right">
                    {item.quantity}×
                </span>
                <span className="text-sm text-neutral-300">{item.name}</span>
                </div>
                <span className="text-xs text-neutral-500">
                {formatPeso(item.unitPrice * item.quantity)}
                </span>
            </div>
            ))}
        </div>

        {/* Serve button — only for READY */}
        {isReady && (
            <div className="px-4 pb-4 pt-1">
            <button
                onClick={() => onServe(order.id)}
                disabled={serving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm font-medium text-black"
            >
                {serving ? (
                <>
                    <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                    />
                    </svg>
                    Marking…
                </>
                ) : (
                <>
                    <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    >
                    <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Mark as Served
                </>
                )}
            </button>
            </div>
        )}
        </div>
    );
}

// ── section ───────────────────────────────────────────────────────────────────
function OrderSection({
  title,
  orders,
  onServe,
  servingId,
  emptyText,
  highlight,
}: {
  title: string;
  orders: Order[];
  onServe: (id: string) => void;
  servingId: string | null;
  emptyText: string;
  highlight?: boolean;
}) {
    return (
        <div>
        <div className="flex items-center gap-2 mb-3">
            <h2
            className={`text-xs font-semibold uppercase tracking-widest ${
                highlight ? "text-emerald-400" : "text-neutral-500"
            }`}
            >
            {title}
            </h2>
            <span
            className={`text-xs px-1.5 py-0.5 rounded-md font-mono ${
                highlight
                ? "bg-emerald-400/15 text-emerald-400"
                : "bg-white/5 text-neutral-600"
            }`}
            >
            {orders.length}
            </span>
            <div className="flex-1 h-px bg-white/5" />
        </div>

        {orders.length === 0 ? (
            <p className="text-sm text-neutral-600 py-3">{emptyText}</p>
        ) : (
            <div className="space-y-3">
            {orders.map((o) => (
                <OrderCard
                key={o.id}
                order={o}
                onServe={onServe}
                serving={servingId === o.id}
                />
            ))}
            </div>
        )}
        </div>
    );
    }

    // ── toast ─────────────────────────────────────────────────────────────────────
    function Toast({ message, visible }: { message: string; visible: boolean }) {
    return (
        <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        >
        <div className="flex items-center gap-2 bg-emerald-500 text-black text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
            </svg>
            {message}
        </div>
        </div>
    );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function CashierOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [servingId, setServingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; visible: boolean }>({
        msg: "",
        visible: false,
    });

    const showToast = (msg: string) => {
        setToast({ msg, visible: true });
        setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
    };

    const handleServe = async (id: string) => {
        setServingId(id);
        try {
        await api.patch(`/sales/order/update/status`, { newStatus: "SERVED", orderId: id });
        setOrders((prev) =>
            prev.filter((o) => o.id !== id)
        );
        const order = orders.find((o) => o.id === id);
        showToast(`${order?.receiptNo} marked as served`);
        } catch (err){
        showToast("Failed to update order");
        } finally {
        setServingId(null);
        }
    };

    const handleFetchOrders = async () =>{
        try {
            const orders = await api.get('/sales/active-orders');
            setOrders(orders.data);
        } catch (error) {
            showToast("Failed to fetch active orders. Please try again later.");
        }
    };

    useEffect(() =>{
        handleFetchOrders();
    },[])

    useEffect(()=>{
        socket.connect();

        socket.on("orderStatusUpdated", (payload: any) => {
            const { id, orderstatus } = payload;
            if(orderstatus === "SERVED") {
                setOrders((prev) => prev.filter((o) => o.id !== id));
                return;
            }
            setOrders((prev)=>{
                return prev.map((o) => (o.id === id ? { ...o, orderstatus: orderstatus } : o));
            })
        });

        socket.on("newOrder", (payload: any) => {
            const sale = payload?.sale ?? payload;
            setOrders((prev) => [sale, ...prev]);
        });
        return () => {
            socket.off("newOrder");
            socket.off("orderStatusUpdated");
            socket.disconnect();
        }
    },[socket]);
    const ready = orders.filter((o) => o.orderstatus === "READY");
    const inProgress = orders.filter(
        (o) => o.orderstatus === "PENDING" || o.orderstatus === "PREPARING"
    );

    return (
        <div className="flex max-h-screen bg-[#0d0d0f]">
        <CashierNav />

        {/* Scrollable content area */}
        <div className="flex-1 flex flex-col min-h-0">
            {/* Fixed header */}
            <div className="px-6 py-5 border-b border-white/5 shrink-0">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-base font-semibold text-white">Active Orders</h1>
                <p className="text-xs text-neutral-600 mt-0.5">
                    {ready.length > 0
                    ? `${ready.length} order${ready.length > 1 ? "s" : ""} ready to serve`
                    : "All caught up"}
                </p>
                </div>
                {/* live indicator */}
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
                </div>
            </div>
            </div>

            {/* Scrollable orders */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8 custom-scroll">
            <OrderSection
                title="Ready to Serve"
                orders={ready}
                onServe={handleServe}
                servingId={servingId}
                emptyText="No orders ready yet — the kitchen will update this."
                highlight
            />

            <OrderSection
                title="In Progress"
                orders={inProgress}
                onServe={handleServe}
                servingId={servingId}
                emptyText="No orders in progress."
            />
            </div>
        </div>

        <Toast message={toast.msg} visible={toast.visible} />
        </div>
    );
}