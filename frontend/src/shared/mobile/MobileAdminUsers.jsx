import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, KeyRound, Plus, Search, ShieldCheck, Sparkles, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { fetchUsers, createPilotUser, provisionUsers } from "../services/users.service.js";
import { MobileBadge, MobileButton, MobileCard, MobileEmptyState, MobileSection, MobileSkeleton } from "./primitives/index.js";

const ROLE_LABELS = { student: "Student", employee: "Employee", admin: "Admin", hod: "Department Head", faculty: "Faculty" };
const TEMPLATES = {
  student: Array.from({ length: 10 }, (_, i) => ({ username: `student${String(i + 1).padStart(2, "0")}`, role: "student" })),
  employee: Array.from({ length: 5 }, (_, i) => ({ username: `employee${String(i + 1).padStart(2, "0")}`, role: "employee" })),
  admin: [{ username: "admin01", role: "admin" }, { username: "admin02", role: "admin" }],
};

function roleLabel(role) { return ROLE_LABELS[String(role || "").toLowerCase()] || role || "User"; }

function UserRow({ user }) {
  const initials = String(user?.fullName || user?.username || "U").trim().slice(0, 1).toUpperCase();
  return (
    <MobileCard padding="sm" className="!rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cv-primary-soft text-sm font-bold text-cv-primary">{initials}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-cv-text">{user?.fullName || user?.username || "Unnamed user"}</p>
          <p className="truncate text-xs text-cv-text-muted">@{user?.username || "—"}{user?.category?.name ? ` · ${user.category.name}` : ""}{user?.rollNumber ? ` · #${user.rollNumber}` : ""}</p>
        </div>
        <MobileBadge tone={String(user?.role).toLowerCase() === "admin" ? "warning" : "neutral"}>{roleLabel(user?.role)}</MobileBadge>
      </div>
    </MobileCard>
  );
}

export default function MobileAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [username, setUsername] = useState("student01");
  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [provisionRole, setProvisionRole] = useState("student");
  const [provisionCount, setProvisionCount] = useState(5);
  const [credential, setCredential] = useState(null);
  const [program, setProgram] = useState("B.Tech");
  const [course, setCourse] = useState("CSE");
  const [semester, setSemester] = useState("7");
  const [section, setSection] = useState("A");
  const [batch, setBatch] = useState("2027");
  const [startRollNumber, setStartRollNumber] = useState(1);

  const load = useCallback(async () => {
    try { setLoading(true); const data = await fetchUsers(); setUsers(Array.isArray(data) ? data : data?.users || []); }
    catch (e) { toast.error(e?.response?.data?.error || "Unable to load users"); setUsers([]); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const existing = useMemo(() => new Set(users.map(u => u.username)), [users]);
  const filtered = useMemo(() => users.filter(u => {
    const q = query.trim().toLowerCase();
    const matchQ = !q || [u.username, u.fullName, u.email, u.role].filter(Boolean).join(" ").toLowerCase().includes(q);
    return matchQ && (roleFilter === "all" || String(u.role).toLowerCase() === roleFilter);
  }), [users, query, roleFilter]);

  const createOne = async () => {
    try {
      setBusy(true);
      const data = await createPilotUser({ username, role, fullName, temporaryPassword, category: { program, course, semester, section, batch } });
      setCredential({ user: data.user, temporaryPassword: data.temporaryPassword });
      setCreateOpen(false); await load(); toast.success(`Created ${data.user.username}`);
    } catch (e) { toast.error(e?.response?.data?.error || "Unable to create account"); }
    finally { setBusy(false); }
  };

  const provision = async () => {
    const count = Math.min(100, Math.max(1, Number(provisionCount) || 1));
    try {
      setBusy(true);
      const data = await provisionUsers(provisionRole, count, {
        program, course, semester, section, batch,
        startRollNumber: Number(startRollNumber) || 1,
      });
      setCredential({ bulk: true, accounts: Array.isArray(data.accounts) ? data.accounts : [] });
      setProvisionOpen(false);
      await load();
      toast.success(`Provisioned ${data.created || 0} account${Number(data.created) === 1 ? "" : "s"}`);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Unable to provision accounts");
    } finally { setBusy(false); }
  };

  const copy = async (value) => { try { await navigator.clipboard.writeText(value); toast.success("Copied"); } catch { toast.error("Copy failed"); } };

  return (
    <div className="space-y-4">
      <MobileSection title="Users" description="Manage campus accounts and access roles." />

      <div className="grid grid-cols-2 gap-2">
        <MobileButton icon={UserPlus} onClick={() => setCreateOpen(true)}>Create user</MobileButton>
        <MobileButton variant="secondary" icon={Sparkles} onClick={() => setProvisionOpen(true)}>Provision</MobileButton>
      </div>

      {credential && <MobileCard padding="sm" className="border-cv-success-border bg-cv-success-soft/40">
        <div className="flex items-start justify-between gap-3"><div><p className="flex items-center gap-2 text-sm font-bold text-cv-text"><KeyRound size={15}/> Temporary credentials</p><p className="mt-1 text-[11px] text-cv-text-muted">Copy these once and share privately.</p></div><button onClick={() => setCredential(null)} aria-label="Close"><X size={17}/></button></div>
        {credential.bulk ? <div className="mt-3 space-y-2">{credential.accounts.map(a => <div key={a.username} className="flex items-center justify-between gap-2 rounded-xl border border-cv-border bg-cv-surface px-3 py-2 text-xs"><span className="font-semibold">{a.username}</span><button disabled={!!a.error} onClick={() => copy(`${a.username}\t${a.temporaryPassword}`)} className="font-mono text-cv-primary">{a.error || a.temporaryPassword} <Copy size={12} className="ml-1 inline"/></button></div>)}</div> : <div className="mt-3 flex items-center gap-2 rounded-xl bg-cv-surface px-3 py-2 text-xs"><span className="font-semibold">{credential.user?.username}</span><span className="font-mono flex-1">{credential.temporaryPassword}</span><button onClick={() => copy(`${credential.user?.username}\t${credential.temporaryPassword}`)}><Copy size={14}/></button></div>}
      </MobileCard>}

      <div className="flex items-center gap-2 rounded-2xl border border-cv-border bg-cv-surface px-3">
        <Search size={16} className="shrink-0 text-cv-text-muted"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search users" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none text-cv-text"/>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">{["all","student","employee","admin"].map(r => <button key={r} onClick={() => setRoleFilter(r)} className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-bold ${roleFilter===r ? "border-cv-primary bg-cv-primary text-white" : "border-cv-border bg-cv-surface text-cv-text-muted"}`}>{r === "all" ? "All" : roleLabel(r)}</button>)}</div>

      {loading ? <div className="space-y-2"><MobileSkeleton/><MobileSkeleton/><MobileSkeleton/></div> : filtered.length ? <div className="space-y-2">{filtered.map(u => <UserRow key={u._id || u.id || u.username} user={u}/>)}</div> : <MobileEmptyState icon={<Users className="h-6 w-6"/>} title="No users found" message="Try a different search or role filter."/>}

      {(createOpen || provisionOpen) && <div className="fixed inset-0 z-[1100] flex items-end bg-black/45 backdrop-blur-sm" onMouseDown={e => e.target === e.currentTarget && (createOpen ? setCreateOpen(false) : setProvisionOpen(false))}>
        <div className="w-full max-h-[88dvh] overflow-y-auto rounded-t-3xl border border-cv-border bg-cv-surface p-5 shadow-2xl">
          <div className="mb-5 flex items-center justify-between"><div><h3 className="text-lg font-bold text-cv-text">{createOpen ? "Create user" : "Provision accounts"}</h3><p className="mt-1 text-xs text-cv-text-muted">{createOpen ? "Create one admin-controlled campus account." : "Generate the next available pilot accounts."}</p></div><button onClick={() => createOpen ? setCreateOpen(false) : setProvisionOpen(false)}><X size={20}/></button></div>
          {createOpen ? <div className="space-y-3"><label className="block text-xs font-semibold">Username<input value={username} onChange={e=>setUsername(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-cv-border bg-transparent px-3 text-sm outline-none"/></label><label className="block text-xs font-semibold">Full name<input value={fullName} onChange={e=>setFullName(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-cv-border bg-transparent px-3 text-sm outline-none"/></label><label className="block text-xs font-semibold">Role<select value={role} onChange={e=>setRole(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-cv-border bg-transparent px-3 text-sm outline-none"><option value="student">Student</option><option value="employee">Employee</option><option value="admin">Admin</option></select></label><label className="block text-xs font-semibold">Temporary password (optional)<input value={temporaryPassword} onChange={e=>setTemporaryPassword(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-cv-border bg-transparent px-3 text-sm outline-none"/></label><MobileButton className="w-full" disabled={busy} onClick={createOne}>{busy ? "Creating…" : "Create user"}</MobileButton></div> : <div className="space-y-4"><div className="grid grid-cols-3 gap-2">{Object.keys(TEMPLATES).map(r=><button key={r} onClick={()=>setProvisionRole(r)} className={`rounded-2xl border p-3 text-left ${provisionRole===r ? "border-cv-primary bg-cv-primary-soft" : "border-cv-border"}`}><span className="block text-xs font-bold">{roleLabel(r)}s</span><span className="mt-1 block text-[10px] text-cv-text-muted">category-aware</span></button>)}</div><div className="grid grid-cols-2 gap-2"><label className="text-xs font-semibold">Accounts<input type="number" min="1" max="100" value={provisionCount} onChange={e=>setProvisionCount(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-cv-border bg-transparent px-3 text-sm outline-none"/></label><label className="text-xs font-semibold">Starting roll<input type="number" min="1" value={startRollNumber} onChange={e=>setStartRollNumber(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-cv-border bg-transparent px-3 text-sm outline-none"/></label></div><div className="grid grid-cols-2 gap-2"><input value={program} onChange={e=>setProgram(e.target.value)} placeholder="Program" className="h-10 rounded-xl border border-cv-border bg-transparent px-3 text-sm"/><input value={course} onChange={e=>setCourse(e.target.value)} placeholder="Course" className="h-10 rounded-xl border border-cv-border bg-transparent px-3 text-sm"/><input value={semester} onChange={e=>setSemester(e.target.value)} placeholder="Semester" className="h-10 rounded-xl border border-cv-border bg-transparent px-3 text-sm"/><input value={section} onChange={e=>setSection(e.target.value)} placeholder="Section" className="h-10 rounded-xl border border-cv-border bg-transparent px-3 text-sm"/><input value={batch} onChange={e=>setBatch(e.target.value)} placeholder="Batch" className="h-10 rounded-xl border border-cv-border bg-transparent px-3 text-sm"/></div><div className="rounded-xl border border-cv-border bg-cv-surface-soft px-3 py-2 text-[11px] text-cv-text-muted">{program} {course} · Sem {semester} · Sec {section} · Batch {batch} · Roll {startRollNumber}–{Number(startRollNumber||1)+Math.min(100, Math.max(1, Number(provisionCount)||1))-1}</div><MobileButton className="w-full" disabled={busy} onClick={provision}>{busy ? "Provisioning…" : "Provision accounts"}</MobileButton></div>}
        </div>
      </div>}
    </div>
  );
}
