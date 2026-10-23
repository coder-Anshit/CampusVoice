import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Loader2, Wrench } from "lucide-react";
import { toast } from "sonner";
import client from "../services/client.js";
import { MobileBadge, MobileButton, MobileCard, MobileEmptyState, MobileSection } from "./primitives/index.js";

export default function MobileEmployeeTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [resolutionTask, setResolutionTask] = useState(null);
  const [note, setNote] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await client.get("/tasks/my");
      setTasks(Array.isArray(res.data) ? res.data : []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const action = async (task, name) => {
    try {
      setBusy(`${task._id}-${name}`);
      const endpoint = name === "investigate" ? "start" : name;
      await client.patch(`/tasks/${task._id}/${endpoint}`);
      await load();
      toast.success(name === "investigate" ? "Investigation started." : "Workflow updated.");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Unable to update workflow.");
    } finally {
      setBusy(null);
    }
  };

  const resolve = async () => {
    if (!resolutionTask || !note.trim()) return;
    try { setBusy(`${resolutionTask._id}-resolve`); await client.patch(`/tasks/${resolutionTask._id}/resolve`, { resolutionNote: note.trim() }); setResolutionTask(null); setNote(""); await load(); }
    finally { setBusy(null); }
  };

  return <div className="space-y-4">
    <section className="rounded-[22px] border border-cv-primary-border bg-cv-primary p-4 text-white shadow-cv-sm">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/70">Operational workspace</p>
      <h1 className="mt-1 text-xl font-bold">My Work</h1>
      <p className="mt-1 text-xs leading-5 text-white/75">Accept, investigate and resolve work assigned to you.</p>
    </section>
    <MobileSection title="Assigned work" description="Your workflow actions are separate from administrative issue intake.">
      {loading ? <MobileCard><div className="flex items-center gap-2 text-sm text-cv-text-muted"><Loader2 className="animate-spin" size={16}/> Loading work…</div></MobileCard> : !tasks.length ? <MobileEmptyState icon={<CheckCircle2 className="h-5 w-5"/>} title="You're all caught up" description="No work is assigned to you right now."/> : <div className="space-y-2">{tasks.map(task => { const status=String(task.status||"pending").toLowerCase(); return <MobileCard key={task._id} padding="md"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] uppercase tracking-wider text-cv-text-muted">{task.department||"Assigned issue"}</p><h3 className="mt-1 text-sm font-bold text-cv-text">{task.title||task.issueTitle||"Assigned grievance"}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-cv-text-secondary">{task.description||task.text||"Open the assigned work for details."}</p></div><MobileBadge>{status}</MobileBadge></div><div className="mt-3 flex flex-wrap gap-2">{status==="pending"&&<MobileButton size="sm" onClick={()=>action(task,"accept")} disabled={busy}><ClipboardList size={14}/> Accept</MobileButton>}{status==="accepted"&&<MobileButton size="sm" onClick={()=>action(task,"investigate")} disabled={busy}><Wrench size={14}/> Investigate</MobileButton>}{status==="investigating"&&<MobileButton size="sm" onClick={()=>setResolutionTask(task)} disabled={busy}><CheckCircle2 size={14}/> Resolve</MobileButton>}</div></MobileCard>; })}</div>}
    </MobileSection>
    {resolutionTask&&<div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm"><div className="w-full max-w-xl rounded-[24px] border border-cv-border bg-cv-surface p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-2xl"><h2 className="text-base font-bold text-cv-text">Resolution note</h2><p className="mt-1 text-xs text-cv-text-muted">Describe what was done before completing the task.</p><textarea value={note} onChange={e=>setNote(e.target.value)} rows={5} className="mt-3 w-full rounded-2xl border border-cv-border bg-cv-bg p-3 text-sm outline-none" placeholder="Resolution details…"/><div className="mt-3 flex justify-end gap-2"><MobileButton variant="secondary" size="sm" onClick={()=>{setResolutionTask(null);setNote("")}}>Cancel</MobileButton><MobileButton size="sm" onClick={resolve} disabled={!note.trim()||Boolean(busy)}>Resolve</MobileButton></div></div></div>}
  </div>;
}
