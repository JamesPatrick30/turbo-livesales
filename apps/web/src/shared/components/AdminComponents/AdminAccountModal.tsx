import { useEffect, useState } from "react";
import type Account from "../../types/account";
type Role = "cashier" | "cook" ;

// interface Account {
//   id: string;
//   name: string;
//   email: string;
//   role: Role;
//   status: Status;
// }

interface AdminAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: Omit<Account, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  account?: Account | null; // pass an account to edit; omit/null for create mode
}

const inputClass =
  "w-full rounded-lg border border-white/5 bg-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm text-neutral-400">{label}</label>
      {children}
    </div>
  );
}

export default function AdminAccountModal({ isOpen, onClose, onSave, onDelete, account }: AdminAccountModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("cashier");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
const [password, setPassword] = useState("");
  useEffect(() => {
    if (!isOpen) return;
    setName(account?.name ?? "");
    setEmail(account?.email ?? "");
    setRole(account?.role ?? "cashier");
    setPassword(account?.password ?? "");
    setConfirmingDelete(false);
  }, [isOpen, account]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      confirmingDelete ? setConfirmingDelete(false) : onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose, confirmingDelete]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.({ id: account?.id, name, email, role});
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={() => !confirmingDelete && onClose()}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
        className="w-full max-w-md rounded-lg bg-[#0d0d0f] p-6 ring-1 ring-white/10"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="account-modal-title" className="text-lg font-semibold text-white">
            {account ? "Edit admin account" : "New admin account"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-neutral-500 transition hover:bg-white/5 hover:text-neutral-300">
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" htmlFor="name">
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
            </Field>
            <Field label="Role" htmlFor="role">
              <select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)} className={inputClass}>
                <option value="cashier">Cashier</option>
                <option value="cook">Cook</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
          </div>


          <Field label="Email" htmlFor="email">
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
          </Field>
          <Field label="Password" htmlFor="password">
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </Field>
        </div>

        {confirmingDelete ? (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
            <p className="text-sm text-red-300">Delete this account? This can't be undone.</p>
            <div className="mt-3 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmingDelete(false)} className="rounded-lg px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200">
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
            {account ? (
              <button type="button" onClick={() => setConfirmingDelete(true)} className="rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300">
                Delete account
              </button>
            ) : <span />}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-neutral-400 transition hover:text-neutral-200">
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-amber-400">
                Save
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}