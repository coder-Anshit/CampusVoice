import { useEffect, useMemo, useState } from "react";
import { KeyRound, Copy, Plus, Sparkles, Users, X, Search, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { cv } from "../../../shared/design-system/inline.js";
import { createPilotUser, fetchUsers, provisionUsers } from "../../../shared/services/users.service.js";

const STUDENT_TEMPLATES = Array.from(
  { length: 10 },
  (_, i) => ({ username: `student${String(i + 1).padStart(2, "0")}`, role: "student" })
);

const EMPLOYEE_TEMPLATES = Array.from(
  { length: 5 },
  (_, i) => ({ username: `employee${String(i + 1).padStart(2, "0")}`, role: "employee" })
);

const ADMIN_TEMPLATES = [
  { username: "admin01", role: "admin" },
  { username: "admin02", role: "admin" },
];

const PILOT_TEMPLATES = [...STUDENT_TEMPLATES, ...ADMIN_TEMPLATES, ...EMPLOYEE_TEMPLATES];
function nextUsername(existing, role) { const prefix = role === "admin" ? "admin" : role === "employee" ? "employee" : "student"; for (let i=1;i<=500;i+=1){ const c=`${prefix}${String(i).padStart(2,"0")}`; if(!existing.has(c)) return c; } return `${prefix}${Date.now().toString().slice(-6)}`; }

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [credential, setCredential] = useState(null);
  const [showProvision, setShowProvision] = useState(false);
  const [provisionRole, setProvisionRole] = useState("student");
  const [provisionCount, setProvisionCount] = useState(10);
  const [provisionProgram, setProvisionProgram] = useState("B.Tech");
  const [provisionCourse, setProvisionCourse] = useState("CSE");
  const [provisionSemester, setProvisionSemester] = useState("7");
  const [provisionSection, setProvisionSection] = useState("A");
  const [provisionBatch, setProvisionBatch] = useState("2027");
  const [startRollNumber, setStartRollNumber] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const load = async () => {
    try { setLoading(true); setUsers(await fetchUsers()); }
    catch (e) { toast.error(e?.response?.data?.error || "Unable to load users"); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    load();
    const timer = window.setInterval(() => load(), 30000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, []);

  const existing = useMemo(() => new Set(users.map((u) => u.username)), [users]);
  useEffect(() => { if (!username) setUsername(nextUsername(existing, role)); }, [existing, role, username]);

  const createOne = async (payload = null) => {
    try {
      setBusy(true);
      const data = await createPilotUser(payload || { username, role, fullName, temporaryPassword, category: { program: provisionProgram, course: provisionCourse, semester: provisionSemester, section: provisionSection, batch: provisionBatch } });
      setCredential(data);
      setShowCreate(false);
      await load();
      toast.success(`Created ${data.user.username}`);
    } catch (e) { toast.error(e?.response?.data?.error || "Unable to create account"); }
    finally { setBusy(false); }
  };

  const generateSet = async (templates, label) => {
    const pending = templates.filter((item) => !existing.has(item.username));
    if (!pending.length) { toast.info(`All ${label.toLowerCase()} usernames already exist.`); return; }
    setBusy(true);
    const created = [];
    try {
      for (const item of pending) {
        try {
          const data = await createPilotUser(item);
          created.push({ username: data.user.username, role: data.user.role, temporaryPassword: data.temporaryPassword });
        } catch (e) {
          created.push({ username: item.username, role: item.role, error: e?.response?.data?.error || "Failed" });
        }
      }
      setCredential({ bulk: true, accounts: created });
      await load();
      toast.success(`Provisioned ${created.filter((x) => !x.error).length} ${label.toLowerCase()} account${created.filter((x) => !x.error).length === 1 ? "" : "s"}`);
    } finally { setBusy(false); }
  };

  const provisionAccounts = async () => {
    const count = Math.min(50, Math.max(1, Number(provisionCount) || 1));
    setShowProvision(false);
    setBusy(true);
    try {
      // Ask the backend to choose the next usernames from the live MongoDB
      // state. This avoids stale client-side lists and duplicate-name races.
      const data = await provisionUsers(provisionRole, count, { program: provisionProgram, course: provisionCourse, semester: provisionSemester, section: provisionSection, batch: provisionBatch, startRollNumber: Number(startRollNumber) || 1 });
      setCredential({
        bulk: true,
        accounts: Array.isArray(data.accounts) ? data.accounts : [],
      });
      await load();
      toast.success(`Provisioned ${data.created || 0} ${provisionRole} account${Number(data.created) === 1 ? "" : "s"}`);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Unable to provision accounts");
    } finally {
      setBusy(false);
    }
  };

  const categoryOptions = useMemo(() => [...new Set(users.map((u) => u.category?.name || "Uncategorized"))].sort(), [users]);

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [u.username, u.fullName, u.email, u.role].filter(Boolean).join(" ").toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesCategory = categoryFilter === "all" || (u.category?.name || "Uncategorized") === categoryFilter;
    return matchesSearch && matchesRole && matchesCategory;
  });

  const copy = async (text) => { try { await navigator.clipboard.writeText(text); toast.success("Copied"); } catch { toast.error("Copy failed"); } };


  return (
    <div className="space-y-5">
      <div className="cv-card bg-cv-surface border border-cv-border p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2"><Users size={18} /><h2 className="text-lg font-semibold">User Management</h2></div>
            <p className="text-sm opacity-70 mt-1">Admin-controlled accounts with fixed usernames and one-time temporary passwords. No public registration.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2.5 rounded-xl border border-cv-border bg-cv-surface hover:bg-cv-primary-soft transition inline-flex items-center gap-2 font-medium" onClick={() => setShowProvision(true)} disabled={busy}><Sparkles size={15} /> Provision accounts</button>
            <button className="px-4 py-2.5 rounded-xl bg-cv-primary text-white hover:opacity-90 transition inline-flex items-center gap-2 font-semibold shadow-sm" onClick={() => setShowCreate(true)}><Plus size={15} /> Create user</button>
          </div>
        </div>
      </div>

      {credential && (
        <div className="cv-card bg-cv-surface border border-cv-border p-5">
          <div className="flex items-start justify-between gap-3">
            <div><h3 className="font-semibold flex items-center gap-2"><KeyRound size={17} /> Temporary credentials</h3><p className="text-xs opacity-70 mt-1">Show/copy these once and give them privately to the stakeholder. Passwords are never displayed from the database.</p></div>
            <button onClick={() => setCredential(null)}><X size={18} /></button>
          </div>
          {credential.bulk ? (
            <div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left opacity-60"><th className="p-2">Username</th><th className="p-2">Role</th><th className="p-2">Temporary password</th></tr></thead><tbody>{credential.accounts.map((a) => <tr key={a.username} className="border-t border-cv-border"><td className="p-2 font-medium">{a.username}</td><td className="p-2">{a.role}</td><td className="p-2">{a.error ? <span className="text-red-500">{a.error}</span> : <button className="font-mono" onClick={() => copy(`${a.username}	${a.temporaryPassword}`)}>{a.temporaryPassword} <Copy size={13} className="inline" /></button>}</td></tr>)}</tbody></table></div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3 items-center"><span className="font-mono">{credential.user?.username || credential.username}</span><span className="font-mono px-3 py-2 rounded-lg bg-black/5">{credential.temporaryPassword}</span><button className="px-3 py-2 rounded-lg border border-cv-border" onClick={() => copy(`${credential.user?.username || credential.username}	${credential.temporaryPassword}`)}><Copy size={14} className="inline mr-1" /> Copy</button></div>
          )}
        </div>
      )}

      <div className="cv-card bg-cv-surface border border-cv-border p-4">
        <div className="flex items-start gap-3">
          <KeyRound size={17} className="mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold">Password ownership</h3>
            <p className="text-sm opacity-70 mt-1">Admin can generate the initial one-time password only. After the student changes it, the admin cannot view, reset, or change that password.</p>
          </div>
        </div>
      </div>

      {showProvision && (
        <div className="fixed inset-0 z-[1000] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 max-sm:items-end max-sm:p-0" onMouseDown={(e) => e.target === e.currentTarget && setShowProvision(false)}>
          <div className="w-full max-w-lg bg-cv-surface border border-cv-border rounded-3xl p-5 sm:p-6 shadow-2xl max-sm:rounded-t-3xl max-sm:rounded-b-none">
            <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 font-semibold text-lg"><Sparkles size={18}/> Provision accounts</div><p className="text-xs opacity-60 mt-1">Choose a role and quantity. The system uses the next available fixed pilot usernames.</p></div><button className="p-2 rounded-xl border border-cv-border" onClick={() => setShowProvision(false)}><X size={17}/></button></div>
            <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-2 mt-5">
              {[['student','Students'],['employee','Employees'],['admin','Admins']].map(([r,label]) => <button key={r} onClick={() => setProvisionRole(r)} className={`text-left p-3 rounded-2xl border transition ${provisionRole===r ? 'border-cv-primary bg-cv-primary-soft' : 'border-cv-border bg-cv-surface'}`}><div className="font-semibold text-sm">{label}</div><div className="text-[10px] opacity-60 mt-1">{r}01, {r}02…</div></button>)}
            </div>
            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3 mt-4"><label className="text-xs font-medium">Number of accounts<input type="number" min="1" max="100" value={provisionCount} onChange={(e) => setProvisionCount(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-cv-border bg-transparent px-3 outline-none"/></label><label className="text-xs font-medium">Starting roll no.<input type="number" min="1" value={startRollNumber} onChange={(e) => setStartRollNumber(e.target.value)} className="mt-1 w-full h-11 rounded-xl border border-cv-border bg-transparent px-3 outline-none"/></label></div>
            <div className="mt-3 grid grid-cols-5 max-sm:grid-cols-2 gap-2">
              <input value={provisionProgram} onChange={(e) => setProvisionProgram(e.target.value)} placeholder="Program" className="h-10 rounded-xl border border-cv-border bg-transparent px-3 text-sm" />
              <input value={provisionCourse} onChange={(e) => setProvisionCourse(e.target.value)} placeholder="Course" className="h-10 rounded-xl border border-cv-border bg-transparent px-3 text-sm" />
              <input value={provisionSemester} onChange={(e) => setProvisionSemester(e.target.value)} placeholder="Semester" className="h-10 rounded-xl border border-cv-border bg-transparent px-3 text-sm" />
              <input value={provisionSection} onChange={(e) => setProvisionSection(e.target.value)} placeholder="Section" className="h-10 rounded-xl border border-cv-border bg-transparent px-3 text-sm" />
              <input value={provisionBatch} onChange={(e) => setProvisionBatch(e.target.value)} placeholder="Batch" className="h-10 rounded-xl border border-cv-border bg-transparent px-3 text-sm" />
            </div>
            <div className="mt-3 rounded-xl bg-cv-surface-soft border border-cv-border px-3 py-2.5 text-xs opacity-70"><b>Category:</b> {provisionProgram} {provisionCourse} · Semester {provisionSemester} · Section {provisionSection} · Batch {provisionBatch} · Roll {startRollNumber}–{Number(startRollNumber || 1) + Number(provisionCount || 1) - 1}</div>
            <div className="mt-4 rounded-xl bg-cv-surface-soft border border-cv-border px-3 py-2.5 text-xs opacity-70">Preview: <b>{provisionRole}01</b> onward · max 100 per operation · temporary passwords shown once.</div>
            <div className="flex justify-end gap-2 mt-5 max-sm:sticky max-sm:bottom-0 max-sm:bg-cv-surface max-sm:pt-2"><button className="px-4 py-2.5 rounded-xl border border-cv-border" onClick={() => setShowProvision(false)}>Cancel</button><button className="px-4 py-2.5 rounded-xl bg-cv-primary text-white font-semibold" disabled={busy} onClick={provisionAccounts}>{busy ? 'Provisioning…' : 'Provision accounts'}</button></div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="cv-card bg-cv-surface border border-cv-border p-5">
          <div className="flex justify-between"><h3 className="font-semibold">Create Pilot Account</h3><p className="text-xs opacity-60 mt-1">Use a valid fixed username such as student11 or leave the generated username. The password is generated automatically.</p><button onClick={() => setShowCreate(false)}><X size={18}/></button></div>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <input className="border border-cv-border rounded-xl px-3 py-2 bg-transparent" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="student11" />
            <select className="border border-cv-border rounded-xl px-3 py-2 bg-transparent" value={role} onChange={(e) => setRole(e.target.value)}><option value="student">Student</option><option value="employee">Employee</option><option value="admin">Admin</option><option value="faculty">Faculty</option><option value="hod">HOD</option></select>
            <input className="border border-cv-border rounded-xl px-3 py-2 bg-transparent" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Display name (optional)" />
          </div>
          <div className="flex justify-end mt-4"><button className="px-4 py-2 rounded-xl bg-cv-primary text-white" disabled={busy || !username} onClick={() => createOne()}>Create & Generate Password</button></div>
        </div>
      )}

      <div className="cv-card bg-cv-surface border border-cv-border overflow-hidden">
        <div className="px-5 py-4 border-b border-cv-border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><div className="font-semibold">Accounts</div><div className="text-xs opacity-60 mt-1">{filteredUsers.length} of {users.length} accounts shown · auto-synced</div></div>
            <div className="text-xs opacity-60 inline-flex items-center gap-1.5"><ShieldCheck size={14}/> Passwords are owned by users</div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <label className="flex-1 flex items-center gap-2 border border-cv-border rounded-xl px-3 bg-cv-bg/30 min-h-[42px]"><Search size={15} className="opacity-50"/><input className="w-full bg-transparent outline-none text-sm" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search username, name or role" /></label>
            <select className="border border-cv-border rounded-xl px-3 min-h-[42px] bg-cv-surface" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}><option value="all">All roles</option><option value="student">Students</option><option value="employee">Employees</option><option value="admin">Admins</option></select>
            <select className="border border-cv-border rounded-xl px-3 min-h-[42px] bg-cv-surface" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value="all">All categories</option>{categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}</select>
          </div>
        </div>
        {loading ? <div className="p-6 opacity-70">Loading users…</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left opacity-60"><th className="p-3">Username</th><th className="p-3">Role</th><th className="p-3">Category</th><th className="p-3">Status</th><th className="p-3">Password</th><th className="p-3">Control</th></tr></thead><tbody>{filteredUsers.map((u) => <tr key={u._id} className="border-t border-cv-border"><td className="p-3 font-medium">{u.username}</td><td className="p-3 capitalize">{u.role}</td><td className="p-3 text-xs">{u.category?.name || "Uncategorized"}{u.rollNumber ? ` · #${u.rollNumber}` : ""}</td><td className="p-3">{u.active === false ? "Disabled" : u.mustChangePassword ? "Must change" : "Active"}</td><td className="p-3 opacity-60">Never shown</td><td className="p-3 text-xs opacity-70">Password owned by user</td></tr>)}</tbody></table></div>}
      </div>
    </div>
  );
}
