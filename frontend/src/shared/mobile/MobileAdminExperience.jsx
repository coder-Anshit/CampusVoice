import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, ChevronRight, ClipboardList, Clock3, Filter, ListChecks, MessageSquare, Search, ShieldCheck, Megaphone, TrendingUp, Users } from "lucide-react";
import { toast } from "sonner";
import MobileCard from "./primitives/MobileCard.jsx";
import MobileSection from "./primitives/MobileSection.jsx";
import MobileBadge from "./primitives/MobileBadge.jsx";
import MobileStatus from "./primitives/MobileStatus.jsx";
import MobileButton from "./primitives/MobileButton.jsx";
import { updateIssueStatus } from "../services/issues.service.js";
import MobilePolls from "./MobilePolls.jsx";
import { StatsPanel } from "../../features/admin/components/AdminAnalytics.jsx";
import WorkflowAssignmentModal from "../../features/workflow/components/WorkflowAssignmentModal.jsx";

const STATUS_LABELS = {
  created: "New", viewed: "Viewed", assigned: "Assigned", accepted: "Accepted",
  investigating: "Investigating", resolved: "Resolved", verified: "Verified",
  escalated: "Escalated", closed: "Closed",
};

const STATUS_ORDER = ["all", "created", "viewed", "assigned", "accepted", "investigating", "resolved", "verified", "escalated", "closed"];

function idOf(item) { return item?._id || item?.id; }
function titleOf(item) { return item?.title || item?.subject || "Untitled issue"; }
function ageHours(item) {
  const date = new Date(item?.createdAt || item?.updatedAt || Date.now()).getTime();
  return Math.max(0, (Date.now() - date) / 3600000);
}
function isAttention(item) {
  return ["created", "escalated"].includes(String(item?.status || "").toLowerCase()) || String(item?.priority || "").toLowerCase() === "high" || ageHours(item) >= 72;
}

function Metric({ icon, label, value, tone = "default" }) {
  return (
    <MobileCard className={`min-w-0 ${tone === "danger" ? "border-cv-danger-border" : ""}`} padding="sm">
      <div className="flex items-center gap-2 text-cv-text-muted">{icon}<span className="text-[11px] font-semibold">{label}</span></div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-cv-text">{value}</p>
    </MobileCard>
  );
}

function IssueRow({ issue, onOpen }) {
  const priority = String(issue?.priority || "medium").toLowerCase();
  return (
    <button type="button" onClick={() => onOpen(issue)} className="w-full text-left cv-touch-target">
      <MobileCard interactive padding="sm" className="mb-2">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-cv-text line-clamp-2">{titleOf(issue)}</p>
              {priority === "high" && <MobileBadge tone="danger">High</MobileBadge>}
            </div>
            <p className="mt-1 text-xs text-cv-text-secondary line-clamp-2">{issue?.text || "No description available."}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <MobileStatus status={issue?.status} />
              {issue?.category && <span className="text-[11px] text-cv-text-muted">{issue.category}</span>}
            </div>
          </div>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-cv-text-muted" />
        </div>
      </MobileCard>
    </button>
  );
}

function Detail({ issue, onBack, onRefresh, onOpenWorkflow, canManageWorkflow = true }) {
  const [busy, setBusy] = useState(false);
  const status = String(issue?.status || "created").toLowerCase();
  const id = idOf(issue);

  const act = async (label, fn) => {
    try { setBusy(true); await fn(); toast.success(label); await onRefresh?.(); }
    catch (e) { toast.error(e?.response?.data?.error || `Unable to ${label.toLowerCase()}.`); }
    finally { setBusy(false); }
  };



  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="cv-touch-target text-sm font-semibold text-cv-primary">← Back to queue</button>
      <MobileCard padding="md">
        <div className="flex flex-wrap items-center gap-2"><MobileStatus status={status} />{issue?.priority && <MobileBadge>{issue.priority} priority</MobileBadge>}</div>
        <h2 className="mt-3 text-xl font-bold tracking-tight text-cv-text">{titleOf(issue)}</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-cv-text-secondary">{issue?.text || "No description available."}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-cv-sm bg-cv-surface-soft p-3"><span className="text-cv-text-muted">Category</span><strong className="mt-1 block text-cv-text">{issue?.category || "—"}</strong></div>
          <div className="rounded-cv-sm bg-cv-surface-soft p-3"><span className="text-cv-text-muted">Created</span><strong className="mt-1 block text-cv-text">{issue?.createdAt ? new Date(issue.createdAt).toLocaleDateString() : "—"}</strong></div>
        </div>
      </MobileCard>

      <MobileSection title="Administrative actions">
        <div className="grid grid-cols-2 gap-2">
          {canManageWorkflow && ["created", "viewed", "assigned", "accepted", "investigating", "resolved", "verified", "escalated"].includes(status) && (
            <MobileButton variant={status === "created" ? "primary" : "secondary"} onClick={() => onOpenWorkflow?.(issue)} icon={<ListChecks size={16} />}>
              Manage workflow
            </MobileButton>
          )}
          {status === "resolved" && <MobileCard padding="sm" className="col-span-2"><p className="text-xs font-semibold text-cv-text">Waiting for student verification</p><p className="mt-1 text-[11px] text-cv-text-secondary">The submitting student must confirm satisfaction or escalate the grievance.</p></MobileCard>}
          {status === "verified" && <MobileCard padding="sm" className="col-span-2"><p className="text-xs font-semibold text-cv-text">Verified by student</p><p className="mt-1 text-[11px] text-cv-text-secondary">The student has verified the resolution. Closure is part of the student satisfaction flow.</p></MobileCard>}
          {canManageWorkflow && status === "escalated" && <MobileButton disabled={busy} onClick={() => act("Issue reopened for reassignment", () => updateIssueStatus(id, "assigned"))}>Reassign for further handling</MobileButton>}
        </div>
        {busy && <p className="mt-2 text-xs text-cv-text-muted">Updating workflow…</p>}
      </MobileSection>
    </div>
  );
}

export default function MobileAdminExperience({ issues = [], polls = [], announcements = [], discussions = [], feedbackForms = [], loading = false, onRefresh, onPollsRefresh, onNavigate, role = "admin", activeTab = "overview", canManageUsers = role === "admin", mobilePollCreateOpen = false, onPollCreateConsumed }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [workflowIssue, setWorkflowIssue] = useState(null);

  const metrics = useMemo(() => {
    const list = Array.isArray(issues) ? issues : [];
    return {
      total: list.length,
      created: list.filter(x => ["created", "pending"].includes(x?.status)).length,
      attention: list.filter(isAttention).length,
      resolved: list.filter(x => ["resolved", "verified", "closed"].includes(x?.status)).length,
    };
  }, [issues]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (Array.isArray(issues) ? issues : []).filter(issue => {
      const matchesStatus = filter === "all" ? true : issue?.status === filter;
      const matchesQuery = !q || `${titleOf(issue)} ${issue?.text || ""} ${issue?.category || ""}`.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    }).sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
  }, [issues, filter, query]);

  if (activeTab === "community") {
    const items = [
      ["polls", "Polls", "Ask focused questions and review responses.", BarChart3],
      ["discussions", "Discussions", "Publish and moderate campus conversations.", MessageSquare],
      ["announcements", "Announcements", "Broadcast official campus updates.", Megaphone],
      ["feedback", "Feedback", "Create and review student feedback cycles.", ClipboardList],
    ];
    return (
      <div className="space-y-4">
        <section>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-cv-primary">Community</p>
          <h1 className="mt-1 text-[24px] font-extrabold tracking-[-0.035em] text-cv-text">Campus content</h1>
          <p className="mt-1 text-xs leading-5 text-cv-text-muted">Choose a section to review or publish content.</p>
        </section>
        <div className="grid grid-cols-2 gap-3">
          {items.map(([key, label, description, Icon]) => (
            <button key={key} type="button" onClick={() => onNavigate?.(key)} className="min-h-[126px] rounded-[20px] border border-cv-border bg-cv-surface p-4 text-left shadow-cv-xs transition-all active:scale-[0.99]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cv-primary-soft text-cv-primary"><Icon className="h-5 w-5" /></span>
              <span className="mt-3 block text-sm font-extrabold text-cv-text">{label}</span>
              <span className="mt-1 block text-[10px] leading-4 text-cv-text-muted">{description}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "polls") {
    return (
      <div className="space-y-4">
        <MobilePolls
          polls={polls}
          voterId={localStorage.getItem("username") || "admin"}
          loading={loading && polls.length === 0}
          onRefresh={onPollsRefresh}
          canCreate
          showCreateTrigger={false}
          initialCreateOpen={mobilePollCreateOpen}
          onCreateConsumed={onPollCreateConsumed}
        />
      </div>
    );
  }

  if (activeTab === "stats") {
    return (
      <div className="space-y-4">
        <StatsPanel issues={issues} polls={polls} />
      </div>
    );
  }

  if (selected) return <>
    <div className="pb-28">
      <Detail issue={selected} onBack={() => setSelected(null)} onRefresh={onRefresh} canManageWorkflow={canManageUsers} onOpenWorkflow={(issue) => setWorkflowIssue(issue)} />
    </div>
    <WorkflowAssignmentModal issue={workflowIssue} open={Boolean(workflowIssue)} onClose={() => { setWorkflowIssue(null); onRefresh?.(); }} />
  </>;

  const roleLabel = role === "admin" ? "Administrator" : role === "hod" ? "Department Head" : "Faculty / Staff";

  if (activeTab === "queue") {
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-cv-md border border-cv-border bg-cv-surface px-3">
            <Search size={16} className="text-cv-text-muted"/>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search queue" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none text-cv-text" aria-label="Search administrative queue"/>

          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STATUS_ORDER.map(key => <button key={key} type="button" onClick={() => setFilter(key)} className={`cv-touch-target shrink-0 rounded-full border px-3 text-[11px] font-semibold ${filter === key ? 'border-cv-text bg-cv-text text-cv-surface' : 'border-cv-border bg-cv-surface-soft text-cv-text-secondary'}`}>{key === 'all' ? 'All' : STATUS_LABELS[key]}</button>)}
          </div>
          {loading ? <MobileCard padding="md"><p className="text-sm text-cv-text-muted">Loading queue…</p></MobileCard> : filtered.length ? filtered.map(issue => <IssueRow key={idOf(issue)} issue={issue} onOpen={setSelected} />) : <MobileCard padding="md"><div className="flex items-center gap-3"><Filter size={18} className="text-cv-text-muted"/><p className="text-sm text-cv-text-secondary">No queue items match this filter.</p></div></MobileCard>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[22px] border border-cv-primary-border bg-cv-primary p-5 text-white shadow-cv-sm">
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -right-2 -bottom-10 h-24 w-24 rounded-full bg-white/5" />
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/70">Good to see you</p>
        <h1 className="mt-1 text-[24px] font-extrabold tracking-[-0.035em] text-white">Hi, {roleLabel} 👋</h1>
        <p className="mt-2 max-w-[32rem] text-xs leading-5 text-white/80">Stay informed, manage campus activity and keep institutional work moving from one workspace.</p>
      </section>

      <MobileSection title="Campus Pulse" subtitle="What's happening around campus">
        <div className="-mx-1 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex min-w-max gap-3 px-1">
            {[
              ["Active issues", metrics.total, "Track campus concerns", () => onNavigate?.("queue"), AlertTriangle],
              ["Live polls", polls.length, "Share your opinion", () => onNavigate?.("polls"), BarChart3],
              ["Discussions", discussions.length, "Join the conversation", () => onNavigate?.("discussions"), MessageSquare],
              ["Updates", announcements.length, "Latest campus news", () => onNavigate?.("announcements"), Megaphone],
            ].map(([label, value, text, handler, Icon]) => (
              <button key={label} type="button" onClick={handler} className="w-[150px] rounded-2xl border border-cv-border bg-cv-surface p-4 text-left shadow-cv-xs transition-all active:scale-[0.99]">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cv-primary-soft text-cv-primary"><Icon className="h-4 w-4" /></span>
                <p className="mt-3 text-xl font-extrabold tracking-tight text-cv-text">{value}</p>
                <p className="mt-0.5 text-xs font-bold text-cv-text">{label}</p>
                <p className="mt-1 text-[10px] leading-4 text-cv-text-muted">{text}</p>
              </button>
            ))}
          </div>
        </div>
      </MobileSection>

      <section aria-label="Community navigation" className="-mx-1 overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex min-w-max gap-2 px-1">
          {[
            ["polls", "Polls", BarChart3],
            ["discussions", "Discussions", MessageSquare],
            ["announcements", "Announcements", Megaphone],
            ["feedback", "Feedback", ClipboardList],
          ].map(([id, label, Icon]) => (
            <button key={id} type="button" onClick={() => onNavigate?.(id)} className="flex min-h-14 min-w-[112px] items-center justify-center gap-2 rounded-2xl border border-cv-border bg-cv-surface px-3 text-[11px] font-bold text-cv-text shadow-cv-xs active:scale-[0.98]">
              <Icon className="h-4 w-4 text-cv-primary" />{label}
            </button>
          ))}
        </div>
      </section>

      <MobileSection title="Campus polls" subtitle="Live questions students can vote on" action={<button type="button" onClick={() => onNavigate?.("polls")} className="text-xs font-bold text-cv-primary">See all</button>}>
        {polls.length ? (
          <div className="-mx-1 overflow-x-auto pb-1 scrollbar-hide"><div className="flex min-w-max gap-3 px-1">
            {polls.slice(0, 4).map((poll) => (
              <button key={idOf(poll)} type="button" onClick={() => onNavigate?.("polls")} className="w-[225px] rounded-2xl border border-cv-border bg-cv-surface p-4 text-left shadow-cv-xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cv-primary-soft text-cv-primary"><BarChart3 className="h-4 w-4" /></div>
                <h3 className="mt-3 line-clamp-2 text-sm font-bold text-cv-text">{poll.question || poll.title || "Campus poll"}</h3>
                <p className="mt-1 text-[10px] text-cv-text-muted">Tap to review responses</p>
              </button>
            ))}
          </div></div>
        ) : <MobileCard padding="md"><p className="text-xs text-cv-text-muted">No live polls right now.</p></MobileCard>}
      </MobileSection>

      <MobileSection title="Latest announcement" subtitle="The most recent institutional update" action={<button type="button" onClick={() => onNavigate?.("announcements")} className="text-xs font-bold text-cv-primary">See all</button>}>
        {announcements.length ? (
          <MobileCard interactive as="button" type="button" onClick={() => onNavigate?.("announcements")} className="w-full text-left">
            <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cv-primary-soft text-cv-primary"><Megaphone className="h-5 w-5" /></div><div className="min-w-0 flex-1"><h3 className="line-clamp-2 text-sm font-bold text-cv-text">{announcements[0].title || announcements[0].heading || "Campus announcement"}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-cv-text-secondary">{announcements[0].message || announcements[0].content || announcements[0].description || "Open for details."}</p></div></div>
          </MobileCard>
        ) : <MobileCard padding="md"><p className="text-xs text-cv-text-muted">No announcements yet.</p></MobileCard>}
      </MobileSection>

      <MobileSection title="Discussions" subtitle="Recent campus conversations" action={<button type="button" onClick={() => onNavigate?.("discussions")} className="text-xs font-bold text-cv-primary">See all</button>}>
        {discussions.length ? (
          <div className="space-y-3">
            {discussions.slice(0, 4).map((discussion) => (
              <MobileCard key={idOf(discussion)} interactive as="button" type="button" onClick={() => onNavigate?.("discussions")} className="w-full text-left" padding="sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cv-primary-soft text-cv-primary"><MessageSquare className="h-4 w-4" /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-bold text-cv-text">{discussion.title || discussion.question || discussion.text || "Campus discussion"}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-cv-text-secondary">{discussion.description || discussion.content || discussion.text || "Join the conversation."}</p>
                    <p className="mt-2 text-[10px] text-cv-text-muted">{discussion.category || "Campus"}</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-cv-text-muted" />
                </div>
              </MobileCard>
            ))}
          </div>
        ) : <MobileCard padding="md"><p className="text-xs text-cv-text-muted">No discussions yet.</p></MobileCard>}
      </MobileSection>

      <MobileSection title="Live feedback" subtitle="Feedback forms currently available" action={<button type="button" onClick={() => onNavigate?.("feedback")} className="text-xs font-bold text-cv-primary">See all</button>}>
        {feedbackForms.filter((form) => ["published", "active"].includes(String(form?.status || "").toLowerCase())).length ? (
          <div className="-mx-1 overflow-x-auto pb-1 scrollbar-hide"><div className="flex min-w-max gap-3 px-1">
            {feedbackForms.filter((form) => ["published", "active"].includes(String(form?.status || "").toLowerCase())).slice(0, 4).map((form) => (
              <button key={idOf(form)} type="button" onClick={() => onNavigate?.("feedback")} className="w-[225px] rounded-2xl border border-cv-border bg-cv-surface p-4 text-left shadow-cv-xs"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cv-primary-soft text-cv-primary"><ClipboardList className="h-4 w-4" /></span><MobileBadge tone="success">Live</MobileBadge></div><h3 className="mt-3 line-clamp-2 text-sm font-bold text-cv-text">{form.title || form.name || "Feedback form"}</h3><p className="mt-1 text-[10px] text-cv-text-muted">Review responses</p></button>
            ))}
          </div></div>
        ) : <MobileCard padding="md"><p className="text-xs text-cv-text-muted">No live feedback forms.</p></MobileCard>}
      </MobileSection>

      <MobileSection title="Issues" subtitle="Recent campus concerns" action={<button type="button" onClick={() => onNavigate?.("queue")} className="text-xs font-bold text-cv-primary">See all</button>}>
        {loading ? <MobileCard padding="md"><p className="text-sm text-cv-text-muted">Loading issues…</p></MobileCard> : issues.length ? (
          issues.slice().sort((a,b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)).slice(0, 4).map(issue => <IssueRow key={idOf(issue)} issue={issue} onOpen={setSelected} />)
        ) : <MobileCard padding="md"><div className="flex items-center gap-3"><CheckCircle2 className="text-cv-success" size={20}/><div><p className="text-sm font-bold text-cv-text">No issues yet</p><p className="text-xs text-cv-text-secondary">New campus concerns will appear here.</p></div></div></MobileCard>}
      </MobileSection>
    </div>
  );
}
