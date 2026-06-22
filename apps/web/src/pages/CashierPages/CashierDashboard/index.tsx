import { useEffect, useState } from "react";
import api from "../../../shared/lib/axios";
// ── Components ───────────────────────────────────────────────────────────────
import CashierNav from "../../../shared/components/CashierComponents/CashierNav";
import { toast } from "react-toastify";

// ── Mock Data (Aligned with Prisma Schema) ──────────────────────────────────

const ORDER_TYPES = ["DINE_IN", "TAKEAWAY", "DELIVERY"];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CashierDashboard() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [orderType, setOrderType] = useState("TAKEAWAY");
  
  // Mock cart state (maps to SaleItem[])
//   const [category, setCategory] = useState("All");
    const [categorys, setCategorys] = useState<string[]>([]);
  const [cart, setCart] = useState<any[]>([]); 
  const [menuItems, setMenuItems] = useState<any[]>([]); // State to hold fetched menu items
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
//   const filteredItems = activeCategory === "All" 
//     ? MENU_ITEMS 
//     : MENU_ITEMS.filter(item => item.category === activeCategory);

    const HandleFetchMenuItems = async () => {
      try {
          const response = await api.get("/items");
          // Handle the response data if needed
          setMenuItems(response.data);
          setFilteredItems(response.data); // Initialize filtered items with all menu items
          setCategorys(
            [...new Set(response.data.map((item: any) => item.category))].filter(
              (category): category is string => typeof category === "string"
            )
          );
          setCategorys(prev => ["All", ...prev]); // Add "All" at the beginning of the categories

      } catch (error) {
          console.error("Error fetching menu items:", error);
      }
  };
  const HandleFilterMenuItems = (Category: string) => {
    setActiveCategory(Category);
    if (Category === "All") {
        setFilteredItems(menuItems);
        return;
    }
    const filtered = activeCategory === Category
      ? menuItems 
      : menuItems.filter(item => item.category === activeCategory);
    setFilteredItems(filtered);
  }

  useEffect(() => {
    HandleFetchMenuItems();
  }, []);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const HandleAddToCart = (item: any) => {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            setCart(cart.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const handleSaveSale = async () => {
        try {
            const response = await api.post("/sales/create", {
                orderType,
                items: cart.map(item => ({
                    menuItemId: item.id,
                    quantity: item.quantity,
                })),
                paymentMethod: "CASH", // This can be dynamic based on user selection
            });
            toast.success(response.data.message);
          } catch (error) {
              console.error("Error saving sale:", error);
              toast.error("Error saving sale.");
          }
        };
  return (
    <div className="flex min-h-screen bg-[#0d0d0f] text-white overflow-hidden">
      <CashierNav />

      {/* ── Center Content: Menu Selection ── */}
      <main className="flex-1 flex flex-col min-w-0 border-r border-white/5">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">New Order</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Select items to add to ticket</p>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search menu..." 
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 w-64 placeholder:text-neutral-600"
            />
          </div>
        </div>

        {/* Categories (Pills) */}
        <div className="px-8 py-4 border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
          {categorys.map(cat => (
            <button
              key={cat}
              onClick={() => HandleFilterMenuItems(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                activeCategory === cat 
                  ? "bg-amber-500 text-[#0d0d0f]" 
                  : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => HandleAddToCart(item)}
                disabled={item.status === "UNAVAILABLE"}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                  item.status === "AVAILABLE"
                    ? "bg-white/3 border-white/5 hover:border-amber-500/50 hover:bg-white/5 active:scale-95"
                    : "bg-white/2 border-transparent opacity-50 cursor-not-allowed"
                }`}
              >
                <span className="text-sm font-medium text-white mb-1 leading-tight">{item.name}</span>
                <span className="text-xs text-amber-400 tabular-nums mt-auto pt-4">₱{item.price}</span>
                {item.status === "UNAVAILABLE" && (
                  <span className="text-[10px] text-red-400 uppercase mt-1 tracking-wider">Sold Out</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* ── Right Sidebar: Active Ticket ── */}
      <aside className="w-95 bg-[#0d0d0f] flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-white/5">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Current Ticket</h2>
          
          {/* Order Type Selector */}
          <div className="flex bg-white/5 rounded-lg p-1">
            {ORDER_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                  orderType === type 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-neutral-600">
              Ticket is empty
            </div>
          ) : (
             <div className="space-y-4">
               {/* Map your cart items here. Leaving as skeleton structure for now */}
                {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium">{item.name}</span>
                            <span className="text-xs text-neutral-400 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="text-sm text-amber-400 tabular-nums">₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
             </div>
          )}
        </div>

        {/* Totals & Checkout */}
        <div className="p-6 border-t border-white/5 bg-[#121215]">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-neutral-400">
              <span>Subtotal</span>
              <span className="tabular-nums">₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-400">
              <span>Tax (12%)</span>
              <span className="tabular-nums">₱{(subtotal * 0.12).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-semibold text-white pt-2 border-t border-white/5 mt-2">
              <span>Total</span>
              <span className="text-amber-400 tabular-nums">₱{(subtotal * 1.12).toFixed(2)}</span>
            </div>
          </div>

          <button 
            className="w-full bg-amber-500 hover:bg-amber-400 text-[#0d0d0f] font-semibold py-3.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            onClick={handleSaveSale}
          >
            Proceed to Payment
          </button>
        </div>
      </aside>
    </div>
  );
}