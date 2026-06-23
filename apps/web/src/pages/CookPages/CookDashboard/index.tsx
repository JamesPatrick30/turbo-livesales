import { useEffect, useState } from "react";
import CookNav from "../../../shared/components/CookComponents/CookNav";
import { toast } from "react-toastify";

import api from "../../../shared/lib/axios";

// types and interfaces
import type { OrderType, OrderStatusUpdateRequest } from "../../../shared/types/order";


const ORDER_TYPE_STYLES: Record<string, string> = {
  DINE_IN: "border-blue-500/30 text-blue-400 bg-blue-500/5",
  TAKEAWAY: "border-purple-500/30 text-purple-400 bg-purple-500/5",
  DELIVERY: "border-pink-500/30 text-pink-400 bg-pink-500/5",
};

export default function CookDashboard() {
    // const orderStatuses = ["PENDING", "PREPARING", "READY", "SERVED", "VOID"];
  const [orders, setOrders] = useState<OrderType[]>([]);

  const handleFetchOrder = async () =>{
    try {
        const res = await api.get("/sales/orders");
        const filteredOrders = res.data.filter((order: OrderType) => order.orderstatus !== "READY" && order.orderstatus !== "SERVED");
        setOrders(filteredOrders);
    } catch (error: any) {
        toast.error(error.response.data.message || "Failed to fetch orders.");
        
    }
  }

  const handleTimeConverter = (timestamp: string) => {
    const orderTime = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - orderTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);

    if (diffInMinutes === 0) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  useEffect(() => {
    handleFetchOrder();
  },[]);

  const handleUrgencyCheck = (createdAt: string) => {
    const orderTime = new Date(createdAt);
    const now = new Date();
    const diffInMs = now.getTime() - orderTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    return diffInMinutes >= 15; // Mark as urgent if order is pending for 15 minutes or more
  }

  const handleUpdateStatus = async (orderId: string, currentStatus: string, recieptNo: string) => {
    const nextStatus = currentStatus === "PENDING" ? "PREPARING" : "READY";
    try{
        const payload: OrderStatusUpdateRequest = {
            orderId,
            newStatus: nextStatus
        }
        await api.patch("/sales/order/update/status", payload)

        if(nextStatus === "READY"){
            setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
            toast.success(`Order #${recieptNo} is now READY!`);
            return;
        }
        setOrders(prevOrders => 
            prevOrders.map(order => {
                if (order.id === orderId) {
                    return { ...order, orderstatus: nextStatus };
                }
                return order;
            }));
    }catch(error){
      toast.error("Failed to update order status.");
    }
  };

  // Status transitions: PENDING -> PREPARING -> READY (Then drops off Cook screen)
//   const handleUpdateStatus = (orderId: string, currentStatus: string) => {
//     setOrders(prevOrders => 
//       prevOrders.map(order => {
//         if (order.id === orderId) {
//           const nextStatus = currentStatus === "PENDING" ? "PREPARING" : "READY";
//           return { ...order, orderstatus: nextStatus };
//         }
//         return order;
//       }).filter(order => order.orderstatus !== "READY") // Auto-clear completed from screen
//     );
//   };

  return (
    <div className="flex min-h-screen bg-[#0d0d0f] text-white overflow-hidden">
      <CookNav />

      <main className="flex-1 flex flex-col min-w-0">
        {/* ── Header ── */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight flex items-center gap-3">
              Kitchen Display System
              <span className="text-xs font-normal bg-white/5 text-neutral-400 px-2 py-0.5 rounded-full tabular-nums">
                {orders.length} Active
              </span>
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">Real-time incoming orders</p>
          </div>
          
          <div className="flex gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /> New Orders</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> In Progress</div>
          </div>
        </div>

        {/* ── Ticket Workspace ── */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 items-start">
            
            {orders.map((order) => (
              <div 
                key={order.id} 
                className={`bg-white/3 border rounded-xl flex flex-col overflow-hidden transition-all duration-200 ${
                  order.orderstatus === "PENDING" 
                    ? "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.05)]" 
                    : handleUrgencyCheck(order.createdAt) 
                      ? "border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.05)] animate-pulse" 
                      : "border-white/5"
                }`}
              >
                {/* Ticket Top Meta */}
                <div className="p-4 border-b border-white/5 bg-white/1 flex justify-between items-center">
                  <div>
                    <span className="text-xl font-bold tracking-tight block">#{order.receiptNo}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border inline-block mt-1 ${ORDER_TYPE_STYLES[order.Ordertype]}`}>
                      {order.Ordertype.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium tabular-nums px-2 py-1 rounded ${
                      handleUrgencyCheck(order.createdAt) ? "text-red-400 bg-red-500/10" : "text-neutral-400"
                    }`}>
                      {handleTimeConverter(order.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Ticket Food Content */}
                <div className="flex-1 p-5 space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-start justify-between gap-4">
                      <div className="flex items-baseline gap-3 min-w-0">
                        {/* High emphasis on multipliers */}
                        <span className="text-xl font-extrabold text-amber-400 tabular-nums shrink-0">
                          {item.quantity}x
                        </span>
                        <span className="text-base font-semibold text-neutral-100 truncate tracking-tight leading-tight">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-600 mt-1 shrink-0 font-medium">
                        {item.category}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Ticket Action Footer */}
                <div className="p-4 bg-white/1 border-t border-white/5">
                  {order.orderstatus === "PENDING" ? (
                    <button
                      onClick={() => handleUpdateStatus(order.id, order.orderstatus, order.receiptNo)}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-[#0d0d0f] font-bold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2 tracking-wide uppercase active:scale-95"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Start Preparing
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(order.id, order.orderstatus, order.receiptNo)}
                      className="w-full bg-blue-500 hover:bg-blue-400 text-[#0d0d0f] font-bold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2 tracking-wide uppercase active:scale-95"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Done / Ready
                    </button>
                  )}
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-2xl">
                <p className="text-lg text-neutral-600 font-medium">Kitchen is clear!</p>
                <p className="text-xs text-neutral-700 mt-1">No pending food tickets left to cook.</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}