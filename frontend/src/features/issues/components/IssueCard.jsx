import {
  ChevronUp,
  ChevronDown,
  Flag,
  Trash2,
  MessageCircle,
  Building2,
  UserRound,
  Clock3,
  Check,
} from "lucide-react";
import { useState } from "react";

const timeAgo = (ts) => {
  if (!ts) return "just now";
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const CATEGORY_COLORS = {
  General: "bg-cv-category-purple-soft text-cv-category-purple border-cv-category-purple/20",
  Hostel: "bg-cv-category-green-soft text-cv-category-green border-cv-category-green/20",
  Academics: "bg-cv-category-blue-soft text-cv-category-blue border-cv-category-blue/20",
  Faculty: "bg-cv-category-pink-soft text-cv-category-pink border-cv-category-pink/20",
  Food: "bg-cv-category-amber-soft text-cv-category-amber border-cv-category-amber/20",
};

const STATUS_STYLES = {
  created: "bg-cv-warning-soft text-cv-warning border-cv-warning/20",
  viewed: "bg-cv-info-soft text-cv-info border-cv-info/20",
  pending: "bg-cv-warning-soft text-cv-warning border-cv-warning/20",
  approved: "bg-cv-info-soft text-cv-info border-cv-info/20",
  assigned: "bg-cv-info-soft text-cv-info border-cv-info/20",
  accepted: "bg-cv-primary-soft text-cv-primary border-cv-primary/20",
  investigating: "bg-cv-warning-soft text-cv-warning border-cv-warning/20",
  resolved: "bg-cv-accent-soft text-cv-accent border-cv-accent/25",
  verified: "bg-cv-success-soft text-cv-success border-cv-success/20",
  closed: "bg-cv-surface-muted text-cv-text-muted border-cv-border",
  escalated: "bg-cv-danger-soft text-cv-danger border-cv-danger/20",
  rejected: "bg-cv-danger-soft text-cv-danger border-cv-danger/20",
};

const STATUS_LABELS = {
  created: "Created",
  viewed: "Viewed",
  pending: "Created",
  approved: "Viewed",
  assigned: "Assigned",
  accepted: "Accepted",
  investigating: "Investigating",
  resolved: "Resolved",
  verified: "Verified",
  closed: "Closed",
  escalated: "Escalated",
};

function StatusBadge({ status }) {
  if (!status) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status] || status.replace("_", " ")}
    </span>
  );
}

export default function IssueCard({ issue, onUpvote, onComment, onReply, voterId, isAdmin, onReport, onDelete }) {
  const [comment, setComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReply, setActiveReply] = useState(null);
  const [reported, setReported] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const id = issue.id ?? issue._id;
  const comments = issue.comments ?? [];
  const hasVoted = issue.voterIds?.includes(voterId);
  const category = issue.category || "General";
  const title = issue.title || issue.subject || "Campus Issue";
  const body = issue.title ? issue.text : null;

  const handleComment = () => {
    if (!comment.trim()) return;
    onComment(id, comment);
    setComment("");
    setShowComments(true);
  };
  const handleReply = (commentId) => {
    if (!replyText.trim()) return;
    onReply(id, commentId, replyText);
    setReplyText("");
    setActiveReply(null);
  };
  const handleReport = () => {
    if (reported) return;
    onReport(id);
    setReported(true);
  };

  return (
    <article className={`group overflow-hidden rounded-cv-lg border border-cv-border bg-cv-surface transition-all duration-200 ${expanded ? "shadow-cv-md" : "shadow-cv-xs hover:shadow-cv-sm"}`}>
      <div className="flex items-stretch">
        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUpvote(id); }} aria-label="Upvote issue"
          className={`flex w-[62px] shrink-0 flex-col items-center justify-center gap-0.5 border-r border-cv-border transition-colors ${hasVoted ? "bg-cv-primary text-cv-text-inverse" : "bg-cv-surface-soft text-cv-text-secondary hover:bg-cv-primary-soft hover:text-cv-primary"}`}>
          <ChevronUp className="h-5 w-5" />
          <span className="text-[15px] font-bold">{issue.votes ?? 0}</span>
          <span className={`text-[9px] uppercase tracking-[0.08em] ${hasVoted ? "text-white/80" : "text-cv-text-muted"}`}>votes</span>
        </button>

        <button type="button" onClick={() => setExpanded((v) => !v)} className="min-w-0 flex-1 px-4 py-4 text-left transition-colors hover:bg-cv-surface-soft sm:px-5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${CATEGORY_COLORS[category] || "bg-cv-surface-muted text-cv-text-muted border-cv-border"}`}>{category}</span>
            <StatusBadge status={issue.status} />
            <span className="ml-auto shrink-0">{expanded ? <ChevronDown className="h-4 w-4 text-cv-text-muted" /> : <ChevronDown className="h-4 w-4 -rotate-90 text-cv-text-subtle transition-transform group-hover:text-cv-primary" />}</span>
          </div>
          <h3 className="mt-2 text-[17px] font-semibold leading-snug text-cv-text">{title}</h3>
          {body && <p className="mt-1 text-[13px] leading-relaxed text-cv-text-secondary">{body}</p>}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-cv-text-muted">
            <span className="font-medium">{issue.anonymous ? "Anonymous" : issue.user ?? "Anonymous"}</span>
            <span className="text-cv-text-subtle">·</span><span>{timeAgo(issue.createdAt)}</span>
            {comments.length > 0 && <><span className="text-cv-text-subtle">·</span><span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{comments.length}</span></>}
          </div>
        </button>
      </div>

      {expanded && <div className="border-t border-cv-border px-4 pb-4 pt-3 sm:px-5">
        {issue.resolutionNote && <div className="rounded-cv-md border border-cv-info/20 bg-cv-info-soft px-3.5 py-3"><div className="flex items-center gap-2.5"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cv-info/10 text-cv-info"><Check className="h-4 w-4" /></div><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-cv-info">Resolution note</p></div><p className="pl-[37px] pt-1.5 text-[12px] leading-relaxed text-cv-info/90">{issue.resolutionNote}</p></div>}

        {issue.department && <div className="mt-3 grid grid-cols-1 overflow-hidden rounded-cv-md border border-cv-border-strong sm:grid-cols-2">
          <div className="border-b border-cv-border-strong bg-cv-surface-soft px-3.5 py-3 sm:border-b-0 sm:border-r"><div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-cv-primary" /><span className="text-[10px] font-semibold uppercase tracking-[0.11em] text-cv-text-muted">Department</span></div><p className="mt-1 truncate pl-[22px] text-[12px] font-medium text-cv-text">{issue.department}</p></div>
          <div className="bg-cv-surface px-3.5 py-3"><div className="flex items-center gap-2"><UserRound className="h-3.5 w-3.5 text-cv-primary" /><span className="text-[10px] font-semibold uppercase tracking-[0.11em] text-cv-text-muted">Assigned to</span></div><p className="mt-1 truncate pl-[22px] text-[12px] font-medium text-cv-text">{issue.assignedTo?.name || issue.assignedTo?.username || "Unassigned"}</p></div>
        </div>}

        {issue.timeline?.length > 0 && <div className="mt-3 rounded-cv-md border border-cv-border-strong bg-cv-surface-soft px-3.5 py-3"><div className="mb-3 flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-cv-primary" /><h4 className="text-[10px] font-semibold uppercase tracking-[0.13em] text-cv-primary">Progress</h4></div><div className="flex items-start overflow-x-auto scrollbar-hide">{issue.timeline.map((step,index)=><div key={`${step.action}-${index}`} className="flex min-w-[105px] flex-1 items-start"><div className="flex w-[72px] shrink-0 flex-col items-center"><div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cv-success/30 bg-cv-success-soft text-cv-success"><Check className="h-3 w-3" /></div><p className="mt-1.5 w-full truncate text-center text-[11px] font-semibold leading-tight text-cv-text">{step.action}</p><p title={step.by} className="mt-0.5 w-full truncate text-center text-[10px] leading-tight text-cv-text-muted">{step.by}</p></div>{index < issue.timeline.length-1 && <div className="mt-[10px] h-px min-w-[25px] flex-1 bg-cv-border-strong" />}</div>)}</div></div>}

        {comments.length > 0 && <button type="button" onClick={() => setShowComments((v)=>!v)} className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-cv-text-secondary transition-colors hover:text-cv-primary"><ChevronDown className={`h-3.5 w-3.5 transition-transform ${showComments ? "rotate-180" : ""}`} />{showComments ? "Hide" : "Show"} {comments.length} comment{comments.length !== 1 ? "s" : ""}</button>}

        {showComments && <div className="mt-2.5 space-y-2">{comments.map((c)=><div key={c.id} className="rounded-cv-md border border-cv-border-strong bg-cv-surface-soft p-3"><p className="mb-1 text-[10px] font-semibold text-cv-text-muted">{c.anonymous ? "Anonymous" : c.user ?? "Anonymous"}</p><p className="break-words text-[12px] leading-relaxed text-cv-text-secondary">{c.text}</p>{c.replies?.length > 0 && <div className="ml-3 mt-2.5 space-y-2 border-l-2 border-cv-primary/20 pl-3">{c.replies.map((r)=><div key={r.id}><p className="text-[10px] font-medium text-cv-text-muted">{r.anonymous ? "Anonymous" : r.user ?? "Anonymous"}</p><p className="mt-0.5 text-[11px] leading-relaxed text-cv-text-secondary">{r.text}</p></div>)}</div>}<button type="button" onClick={()=>setActiveReply(activeReply===c.id?null:c.id)} className="mt-2 text-[11px] font-medium text-cv-primary hover:text-cv-primary-hover">{activeReply===c.id?"Cancel":"↩ Reply"}</button>{activeReply===c.id&&<div className="mt-2 flex gap-2"><input value={replyText} onChange={(e)=>setReplyText(e.target.value)} placeholder="Write a reply…" className="min-w-0 flex-1 rounded-cv-sm border border-cv-border-strong bg-cv-surface px-3 py-2 text-[11px] text-cv-text outline-none placeholder:text-cv-text-muted focus:border-cv-primary/40 focus:ring-2 focus:ring-cv-primary/10"/><button type="button" onClick={()=>handleReply(c.id)} className="shrink-0 rounded-cv-sm bg-cv-primary px-3 py-2 text-[11px] font-medium text-cv-text-inverse hover:bg-cv-primary-hover">Send</button></div>}</div>)}</div>}

        <div className="mt-3 flex gap-2"><input value={comment} onChange={(e)=>setComment(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&handleComment()} placeholder="Add a comment…" className="min-w-0 flex-1 rounded-cv-sm border border-cv-border-strong bg-cv-surface px-3 py-2.5 text-[11px] text-cv-text outline-none placeholder:text-cv-text-muted focus:border-cv-primary/40 focus:ring-2 focus:ring-cv-primary/10"/><button type="button" onClick={handleComment} disabled={!comment.trim()} className="shrink-0 rounded-cv-sm bg-cv-accent px-3.5 py-2.5 text-[11px] font-semibold text-cv-text-inverse transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35">Send</button></div>

        <div className="mt-3 flex items-center border-t border-cv-divider pt-2.5">{isAdmin&&<button type="button" onClick={()=>onDelete(id)} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-cv-text-muted transition-colors hover:text-cv-danger"><Trash2 className="h-3.5 w-3.5" />Delete</button>}<button type="button" onClick={handleReport} disabled={reported} className={`ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors ${reported?"text-cv-danger/70":"text-cv-text-muted hover:text-cv-danger"}`}><Flag className="h-3.5 w-3.5" />{reported?"Reported":"Report"}</button></div>
      </div>}
    </article>
  );
}
