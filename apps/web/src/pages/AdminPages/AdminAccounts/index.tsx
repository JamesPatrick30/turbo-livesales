import AdminNav from "../../../components/AdminComponents/AdminNav";

const ACCOUNTS = [
  { id: 1, name: "Maria Santos", email: "cashier@demo.com", role: "cashier", status: "active", joined: "Jan 12, 2026" },
  { id: 2, name: "Juan dela Cruz", email: "cook@demo.com", role: "cook", status: "active", joined: "Jan 12, 2026" },
  { id: 3, name: "Boss Admin", email: "admin@demo.com", role: "admin", status: "active", joined: "Jan 10, 2026" },
  { id: 4, name: "Ana Reyes", email: "cashier2@demo.com", role: "cashier", status: "inactive", joined: "Feb 3, 2026" },
];

const ROLE_STYLES: Record<string, string> = {
  cashier: "bg-amber-500/15 text-amber-400",
  cook: "bg-orange-500/15 text-orange-400",
  admin: "bg-violet-500/15 text-violet-400",
};

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-medium text-neutral-400 shrink-0">
      {initials}
    </div>
  );
}

export default function AdminAccounts() {
    const ViteApp = import.meta.env.VITE_APP;
  return (
    <div className="flex min-h-screen bg-[#0d0d0f] text-white">
      <AdminNav />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Accounts</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{ACCOUNTS.length} users · {ACCOUNTS.filter(a => a.status === "active").length} active</p>
          </div>
          {/* Wire to invite modal in real app */}
          <button className="text-xs px-4 py-2 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors">
            + Add user
          </button>
        </div>

        <div className="px-8 py-6 space-y-4">

          {/* Role summary */}
          <div className="grid grid-cols-3 gap-3">
            {["cashier", "cook", "admin"].map((role) => {
              const count = ACCOUNTS.filter((a) => a.role === role).length;
              return (
                <div key={role} className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-neutral-400 capitalize">{role}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_STYLES[role]}`}>{count}</span>
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">User</th>
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">Role</th>
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-xs text-neutral-600 font-medium">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {ACCOUNTS.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={account.name} />
                        <div>
                          <p className="text-sm font-medium text-white">{account.name}</p>
                          <p className="text-xs text-neutral-600">{account.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${ROLE_STYLES[account.role]}`}>
                        {account.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {account.status === "active" ? (
                        <span className="flex items-center gap-1.5 text-xs text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-neutral-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 inline-block" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-neutral-600">{account.joined}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button 
                        onClick={() => {
                            if (ViteApp === "Demo") {
                                alert(`Edit user: ${account.name}`);
                            }
                        }}
                        className="text-xs text-neutral-600 hover:text-neutral-300 transition-colors"
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