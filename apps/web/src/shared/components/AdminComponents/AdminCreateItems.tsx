import { useEffect, useRef, useState } from "react";
import type { CreateMenuItemDto } from "@repo/types"; // adjust path as needed
import Field from "../../components/field";
import {
  X,
  UtensilsCrossed,
  Tag,
  AlignLeft,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface AdminCreateMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: CreateMenuItemDto) => Promise<void> | void;
}

const CATEGORIES = ["Appetizer", "Main Course", "Dessert", "Beverage", "Side Dish", "Special"];

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {children}
    </p>
  );
}

function inputClass(hasError: boolean, withIcon = true) {
  return [
    "w-full rounded-lg border bg-white/10 py-2 text-sm text-white placeholder:text-neutral-500 outline-none transition",
    "focus:border-transparent focus:ring-2 focus:ring-amber-500",
    withIcon ? "pl-9 pr-3" : "px-4",
    hasError ? "border-red-500/50" : "border-white/5",
  ].join(" ");
}

export default function AdminCreateMenuItemModal({
  isOpen,
  onClose,
  onSave,
}: AdminCreateMenuItemModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [status, setStatus] = useState<"AVAILABLE" | "UNAVAILABLE">("AVAILABLE");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const isCustomCategory = category === "__custom__";
  const resolvedCategory = isCustomCategory ? customCategory : category;

  useEffect(() => {
    if (!isOpen) {
      setMounted(false);
      return;
    }
    // reset
    setName("");
    setPrice("");
    setDescription("");
    setCategory("");
    setCustomCategory("");
    setStatus("AVAILABLE");
    setTouched({});
    setIsSubmitting(false);

    const t = setTimeout(() => setMounted(true), 10);
    const f = setTimeout(() => nameInputRef.current?.focus(), 50);
    return () => {
      clearTimeout(t);
      clearTimeout(f);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handleClose() {
    setMounted(false);
    setTimeout(onClose, 150);
  }

  if (!isOpen) return null;

  const parsedPrice = parseFloat(price);
  const errors = {
    name: name.trim().length === 0 ? "Item name is required" : "",
    price:
      price.trim() === ""
        ? "Price is required"
        : isNaN(parsedPrice) || parsedPrice <= 0
        ? "Enter a valid price greater than 0"
        : "",
    category: resolvedCategory.trim().length === 0 ? "Category is required" : "",
    customCategory: isCustomCategory && customCategory.trim().length === 0 ? "Enter a category name" : "",
  };

  const isValid = !errors.name && !errors.price && !errors.category && !errors.customCategory;

  function handleBlur(field: keyof typeof errors) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, price: true, category: true, customCategory: true });
    if (!isValid) return;

    const payload: CreateMenuItemDto = {
      name: name.trim(),
      price: parsedPrice,
      ...(description.trim() ? { description: description.trim() } : {}),
      category: resolvedCategory.trim(),
      status,
    };

    setIsSubmitting(true);
    try {
      await onSave?.(payload);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity duration-150 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-modal-title"
        className={`w-full max-w-lg rounded-xl bg-[#0d0d0f] p-6 ring-1 ring-white/10 shadow-2xl transition-all duration-150 ${
          mounted ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <UtensilsCrossed className="h-5 w-5" />
            </span>
            <div>
              <h2 id="menu-modal-title" className="text-base font-semibold text-white">
                New menu item
              </h2>
              <p className="text-xs text-neutral-500">Add a dish or drink to the menu</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-neutral-500 transition hover:bg-white/5 hover:text-neutral-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Name + Price */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Item name" htmlFor="item-name">
              <div className="relative">
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  ref={nameInputRef}
                  id="item-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur("name")}
                  aria-invalid={!!(touched.name && errors.name)}
                  className={inputClass(!!(touched.name && errors.name))}
                  placeholder="e.g. Sinigang"
                />
              </div>
              {touched.name && errors.name && <ErrorText>{errors.name}</ErrorText>}
            </Field>

            <Field label="Price (₱)" htmlFor="item-price">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-500">
                  ₱
                </span>
                <input
                  id="item-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onBlur={() => handleBlur("price")}
                  aria-invalid={!!(touched.price && errors.price)}
                  className={inputClass(!!(touched.price && errors.price))}
                  placeholder="0.00"
                />
              </div>
              {touched.price && errors.price && <ErrorText>{errors.price}</ErrorText>}
            </Field>
          </div>

          {/* Description */}
          <Field label="Description" htmlFor="item-description">
            <div className="relative">
              <AlignLeft className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-neutral-500" />
              <textarea
                id="item-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-white/5 bg-white/10 py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-transparent focus:ring-2 focus:ring-amber-500"
                placeholder="Short description of the dish (optional)"
              />
            </div>
          </Field>

          {/* Category */}
          <Field label="Category" htmlFor="item-category">
            <div className="relative">
              <LayoutGrid className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <select
                id="item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onBlur={() => handleBlur("category")}
                aria-invalid={!!(touched.category && errors.category)}
                className={`${inputClass(!!(touched.category && errors.category))} appearance-none`}
              >
                <option value="" disabled className="bg-[#0d0d0f] text-neutral-400">
                  Select a category
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0d0d0f]">
                    {c}
                  </option>
                ))}
                <option value="__custom__" className="bg-[#0d0d0f]">
                  + Custom category
                </option>
              </select>
            </div>
            {touched.category && errors.category && <ErrorText>{errors.category}</ErrorText>}
          </Field>

          {/* Custom category input */}
          {isCustomCategory && (
            <Field label="Custom category name" htmlFor="item-custom-category">
              <div className="relative">
                <LayoutGrid className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  id="item-custom-category"
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  onBlur={() => handleBlur("customCategory")}
                  aria-invalid={!!(touched.customCategory && errors.customCategory)}
                  className={inputClass(!!(touched.customCategory && errors.customCategory))}
                  placeholder="e.g. Pasta"
                  autoFocus
                />
              </div>
              {touched.customCategory && errors.customCategory && (
                <ErrorText>{errors.customCategory}</ErrorText>
              )}
            </Field>
          )}

          {/* Status */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-neutral-400">Availability</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("AVAILABLE")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${
                  status === "AVAILABLE"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-white/5 bg-white/10 text-neutral-400 hover:border-white/20"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Available
              </button>
              <button
                type="button"
                onClick={() => setStatus("UNAVAILABLE")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${
                  status === "UNAVAILABLE"
                    ? "border-red-500 bg-red-500/10 text-red-400"
                    : "border-white/5 bg-white/10 text-neutral-400 hover:border-white/20"
                }`}
              >
                <XCircle className="h-4 w-4" />
                Unavailable
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-sm font-medium text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding item...
              </>
            ) : (
              "Add item"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}