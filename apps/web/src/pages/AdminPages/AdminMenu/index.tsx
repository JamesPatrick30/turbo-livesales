import AdminNav from "../../../components/AdminComponents/AdminNav";
import { toast } from "react-toastify";
const MENU_ITEMS = [
  { id: 1, name: "Sinigang na Baboy", category: "Main", price: 185, available: true },
  { id: 2, name: "Adobong Manok", category: "Main", price: 160, available: true },
  { id: 3, name: "Kare-Kare", category: "Main", price: 210, available: true },
  { id: 4, name: "Crispy Pata", category: "Main", price: 380, available: true },
  { id: 5, name: "Lechon Kawali", category: "Main", price: 295, available: false },
  { id: 6, name: "Pancit Canton", category: "Noodles", price: 120, available: true },
  { id: 7, name: "Palabok", category: "Noodles", price: 130, available: true },
  { id: 8, name: "Steamed Rice", category: "Sides", price: 30, available: true },
  { id: 9, name: "Java Rice", category: "Sides", price: 45, available: true },
  { id: 10, name: "Lumpiang Shanghai", category: "Sides", price: 90, available: true },
  { id: 11, name: "Halo-Halo", category: "Dessert", price: 95, available: true },
  { id: 12, name: "Leche Flan", category: "Dessert", price: 75, available: false },
  { id: 13, name: "Calamansi Juice", category: "Drinks", price: 45, available: true },
  { id: 14, name: "Iced Tea", category: "Drinks", price: 55, available: true },
  { id: 15, name: "San Miguel Beer", category: "Drinks", price: 80, available: true },
];

const CATEGORIES = ["All", "Main", "Noodles", "Sides", "Dessert", "Drinks"];

const CATEGORY_STYLES: Record<string, string> = {
  Main: "bg-amber-500/10 text-amber-400",
  Noodles: "bg-orange-500/10 text-orange-400",
  Sides: "bg-green-500/10 text-green-400",
  Dessert: "bg-pink-500/10 text-pink-400",
  Drinks: "bg-blue-500/10 text-blue-400",
};

export default function AdminMenu() {
    const ViteApp = import.meta.env.VITE_APP;
    const HandleEdit = () => {
        if (ViteApp === "Demo") {
            toast.info("Demo mode - edit disabled");
        }
    };
  return (
    <div className="flex min-h-screen bg-[#0d0d0f] text-white">
      <AdminNav />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Menu</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{MENU_ITEMS.length} items · {MENU_ITEMS.filter(i => !i.available).length} unavailable</p>
          </div>
          {/* Wire to modal/form in real app */}
          <button className="text-xs px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors">
            + Add item
          </button>
        </div>

        <div className="px-8 py-6 space-y-4">

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors
                  ${cat === "All"
                    ? "bg-white/8 border-white/10 text-white font-medium"
                    : "border-white/5 text-neutral-500 hover:text-neutral-300 hover:border-white/10"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">Name</th>
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">Category</th>
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">Price</th>
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {MENU_ITEMS.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-white">{item.name}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_STYLES[item.category]}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-neutral-300">₱{item.price}</td>
                    <td className="px-5 py-3.5">
                      {item.available ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-medium">Available</span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-500/10 text-neutral-500 font-medium">Unavailable</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {/* Wire to edit/delete in real app */}
                      <button 
                      className="text-xs text-neutral-600 hover:text-neutral-300 transition-colors"
                      onClick={HandleEdit}
                      >
                        Edit
                      </button>
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