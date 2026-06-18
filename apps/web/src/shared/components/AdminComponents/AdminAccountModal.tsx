import { useEffect, useRef, useState } from "react";
import type Account from "../../types/account";
import type { UpdateAccountsRequest } from "../../types/updateAccounts"; // adjust path if it lives elsewhere
import Field from "../../components/field";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  X,
  ChefHat,
  CreditCard,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  UserPlus,
  UserCog,
} from "lucide-react";

type Role = "CASHIER" | "COOK";

interface AdminAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: UpdateAccountsRequest & { id?: string }) => void;
  onDelete?: (id: string) => void;
  account?: Account | null; // pass an account to edit; omit/null for create mode
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {children}
    </p>
  );
}

function getInputClass(hasError: boolean, extraRightPadding = false) {
  return `w-full rounded-lg border bg-white/10 py-2 pl-9 ${extraRightPadding ? "pr-16" : "pr-3"} text-sm text-white outline-none transition focus:border-transparent focus:ring-2 focus:ring-amber-500 ${
    hasError ? "border-red-500/50" : "border-white/5"
  }`;
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let pwd = "";
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function AdminAccountModal({ isOpen, onClose, onSave, onDelete, account }: AdminAccountModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("CASHIER");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!account;

  useEffect(() => {
    if (!isOpen) return;
    setName(account?.name ?? "");
    setEmail(account?.email ?? "");
    setRole(account?.role ?? "CASHIER");
    setPassword(""); // never prefill a password, even when editing
    setTouched({});
    setShowPassword(false);
    setConfirmingDelete(false);
  }, [isOpen, account]);

  useEffect(() => {
    if (!isOpen) {
      setMounted(false);
      return;
    }
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
    setMounted(false);
    setTimeout(onClose, 150);
  }

  if (!isOpen) return null;

  const passwordRequired = !isEditing;
  const errors = {
    name: name.trim().length === 0 ? "Name is required" : name.trim().length < 2 ? "Name must be at least 2 characters" : "",
    email:
      email.trim().length === 0
        ? "Email is required"
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? "Enter a valid email address"
        : "",
    password: passwordRequired
      ? password.length === 0
        ? "Password is required"
        : password.length < 8
        ? "Password must be at least 8 characters"
        : ""
      : password.length > 0 && password.length < 8
      ? "Password must be at least 8 characters"
      : "",
  };

  const isValid = !errors.name && !errors.email && !errors.password;
  const strength = getPasswordStrength(password);
  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-amber-400", "bg-emerald-500"][strength];

  function handleBlur(field: keyof typeof errors) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!isValid) return;

    const payload: UpdateAccountsRequest & { id?: string } = {
      id: account?.id,
      name,
      email,
      role,
      ...(password ? { password } : {}),
    };
    onSave?.(payload);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm transition-opacity duration-150 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      onClick={() => !confirmingDelete && handleClose()}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        className={`w-full max-w-md rounded-lg bg-[#0d0d0f] p-6 ring-1 ring-white/10 shadow-2xl transition-all duration-150 ${
          mounted ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              {isEditing ? <UserCog className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </span>
            <div>
              <h2 id="account-modal-title" className="text-base font-semibold text-white">
                {isEditing ? "Edit admin account" : "New admin account"}
              </h2>
              <p className="text-xs text-neutral-500">
                {isEditing ? "Update this team member's details" : "Add a cashier or cook to the team"}
              </p>
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" htmlFor="name">
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  ref={nameInputRef}
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur("name")}
                  aria-invalid={!!(touched.name && errors.name)}
                  className={getInputClass(!!(touched.name && errors.name))}
                  placeholder="Juan Dela Cruz"
                />
              </div>
              {touched.name && errors.name && <ErrorText>{errors.name}</ErrorText>}
            </Field>

            <Field label="Email" htmlFor="email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  aria-invalid={!!(touched.email && errors.email)}
                  className={getInputClass(!!(touched.email && errors.email))}
                  placeholder="juan@restaurant.com"
                />
              </div>
              {touched.email && errors.email && <ErrorText>{errors.email}</ErrorText>}
            </Field>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-neutral-400">Role</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("CASHIER")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${
                  role === "CASHIER"
                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                    : "border-white/5 bg-white/10 text-neutral-400 hover:border-white/20"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Cashier
              </button>
              <button
                type="button"
                onClick={() => setRole("COOK")}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition ${
                  role === "COOK"
                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                    : "border-white/5 bg-white/10 text-neutral-400 hover:border-white/20"
                }`}
              >
                <ChefHat className="h-4 w-4" />
                Cook
              </button>
            </div>
          </div>

          <Field label={isEditing ? "New password" : "Password"} htmlFor="password">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                aria-invalid={!!(touched.password && errors.password)}
                className={getInputClass(!!(touched.password && errors.password), true)}
                placeholder={isEditing ? "Leave blank to keep the current password" : "At least 8 characters"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {touched.password && errors.password && <ErrorText>{errors.password}</ErrorText>}

            {password.length > 0 && (
              <div className="mt-1.5 flex items-center justify-between">
                <div className="flex flex-1 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? strengthColor : "bg-white/10"}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-[11px] text-neutral-500">{strengthLabel}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPassword(generatePassword())}
              className="mt-1 flex items-center gap-1 self-start text-xs text-amber-500 hover:text-amber-400"
            >
              <RefreshCw className="h-3 w-3" />
              Generate secure password
            </button>
          </Field>
        </div>

        {confirmingDelete ? (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <p className="flex items-start gap-2 text-sm text-red-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Delete this account? This can't be undone.
            </p>
            <div className="mt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => account && onDelete?.(account.id)}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-400"
              >
                Delete permanently
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-between">
            {isEditing ? (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
              >
                Delete account
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button type="button" onClick={handleClose} className="rounded-lg px-4 py-2 text-sm text-neutral-400 transition hover:text-neutral-200">
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}