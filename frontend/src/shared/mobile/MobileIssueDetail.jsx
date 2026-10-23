import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, MapPin, MessageCircle, Send, ShieldAlert, ThumbsUp, UserRound } from "lucide-react";
import { MobileBadge, MobileButton, MobileCard, MobileEmptyState, MobileSection, MobileStatus } from "./primitives/index.js";

const FLOW = ["created", "viewed", "assigned", "accepted", "investigating", "resolved", "verified", "closed"];
const LABELS = { created: "Created", viewed: "Viewed", assigned: "Assigned", accepted: "Accepted", investigating: "Being worked on", resolved: "Resolved", verified: "Verified", closed: "Closed" };

function dateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}
function titleOf(issue) { return issue?.title || issue?.text || "Untitled issue"; }
function departmentOf(issue) { const v = issue?.department; return v && typeof v === "object" ? v.name || v.departmentName || v.department || "" : v || ""; }

export default function MobileIssueDetail({ issue, onBack, onUpvote, onComment, onReport, onVerify, voterId }) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const status = String(issue?.status || "created").toLowerCase();
  const currentIndex = status === "escalated" ? FLOW.indexOf("resolved") : Math.max(0, FLOW.indexOf(status));
  const comments = Array.isArray(issue?.comments) ? issue.comments : [];
  const assigned = issue?.assignedTo?.name || issue?.assignedTo?.username;
  const events = useMemo(() => Array.isArray(issue?.workflowHistory) ? issue.workflowHistory : (Array.isArray(issue?.history) ? issue.history : []), [issue]);

  if (!issue) return <MobileEmptyState title="Issue not found" description="The issue could not be opened." />;

  const submitComment = async () => {
    if (!comment.trim() || busy) return;
    setBusy(true);
    try { await onComment?.(issue._id || issue.id, comment.trim()); setComment(""); } finally { setBusy(false); }
  };

  const verify = async (action) => {
    if (busy) return;
    setBusy(true);
    try { await onVerify?.(issue._id || issue.id, action); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-cv-text-secondary"><ArrowLeft className="h-4 w-4" /> Back to issues</button>

      <MobileCard padding="md">
        <div className="flex flex-wrap items-center gap-2"><MobileStatus status={status} /><MobileBadge tone="neutral">{issue.category || "Campus"}</MobileBadge></div>
        <h1 className="mt-3 text-xl font-extrabold tracking-[-0.03em] text-cv-text">{titleOf(issue)}</h1>
        {issue.text && issue.text !== issue.title && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-cv-text-secondary">{issue.text}</p>}
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-cv-text-muted">
          <div className="rounded-cv-md bg-cv-surface-soft p-3"><span className="block text-[9px] font-bold uppercase tracking-wider">Submitted</span><span className="mt-1 block font-semibold text-cv-text">{dateTime(issue.createdAt) || "—"}</span></div>
          <div className="rounded-cv-md bg-cv-surface-soft p-3"><span className="block text-[9px] font-bold uppercase tracking-wider">Location / Dept.</span><span className="mt-1 block truncate font-semibold text-cv-text">{departmentOf(issue) || "—"}</span></div>
        </div>
      </MobileCard>

      <MobileSection title="Track progress" subtitle="Your grievance moves through these workflow stages">
        <MobileCard padding="md">
          <div className="space-y-0">
            {FLOW.map((step, index) => {
              const reached = index <= currentIndex;
              const current = index === currentIndex;
              return <div key={step} className="flex gap-3">
                <div className="flex flex-col items-center"><div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full ${reached ? "bg-cv-primary text-cv-text-inverse" : "bg-cv-surface-muted text-cv-text-muted"}`}>{reached ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-3.5 w-3.5" />}</div>{index < FLOW.length - 1 && <div className={`my-1 min-h-7 w-px ${index < currentIndex ? "bg-cv-primary" : "bg-cv-border"}`} />}</div>
                <div className={`pb-5 ${current ? "text-cv-text" : "text-cv-text-muted"}`}><p className="text-xs font-bold">{LABELS[step]}</p>{current && <p className="mt-1 text-[10px] text-cv-text-muted">Current status</p>}</div>
              </div>;
            })}
          </div>
        </MobileCard>
      </MobileSection>

      <MobileSection title="Assignment & service" subtitle="Operational information when available">
        <div className="grid grid-cols-2 gap-3">
          <MobileCard padding="sm"><UserRound className="h-4 w-4 text-cv-primary" /><p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-cv-text-muted">Assigned to</p><p className="mt-1 truncate text-xs font-semibold text-cv-text">{assigned || "Not assigned yet"}</p></MobileCard>
          <MobileCard padding="sm"><Clock3 className="h-4 w-4 text-cv-primary" /><p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-cv-text-muted">Expected</p><p className="mt-1 text-xs font-semibold text-cv-text">{issue.expectedDays ? `${issue.expectedDays} days` : "Not specified"}</p></MobileCard>
        </div>
      </MobileSection>

      {events.length > 0 && <MobileSection title="Activity" subtitle="Recorded workflow updates"><MobileCard padding="md"><div className="space-y-4">{events.slice(-8).reverse().map((event, i) => <div key={event._id || `${event.time}-${i}`} className="border-b border-cv-divider pb-3 last:border-0 last:pb-0"><p className="text-xs font-semibold text-cv-text">{event.label || event.action || event.status || "Workflow updated"}</p><p className="mt-1 text-[10px] text-cv-text-muted">{event.by || event.actor || "System"}{event.time ? ` · ${dateTime(event.time)}` : ""}</p></div>)}</div></MobileCard></MobileSection>}

      <MobileSection title={`Comments (${comments.length})`}><MobileCard padding="sm"><div className="space-y-3">{comments.length ? comments.slice(-8).map((item, i) => <div key={item._id || i} className="rounded-cv-md bg-cv-surface-soft p-3"><p className="text-xs leading-5 text-cv-text">{item.text || item.comment || "Comment"}</p><p className="mt-2 text-[10px] text-cv-text-muted">{item.author || item.username || "Student"}{item.createdAt ? ` · ${dateTime(item.createdAt)}` : ""}</p></div>) : <p className="px-2 py-3 text-xs text-cv-text-muted">No comments yet.</p>}
          <div className="flex gap-2 border-t border-cv-divider pt-3"><input value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submitComment(); }} placeholder="Add a comment" className="min-h-11 min-w-0 flex-1 rounded-cv-md border border-cv-border bg-cv-surface px-3 text-sm text-cv-text outline-none" /><button type="button" disabled={!comment.trim() || busy} onClick={submitComment} className="cv-touch-target flex items-center justify-center rounded-cv-md bg-cv-primary text-cv-text-inverse disabled:opacity-50" aria-label="Send comment"><Send className="h-4 w-4" /></button></div>
        </div></MobileCard></MobileSection>

      <div className="grid grid-cols-2 gap-2 pb-2">
        {(() => {
          const hasVoted = (issue?.voterIds || []).map(String).includes(String(voterId || ""));
          return <MobileButton
            variant={hasVoted ? "primary" : "secondary"}
            onClick={() => onUpvote?.(issue._id || issue.id)}
            aria-pressed={hasVoted}
          >
            <ThumbsUp className="h-4 w-4" /> {hasVoted ? "Liked" : "Upvote"} · {issue.votes || 0}
          </MobileButton>;
        })()}
        <MobileButton variant="secondary" onClick={() => onReport?.(issue._id || issue.id)}><ShieldAlert className="h-4 w-4" /> Report</MobileButton>
      </div>
      {status === "resolved" && (
        <div className="space-y-2 pb-2">
          <MobileButton fullWidth onClick={() => verify("close")} disabled={busy}><CheckCircle2 className="h-4 w-4" /> Yes, close grievance</MobileButton>
          <MobileButton fullWidth variant="secondary" onClick={() => verify("escalate")} disabled={busy}><ShieldAlert className="h-4 w-4" /> Not satisfied — escalate</MobileButton>
        </div>
      )}
    </div>
  );
}
