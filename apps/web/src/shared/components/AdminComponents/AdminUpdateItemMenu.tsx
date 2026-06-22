import { useEffect, useRef, useState } from "react";
import type { UpdateMenuItemDtoRequest } from "../../types/items"; // adjust path as needed
import Field from "../../components/field";
import {
  X,
  UtensilsCrossed,
  Tag,
  AlignLeft,
  DollarSign,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

type Status = "AVAILABLE" | "UNAVAILABLE";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  status: Status;
}

interface AdminUpdateMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (id: string, payload: UpdateMenuItemDtoRequest) => Promise<void> | void;
  item?: MenuItem | null;
  onDelete?: (id: string) => Promise<void> | void;
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

function ic(hasError: boolean, withIcon = true) {
  return [
    "w-full rounded-lg border bg-white/10 py-2 text-sm text-white placeholder:text-neutral-500 outline-none transition",
    "focus:border-transparent focus:ring-2 focus:ring-amber-500",
    withIcon ? "pl-9 pr-3" : "px-4",
    hasError ? "border-red-500/50" : "border-white/5",
  ].join(" ");
}

function resolveInitialCategory(category: string) {
  return CATEGORIES.includes(category) ? category : "__custom__";
}

export default function AdminUpdateMenuItemModal({
  isOpen,
  onClose,
  item,
  onSave,
  onDelete,
}: AdminUpdateMenuItemModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [status, setStatus] = useState<Status>("AVAILABLE");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const isCustomCategory = category === "__custom__";
  const resolvedCategory = isCustomCategory ? customCategory : category;

  useEffect(() => {
    if (!isOpen) { setMounted(false); return; }

    // Seed from item
    setName(item?.name ?? "");
    setPrice(item?.price != null ? String(item.price) : "");
    setDescription(item?.description ?? "");
    setStatus(item?.status ?? "AVAILABLE");
    const cat = item?.category ?? "";
    const knownCat = resolveInitialCategory(cat);
    setCategory(knownCat);
    setCustomCategory(knownCat === "__custom__" ? cat : "");
    setTouched({});
    setConfirmingDelete(false);
    setIsSubmitting(false);
    setIsDeleting(false);

    const t = setTimeout(() => setMounted(true), 10);
    const f = setTimeout(() => nameInputRef.current?.focus(), 50);
    return () => { clearTimeout(t); clearTimeout(f); };
  }, [isOpen, item]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      confirmingDelete ? setConfirmingDelete(false) : handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, confirmingDelete]);

  function handleClose() {
    if (isSubmitting || isDeleting) return;
    setMounted(false);
    setTimeout(onClose, 150);
  }

  if (!isOpen || !item) return null;

  const parsedPrice = parseFloat(price);
  const errors = {
    name: name.trim().length > 0 && name.trim().length < 2 ? "Name must be at least 2 characters" : "",
    price: price.trim() !== "" && (isNaN(parsedPrice) || parsedPrice <= 0) ? "Enter a valid price greater than 0" : "",
    customCategory: isCustomCategory && customCategory.trim().length === 0 ? "Enter a category name" : "",
  };

  const isValid = !errors.name && !errors.price && !errors.customCategory;

  // Build only the changed fields (patch semantics)
  function buildPayload(): UpdateMenuItemDtoRequest {
    const patch: UpdateMenuItemDtoRequest = {};
    if (name.trim() && name.trim() !== item!.name) patch.name = name.trim();
    if (price.trim() && parsedPrice !== item!.price) patch.price = parsedPrice;
    if (description.trim() !== (item!.description ?? "")) patch.description = description.trim();
    if (resolvedCategory.trim() && resolvedCategory.trim() !== item!.category) patch.category = resolvedCategory.trim();
    if (status !== item!.status) patch.status = status;
    return patch;
  }

  function handleBlur(field: keyof typeof errors) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, price: true, customCategory: true });
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      await onSave?.(item!.id, buildPayload());
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!item) return;
    setIsDeleting(true);
    try {
      await onDelete?.(item.id);
      handleClose();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity duration-150 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      onClick={() => !confirmingDelete && handleClose()}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-update-modal-title"
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
              <h2 id="menu-update-modal-title" className="text-base font-semibold text-white">
                Edit menu item
              </h2>
              <p className="truncate max-w-55 text-xs text-neutral-500">{item.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            disabled={isSubmitting || isDeleting}
            className="rounded-md p-1.5 text-neutral-500 transition hover:bg-white/5 hover:text-neutral-300 disabled:pointer-events-none disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Name + Price */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Item name" htmlFor="upd-item-name">
              <div className="relative">
                <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  ref={nameInputRef}
                  id="upd-item-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur("name")}
                  aria-invalid={!!(touched.name && errors.name)}
                  className={ic(!!(touched.name && errors.name))}
                  placeholder={item.name}
                />
              </div>
              {touched.name && errors.name && <ErrorText>{errors.name}</ErrorText>}
            </Field>

            <Field label="Price (₱)" htmlFor="upd-item-price">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-500">
                  ₱
                </span>
                <input
                  id="upd-item-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onBlur={() => handleBlur("price")}
                  aria-invalid={!!(touched.price && errors.price)}
                  className={ic(!!(touched.price && errors.price))}
                  placeholder={String(item.price)}
                />
              </div>
              {touched.price && errors.price && <ErrorText>{errors.price}</ErrorText>}
            </Field>
          </div>

          {/* Description */}
          <Field label="Description" htmlFor="upd-item-description">
            <div className="relative">
              <AlignLeft className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-neutral-500" />
              <textarea
                id="upd-item-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-white/5 bg-white/10 py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-transparent focus:ring-2 focus:ring-amber-500"
                placeholder="Short description of the dish (optional)"
              />
            </div>
          </Field>

          {/* Category */}
          <Field label="Category" htmlFor="upd-item-category">
            <div className="relative">
              <LayoutGrid className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <select
                id="upd-item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`${ic(false)} appearance-none`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0d0d0f]">{c}</option>
                ))}
                <option value="__custom__" className="bg-[#0d0d0f]">+ Custom category</option>
              </select>
            </div>
          </Field>

          {/* Custom category */}
          {isCustomCategory && (
            <Field label="Custom category name" htmlFor="upd-item-custom-category">
              <div className="relative">
                <LayoutGrid className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  id="upd-item-custom-category"
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  onBlur={() => handleBlur("customCategory")}
                  aria-invalid={!!(touched.customCategory && errors.customCategory)}
                  className={ic(!!(touched.customCategory && errors.customCategory))}
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

        {/* Delete confirmation */}
        {confirmingDelete ? (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <p className="flex items-start gap-2 text-sm text-red-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Remove <span className="font-medium">"{item.name}"</span> from the menu? This can't be undone.
            </p>
            <div className="mt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={isDeleting}
                className="rounded-lg px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />Deleting...</>
                ) : "Delete permanently"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={isSubmitting}
              className="rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:pointer-events-none disabled:opacity-40"
            >
              Delete item
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-sm font-medium text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                ) : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}