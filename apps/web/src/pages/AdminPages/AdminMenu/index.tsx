import AdminNav from "../../../shared/components/AdminComponents/AdminNav";
import { toast } from "react-toastify";
import api from "../../../shared/lib/axios";

// components
import AdminCreateMenuItemModal from "../../../shared/components/AdminComponents/AdminCreateItems";
import AdminUpdateMenuItemModal from "../../../shared/components/AdminComponents/AdminUpdateItemMenu";

// types
import type { MenuItem } from "../../../shared/types/items";
import type { CreateMenuItemDto } from "@repo/types"; // adjust path as needed
import { useEffect, useState } from "react";

const CATEGORY_STYLES: Record<string, string> = {
  Main: "bg-amber-500/10 text-amber-400",
  Noodles: "bg-orange-500/10 text-orange-400",
  Sides: "bg-green-500/10 text-green-400",
  Dessert: "bg-pink-500/10 text-pink-400",
  Drinks: "bg-blue-500/10 text-blue-400",
};

export default function AdminMenu() {
    const HandleEdit = (item: MenuItem) => {
      setEditItem(item);
      setIsOpenUpdateModal(true);
    };

    const [fetchMenuItems, setFetchMenuItems] = useState<MenuItem[]>([]);
    const [MENU_ITEMS, setMenuItems] = useState<MenuItem[]>([]);
    const [CATEGORIES, setCategories] = useState<string[]>(["All"]);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [ EditItem, setEditItem] = useState<MenuItem | null>(null);
    // Modal state
    const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
    const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
    const HandleOnCloseCreateModal = () => {
        setIsOpenCreateModal(false);
    }

    useEffect(() => {
        HandleFetchMenuItems();
    }, []);

    const HandleFetchMenuItems = async () => {
        try {
            const response = await api.get("/items");
            setFetchMenuItems(response.data);
            setMenuItems(response.data);
            // Extract unique categories from menu items
            const categories: string[] = [...new Set((response.data as MenuItem[]).map((item) => item.category))];
            setCategories(["All", ...categories]);
        } catch (error) {
            console.error("Error fetching menu items:", error);
        }
    };

    const HandleSaveNewItem = async (data: CreateMenuItemDto) => {
        // In real app, call API to save new item, then refresh list
        try{
          const response = await api.post("/items/add", data);
          toast.success(response.data.message || "Item created successfully");
          setMenuItems(prev => [...prev, response.data.newItem]); // Add new item to list
          setFetchMenuItems(prev => [...prev, response.data.newItem]); // Update fetched items
        }catch(err: any) {
          toast.dismiss();
          console.error("Error creating item:", err.response?.data || err.message);
          toast.error(err.response?.data?.message || "Failed to create item");
        }
        // toast.success("New item created (not really in demo)");
        setIsOpenCreateModal(false);
    }

    const HandleCategoryFilter = (category: string) => {
        setSelectedCategory(category);
        if (category === "All") {
            setMenuItems(fetchMenuItems);
        } else {
            const filteredItems = fetchMenuItems.filter(item => item.category === category);
            setMenuItems(filteredItems);
        }
    }

    const HandleUpdateItem = async (id: string, data: any) => {
      try {
        const response = await api.put(`/items/update/${id}`, data);
        toast.success(response.data.message || "Item updated successfully");
        // Update the item in the local state
        setMenuItems(prevItems => prevItems.map(item => item.id === id ? response.data.updatedItem : item));
        setFetchMenuItems(prevItems => prevItems.map(item => item.id === id ? response.data.updatedItem : item));
      }catch(err: any) {
        toast.dismiss();
        console.error("Error updating item:", err.response?.data || err.message);
        toast.error(err.response?.data?.message || "Failed to update item");
      }
    };

    const HandleDeleteItem = async (id: string) => {
      try {
        const response = await api.delete(`/items/delete/${id}`);
        toast.success(response.data.message || "Item deleted successfully");
        // Remove the item from the local state
        setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
        setFetchMenuItems(prevItems => prevItems.filter(item => item.id !== id));
      }catch(err: any) {
        toast.dismiss();
        console.error("Error deleting item:", err.response?.data || err.message);
        toast.error(err.response?.data?.message || "Failed to delete item");
      }
    };

  return (
    <div className="flex min-h-screen bg-[#0d0d0f] text-white">
      <AdminCreateMenuItemModal isOpen={isOpenCreateModal} onClose={HandleOnCloseCreateModal} onSave={HandleSaveNewItem} />
      <AdminNav />
      <AdminUpdateMenuItemModal isOpen={isOpenUpdateModal} onClose={() => {}} item={EditItem} onSave={HandleUpdateItem} onDelete={HandleDeleteItem} />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Menu</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{MENU_ITEMS.length} items · {MENU_ITEMS.filter(i => i.status === 'UNAVAILABLE').length} unavailable</p>
          </div>
          {/* Wire to modal/form in real app */}
          <button className="text-xs px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors"
            onClick={() => setIsOpenCreateModal(true)}
          >
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
                  ${cat === selectedCategory
                    ? "bg-white/8 border-white/10 text-white font-medium"
                    : "border-white/5 text-neutral-500 hover:text-neutral-300 hover:border-white/10"
                  }`}
                onClick={() => HandleCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white/3 border border-white/5 rounded-xl overflow-hidden">
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
                    className="border-b border-white/3 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-white">{item.name}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_STYLES[item.category]}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-neutral-300">₱{item.price}</td>
                    <td className="px-5 py-3.5">
                      {item.status === 'AVAILABLE' ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 font-medium">Available</span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-500/10 text-neutral-500 font-medium">Unavailable</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {/* Wire to edit/delete in real app */}
                      <button 
                      className="text-xs text-neutral-600 hover:text-neutral-300 transition-colors"
                      onClick={() => HandleEdit(item)}
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