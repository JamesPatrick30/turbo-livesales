import React, { useEffect, useState, useMemo } from "react";
import api from "../../../shared/lib/axios";
import CashierNav from "../../../shared/components/CashierComponents/CashierNav";
import { toast } from "react-toastify";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  status: "AVAILABLE" | "UNAVAILABLE";
}

interface CartItem extends MenuItem {
  quantity: number;
}

type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
type PaymentMethod = "CASH" | "CARD" | "ONLINE";

// ── Constants ─────────────────────────────────────────────────────────────────

const ORDER_TYPES: { value: OrderType; label: string }[] = [
  { value: "DINE_IN",   label: "Dine In"   },
  { value: "TAKEAWAY",  label: "Takeaway"  },
  { value: "DELIVERY",  label: "Delivery"  },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  {
    value: "CASH",
    label: "Cash",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /><path d="M6 12h.01M18 12h.01" />
      </svg>
    ),
  },
  {
    value: "CARD",
    label: "Card",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    value: "ONLINE",
    label: "Online",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CashierDashboard() {
  const [menuItems, setMenuItems]       = useState<MenuItem[]>([]);
  const [categories, setCategories]     = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery]   = useState("");
  const [cart, setCart]                 = useState<CartItem[]>([]);
  const [orderType, setOrderType]       = useState<OrderType>("TAKEAWAY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [submitting, setSubmitting]     = useState(false);
  const [loading, setLoading]           = useState(true);

  // ── Fetch menu ──────────────────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/items");
        const data: MenuItem[] = res.data;
        setMenuItems(data);
        const uniqueCats = ["All", ...Array.from(new Set(data.map((i) => i.category).filter(Boolean)))];
        setCategories(uniqueCats);
      } catch {
        toast.error("Failed to load menu items.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Derived filtered list (no stale-closure bug) ────────────────────────────

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch   = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);

  // ── Cart helpers ────────────────────────────────────────────────────────────

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((c) => c.id === id ? { ...c, quantity: c.quantity + delta } : c)
          .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id));

  const clearCart = () => setCart([]);

  // ── Totals ──────────────────────────────────────────────────────────────────

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const tax      = subtotal * 0.12;
  const total    = subtotal + tax;
  const totalQty = cart.reduce((sum, c) => sum + c.quantity, 0);

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (cart.length === 0) { toast.warn("Cart is empty."); return; }
    setSubmitting(true);
    try {
      const res = await api.post("/sales/create", {
        orderType,
        paymentMethod,
        items: cart.map((c) => ({ menuItemId: c.id, quantity: c.quantity })),
      });
      toast.success(res.data.message || "Order placed successfully!");
      clearCart();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-[#0d0d0f] text-white overflow-hidden">
      <CashierNav />

      {/* ── Center: Menu Selection ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 border-r border-white/5">

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-semibold tracking-tight">New Order</h1>
            <p className="text-xs text-neutral-500 mt-0.5">Select items to add to ticket</p>
          </div>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none"
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/8 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 w-56 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-6 py-3 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-amber-500 text-[#0d0d0f] font-semibold"
                  : "bg-white/5 text-neutral-400 hover:bg-white/8 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-24 bg-white/3 rounded-xl border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-12 h-12 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <p className="text-sm text-neutral-600">No items found</p>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-xs text-amber-500 hover:text-amber-400 mt-2 transition-colors">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredItems.map((item) => {
                const inCart = cart.find((c) => c.id === item.id);
                const unavailable = item.status === "UNAVAILABLE";
                return (
                  <button
                    key={item.id}
                    onClick={() => !unavailable && addToCart(item)}
                    disabled={unavailable}
                    className={`relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-all group ${
                      unavailable
                        ? "bg-white/[0.015] border-white/3 opacity-40 cursor-not-allowed"
                        : inCart
                        ? "bg-amber-500/8 border-amber-500/30 hover:bg-amber-500/12 active:scale-95"
                        : "bg-white/[0.03] border-white/6 hover:border-amber-500/35 hover:bg-white/5 active:scale-95"
                    }`}
                  >
                    {/* In-cart badge */}
                    {inCart && !unavailable && (
                      <span className="absolute top-2 right-2 w-5 h-5 bg-amber-500 text-[#0d0d0f] rounded-full text-[10px] font-extrabold flex items-center justify-center tabular-nums">
                        {inCart.quantity}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-neutral-100 leading-snug tracking-tight pr-5">{item.name}</span>
                    <span className="text-[10px] text-neutral-600 mt-1">{item.category}</span>
                    {unavailable ? (
                      <span className="text-[9px] text-red-400/80 uppercase tracking-widest font-bold mt-auto pt-3">Sold out</span>
                    ) : (
                      <span className="text-xs text-amber-400 font-semibold tabular-nums mt-auto pt-3">₱{item.price}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Right Sidebar: Ticket ────────────────────────────────────────────── */}
      <aside className="w-[320px] bg-[#0d0d0f] flex flex-col shrink-0">

        {/* Ticket Header */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold tracking-tight">
              Current Ticket
              {totalQty > 0 && (
                <span className="ml-2 text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full tabular-nums">
                  {totalQty}
                </span>
              )}
            </h2>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[10px] text-neutral-600 hover:text-red-400 transition-colors uppercase tracking-wider font-semibold"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Order Type */}
          <div className="flex bg-white/4 rounded-lg p-1 gap-0.5">
            {ORDER_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setOrderType(value)}
                className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md transition-all tracking-wide uppercase ${
                  orderType === value
                    ? "bg-white/10 text-white"
                    : "text-neutral-600 hover:text-neutral-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 px-5 py-4 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-700">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p className="text-xs text-neutral-700">Ticket is empty</p>
              <p className="text-[10px] text-neutral-800">Tap a menu item to add it</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-semibold text-neutral-200 leading-snug">{item.name}</p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-neutral-700 hover:text-red-400 transition-colors shrink-0"
                      aria-label={`Remove ${item.name}`}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    {/* Qty Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center text-neutral-400 hover:text-white transition-all text-xs font-bold"
                      >
                        −
                      </button>
                      <span className="text-xs font-bold tabular-nums text-white w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center text-neutral-400 hover:text-white transition-all text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs font-semibold text-amber-400 tabular-nums">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals + Payment + Submit */}
        <div className="px-5 pb-5 pt-4 border-t border-white/5 bg-[#0f0f12] space-y-4">

          {/* Breakdown */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Subtotal</span>
              <span className="tabular-nums">₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-neutral-500">
              <span>VAT (12%)</span>
              <span className="tabular-nums">₱{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/6">
              <span>Total</span>
              <span className="text-amber-400 tabular-nums">₱{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-semibold mb-2">Payment method</p>
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_METHODS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[10px] font-semibold uppercase tracking-wide transition-all ${
                    paymentMethod === value
                      ? "bg-white/8 border-white/20 text-white"
                      : "bg-transparent border-white/5 text-neutral-600 hover:text-neutral-400 hover:border-white/10"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || cart.length === 0}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-white/5 disabled:text-neutral-700 disabled:cursor-not-allowed text-[#0d0d0f] font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 tracking-wide uppercase active:scale-95"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-[#0d0d0f]/30 border-t-[#0d0d0f] rounded-full animate-spin" />
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Proceed to Payment
              </>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
}