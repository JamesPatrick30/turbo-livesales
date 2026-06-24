import { useEffect, useState } from "react";
import CookNav from "../../../shared/components/CookComponents/CookNav";
import api from "../../../shared/lib/axios";

import type { OrderHistory } from "../../../shared/types/order";

const ORDER_TYPE_TAGS: Record<string, string> = {
  DINE_IN: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  TAKEAWAY: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  DELIVERY: "text-pink-400 bg-pink-500/10 border-pink-500/20",
};

export default function CookHistory() {
    const [completedOrders, setCompletedOrders] = useState<OrderHistory[]>([]);
    const [stats, setStats] = useState<{ label: string; value: string; sub: string }[]>([]);

    const handleFetchHistory = async () => {
        try {
            const response = await api.get('/sales/history');
            setCompletedOrders(response.data.orders);
            setStats([
                { label: "Orders Fulfilled", value: response.data.stats.fulfilled.toString(), sub: "Today's total" },
                { label: "Avg. Prep Time", value: response.data.stats.avgPrepMinutes, sub: "Target: < 15m" },
                { label: "Peak Speed Hour", value: response.data.stats.peakHour, sub: "Avg. 8.2m per order" }
            ]);
        } catch (error) {
            console.error('Failed to fetch history:', error);
        }
    }

    useEffect(() => {
        handleFetchHistory();
    }, []);

    const handleRecallOrder = async (orderId: string) => {
        try {
            await api.patch(`/sales/${orderId}/recall`);
            setCompletedOrders(prev => prev.filter(order => order.id !== orderId));
        } catch (error) {
            console.error(`Failed to recall order #${orderId}:`, error);
            return;
        }
    };

    const handleReadyOrderTime = (readyAt: string) => {
        const readyDate = new Date(readyAt);
        const now = new Date();
        const diffInMinutes = Math.round((now.getTime() - readyDate.getTime()) / 60000);
        return `${diffInMinutes} min`;
    };

  return (
    // 1. Force root container to be exactly window height and clip wild bounding box leaks
    <div className="flex h-screen w-full bg-[#0d0d0f] text-white overflow-hidden">
      <CookNav />

      {/* 2. Added h-full and min-w-0 to prevent layout blowouts */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        
        {/* ── Header ── (shrink-0 keeps it structurally locked at the top) */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Completed Today</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Review history or recall completed items</p>
          </div>
          <p className="text-xs text-neutral-600 tabular-nums">Shift Date · June 13, 2026</p>
        </div>

        {/* 3. This flex-1 target section now safely inherits scroll behavior via min-h-0 */}
        <div className="flex-1 p-8 overflow-y-auto min-h-0 space-y-6 pb-12 custom-scrollbar">
          
          {/* ── Kitchen Metrics Line ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
            {stats.map((stat) => (
              <div 
                key={stat.label} 
                className="bg-white/3 border border-white/5 rounded-xl p-4 flex flex-col justify-between"
              >
                <p className="text-xs text-neutral-500">{stat.label}</p>
                <p className="text-2xl font-semibold tracking-tight text-white my-1 tabular-nums">
                  {stat.value}
                </p>
                <span className="text-[10px] text-neutral-600">{stat.sub}</span>
              </div>
            ))}
          </div>

          {/* ── History Table Container ── */}
          <div className="bg-white/3 border border-white/5 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-sm font-medium text-white">Fulfilled Tickets Log</h3>
            </div>

            <div className="divide-y divide-white/5">
              {completedOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-6 gap-4 hover:bg-white/2 transition-colors"
                >
                  {/* Left Column: ID and Core Meta */}
                  <div className="flex items-start gap-4 min-w-45 shrink-0">
                    <div>
                      <span className="text-base font-bold tracking-tight text-white block">
                        #{order.receiptNo}
                      </span>
                      <span className="text-xs text-neutral-600 block mt-0.5 tabular-nums">
                        Ready {handleReadyOrderTime(order.readyAt)} ago
                      </span>
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border inline-block mt-2 ${ORDER_TYPE_TAGS[order.Ordertype]}`}>
                        {order.Ordertype?.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Middle Column: Flat Food Items Breakdown */}
                  <div className="flex-1 min-w-0 bg-white/1 rounded-lg p-3 border border-white/5">
                    <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-sm">
                          <span className="font-bold text-amber-400 tabular-nums">{item.quantity}x</span>
                          <span className="text-neutral-300 font-medium">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Speed Metric & Action Button */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 min-w-50 shrink-0">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] text-neutral-600 block uppercase font-medium tracking-wider">Prep Time</span>
                      <span className="text-sm font-medium text-green-400 tabular-nums">{order.prepTime}</span>
                    </div>

                    <button
                      onClick={() => handleRecallOrder(order.id)}
                      className="border border-white/10 hover:border-amber-500/30 hover:bg-amber-500/5 text-neutral-400 hover:text-amber-400 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <polyline points="3 3 3 8 8 8" />
                      </svg>
                      Recall to Kitchen
                    </button>
                  </div>

                </div>
              ))}

              {completedOrders.length === 0 && (
                <div className="py-12 text-center text-sm text-neutral-600">
                  No completed orders listed in current display block.
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}