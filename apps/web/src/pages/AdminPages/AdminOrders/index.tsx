import { useEffect, useState } from "react";
import AdminNav from "../../../shared/components/AdminComponents/AdminNav";
import api from "../../../shared/lib/axios";
import { toast } from "react-toastify";
// const ORDERS = [
//   { id: "#0041", table: "Table 3", items: "Sinigang na Baboy, Steamed Rice ×2, Iced Tea ×2", time: "2:14 PM", total: "₱490", status: "preparing" },
//   { id: "#0042", table: "Table 1", items: "Crispy Pata, Java Rice ×2, San Miguel Beer ×2", time: "2:21 PM", total: "₱620", status: "pending" },
//   { id: "#0043", table: "Takeout", items: "Adobong Manok, Steamed Rice", time: "2:25 PM", total: "₱190", status: "ready" },
//   { id: "#0044", table: "Table 5", items: "Kare-Kare, Palabok, Halo-Halo ×2", time: "2:08 PM", total: "₱530", status: "served" },
//   { id: "#0040", table: "Table 2", items: "Lechon Kawali, Pancit Canton, Calamansi Juice ×3", time: "1:55 PM", total: "₱550", status: "paid" },
//   { id: "#0039", table: "Table 4", items: "Sinigang na Baboy ×2, Steamed Rice ×4", time: "1:42 PM", total: "₱760", status: "paid" },
//   { id: "#0038", table: "Takeout", items: "Palabok, Iced Tea", time: "1:30 PM", total: "₱185", status: "paid" },
//   { id: "#0037", table: "Table 1", items: "Adobong Manok ×2, Java Rice ×2, San Miguel Beer", time: "1:18 PM", total: "₱450", status: "paid" },
// ];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  preparing: "bg-blue-500/15 text-blue-400",
  ready: "bg-green-500/15 text-green-400",
  served: "bg-neutral-500/15 text-neutral-400",
  paid: "bg-violet-500/15 text-violet-400",
};

const ALL_STATUSES = ["all", "pending", "preparing", "ready", "served", "paid"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/sales");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Error fetching orders.");
      };
    }

    fetchOrders();
  }, []);

  const TimeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  return (
    <div className="flex min-h-screen bg-[#0d0d0f] text-white">
      <AdminNav />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Orders</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{orders.length} orders today</p>
          </div>
        </div>

        <div className="px-8 py-6 space-y-4">

          {/* Filter pills — wire to state in real app */}
          <div className="flex items-center gap-2 flex-wrap">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize
                  ${s === "all"
                    ? "bg-white/8 border-white/10 text-white font-medium"
                    : "border-white/5 text-neutral-500 hover:text-neutral-300 hover:border-white/10"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-auto max-h-150 custom-scroll">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-[#0d0d0f]">
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">Order Type</th>
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">Cashier</th>
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">Items</th>
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">Time</th>
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">Total</th>
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">Payment</th>
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/3 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-white">{order.Ordertype.toLowerCase()}</td>
                    <td className="px-5 py-3.5 text-sm text-neutral-400">{order.cashier?.name || "Unknown"}</td>
                    <td className="px-5 py-3.5 text-xs text-neutral-500 max-w-xs truncate">
                      {order.items.map((item: any) => `${item.name} ×${item.quantity}`).join(", ")}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-neutral-600">{TimeFormatter.format(new Date(order.createdAt))}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-white">{order.total}</td>
                    <td className="px-5 py-3.5 text-sm text-neutral-400">{order.paymentMethod}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[order.orderstatus.toLowerCase()]}`}>
                        {order.orderstatus.toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}