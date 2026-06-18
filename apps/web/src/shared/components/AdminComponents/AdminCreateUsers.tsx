import type { CreateAccountsRequest } from "../../types/createAccounts";
import Field from "../../components/field";
import { useState, useEffect, useRef } from "react";
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
  Loader2,
  AlertCircle,
  UserPlus,
} from "lucide-react";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let pwd = "";
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {children}
    </p>
  );
}

export default function AdminCreateUserModal({
  onClose,
  isClosed,
  onSave
}: {
  onClose: () => void;
  isClosed: boolean;
  onSave: (userData: CreateAccountsRequest) => void;
}) {
  const [createUserData, setCreateUserData] = useState<CreateAccountsRequest>({
    name: "",
    email: "",
    password: "",
    role: "CASHIER",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isClosed) {
      const t = setTimeout(() => setMounted(true), 10);
      const f = setTimeout(() => nameInputRef.current?.focus(), 50);
      return () => {
        clearTimeout(t);
        clearTimeout(f);
      };
    } else {
      setMounted(false);
    }
  }, [isClosed]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !isClosed) handleClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClosed]);

  function handleClose() {
    setMounted(false);
    setTimeout(() => {
      onClose();
      setCreateUserData({ name: "", email: "", password: "", role: "CASHIER" });
      setTouched({});
      setShowPassword(false);
    }, 150);
  }

  if (isClosed) return null;

  const errors = {
    name:
      createUserData.name.trim().length === 0
        ? "Name is required"
        : createUserData.name.trim().length < 2
        ? "Name must be at least 2 characters"
        : "",
    email:
      createUserData.email.trim().length === 0
        ? "Email is required"
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createUserData.email)
        ? "Enter a valid email address"
        : "",
    password:
      createUserData.password.length === 0
        ? "Password is required"
        : createUserData.password.length < 8
        ? "Password must be at least 8 characters"
        : "",
  };

  const isValid = !errors.name && !errors.email && !errors.password;
  const strength = getPasswordStrength(createUserData.password);
  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-amber-400", "bg-emerald-500"][strength];

  function handleBlur(field: keyof typeof errors) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!isValid) return;
    setIsSubmitting(true);
    // TODO: replace with the real API call
    setTimeout(() => {
      console.log("Creating user with data:", createUserData);
      setIsSubmitting(false);
      onSave(createUserData);
      handleClose();
    }, 900);
  }

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-150 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        className={`w-full max-w-md rounded-xl bg-[#0d0d0f] p-6 ring-1 ring-white/10 shadow-2xl transition-all duration-150 ${
          mounted ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <UserPlus className="h-5 w-5" />
            </span>
            <div>
              <h2 id="account-modal-title" className="text-base font-semibold text-white">
                New user account
              </h2>
              <p className="text-xs text-neutral-500">Add a cashier or cook to the team</p>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Name" htmlFor="name">
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                ref={nameInputRef}
                id="name"
                type="text"
                value={createUserData.name}
                onChange={(e) => setCreateUserData({ ...createUserData, name: e.target.value })}
                onBlur={() => handleBlur("name")}
                aria-invalid={!!(touched.name && errors.name)}
                className={`w-full rounded-md border bg-[#1a1a1c] py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-transparent focus:ring-2 focus:ring-amber-500 ${
                  touched.name && errors.name ? "border-red-500/50" : "border-white/10"
                }`}
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
                value={createUserData.email}
                onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
                onBlur={() => handleBlur("email")}
                aria-invalid={!!(touched.email && errors.email)}
                className={`w-full rounded-md border bg-[#1a1a1c] py-2 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-transparent focus:ring-2 focus:ring-amber-500 ${
                  touched.email && errors.email ? "border-red-500/50" : "border-white/10"
                }`}
                placeholder="juan@restaurant.com"
              />
            </div>
            {touched.email && errors.email && <ErrorText>{errors.email}</ErrorText>}
          </Field>

          <Field label="Password" htmlFor="password">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={createUserData.password}
                onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })}
                onBlur={() => handleBlur("password")}
                aria-invalid={!!(touched.password && errors.password)}
                className={`w-full rounded-md border bg-[#1a1a1c] py-2 pl-9 pr-16 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-transparent focus:ring-2 focus:ring-amber-500 ${
                  touched.password && errors.password ? "border-red-500/50" : "border-white/10"
                }`}
                placeholder="At least 8 characters"
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

            <div className="mt-1.5 flex items-center justify-between">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      createUserData.password.length === 0
                        ? "bg-white/10"
                        : i < strength
                        ? strengthColor
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              {createUserData.password.length > 0 && (
                <span className="ml-2 text-[11px] text-neutral-500">{strengthLabel}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setCreateUserData((d) => ({ ...d, password: generatePassword() }))}
              className="mt-1 flex items-center gap-1 self-start text-xs text-amber-500 hover:text-amber-400"
            >
              <RefreshCw className="h-3 w-3" />
              Generate secure password
            </button>
          </Field>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-neutral-400">Role</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCreateUserData({ ...createUserData, role: "CASHIER" })}
                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm transition ${
                  createUserData.role === "CASHIER"
                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                    : "border-white/10 bg-[#1a1a1c] text-neutral-400 hover:border-white/20"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Cashier
              </button>
              <button
                type="button"
                onClick={() => setCreateUserData({ ...createUserData, role: "COOK" })}
                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm transition ${
                  createUserData.role === "COOK"
                    ? "border-amber-500 bg-amber-500/10 text-amber-400"
                    : "border-white/10 bg-[#1a1a1c] text-neutral-400 hover:border-white/20"
                }`}
              >
                <ChefHat className="h-4 w-4" />
                Cook
              </button>
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-3 border-t border-white/5 pt-4">
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
              className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create user"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}