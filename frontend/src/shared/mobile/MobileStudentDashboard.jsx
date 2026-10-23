import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardList, Flag, ListChecks, MessageCircle } from "lucide-react";
import { fetchStudentFeedbackForms, fetchMyFeedbackResponse } from "../services/feedback.service.js";
import { MobileBadge, MobileCard, MobileEmptyState, MobileSection, MobileSkeleton, MobileStatus } from "./primitives/index.js";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function issueTitle(issue) {
  return issue?.title || issue?.text || "Untitled grievance";
}

export default function MobileStudentDashboard({
  username,
  issues = [],
  polls = [],
  discussions = [],
  loading = false,
  onOpenIssues,
  onOpenPolls,
  onOpenDiscussions,
}) {
  const [responses, setResponses] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  const loadFeedback = useCallback(async () => {
    try {
      setFeedbackLoading(true);
      const forms = await fetchStudentFeedbackForms();
      const safeForms = Array.isArray(forms) ? forms : [];
      const checks = await Promise.all(
        safeForms.map(async (form) => {
          try {
            const result = await fetchMyFeedbackResponse(form._id);
            return result?.submitted && result?.response ? { form, response: result.response } : null;
          } catch {
            return null;
          }
        })
      );
      setResponses(checks.filter(Boolean));
    } catch (error) {
      console.error("Failed to load mobile feedback summary:", error);
      setResponses([]);
    } finally {
      setFeedbackLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const active = useMemo(
    () => issues.filter((issue) => !["closed", "verified", "rejected"].includes(String(issue?.status || "").toLowerCase())),
    [issues]
  );

  const actions = useMemo(
    () => issues.filter((issue) => ["resolved", "escalated"].includes(String(issue?.status || "").toLowerCase())),
    [issues]
  );

  const firstName = String(username || "Student").split(/\s+/)[0];
  const myPolls = useMemo(() => polls.filter((poll) => String(poll?.createdBy || poll?.author || poll?.username || "").toLowerCase() === String(username || "").toLowerCase()), [polls, username]);
  const myDiscussions = useMemo(() => discussions.filter((discussion) => String(discussion?.author || discussion?.createdBy || discussion?.username || "").toLowerCase() === String(username || "").toLowerCase()), [discussions, username]);

  if (loading && !issues.length) {
    return (
      <div className="space-y-4" aria-label="Loading your dashboard">
        <MobileSkeleton variant="card" className="h-28" />
        <div className="grid grid-cols-2 gap-3">
          <MobileSkeleton variant="card" className="h-24" />
          <MobileSkeleton variant="card" className="h-24" />
        </div>
        <MobileSkeleton variant="card" className="h-40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cv-primary">Personal campus space</p>
        <h1 className="mt-1 text-[25px] font-extrabold tracking-[-0.035em] text-cv-text">My Dashboard</h1>
        <p className="mt-1 text-xs leading-5 text-cv-text-muted">Your grievances, feedback and actions in one place.</p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <MobileCard padding="md">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cv-primary-soft text-cv-primary"><Flag className="h-4 w-4" /></span>
            <span className="text-2xl font-extrabold text-cv-text">{issues.length}</span>
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-cv-text-muted">My grievances</p>
        </MobileCard>
        <MobileCard padding="md">
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cv-success-soft text-cv-success"><ClipboardList className="h-4 w-4" /></span>
            <span className="text-2xl font-extrabold text-cv-text">{responses.length}</span>
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-cv-text-muted">My responses</p>
        </MobileCard>
      </div>

      <MobileSection title="My grievances" subtitle="Track issues you have raised" action={<button type="button" onClick={onOpenIssues} className="text-xs font-bold text-cv-primary">See all</button>}>
        {active.length ? (
          <div className="space-y-3">
            {active.slice(0, 4).map((issue) => (
              <MobileCard key={issue._id || issue.id} padding="sm" interactive as="button" type="button" onClick={onOpenIssues} className="w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold text-cv-text">{issueTitle(issue)}</p>
                    <div className="mt-2 flex items-center gap-2"><MobileStatus status={issue.status} /><span className="text-[10px] text-cv-text-muted">{formatDate(issue.createdAt)}</span></div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-cv-text-muted" />
                </div>
              </MobileCard>
            ))}
          </div>
        ) : (
          <MobileEmptyState icon="⚑" title="No grievances yet" description="Issues you submit will appear here." />
        )}
      </MobileSection>

      <MobileSection title="My discussions" subtitle="Conversations you started" action={<button type="button" onClick={onOpenDiscussions} className="text-xs font-bold text-cv-primary">See all</button>}>
        {myDiscussions.length ? <div className="space-y-2">{myDiscussions.slice(0,3).map(item=><button key={item._id||item.id} type="button" onClick={onOpenDiscussions} className="w-full rounded-xl border border-cv-border bg-cv-surface p-3 text-left"><p className="line-clamp-2 text-sm font-bold text-cv-text">{item.title||item.question||item.text||"Discussion"}</p><p className="mt-1 text-[10px] text-cv-text-muted">{formatDate(item.createdAt)}</p></button>)}</div> : <MobileEmptyState icon={<MessageCircle className="h-5 w-5"/>} title="No discussions yet" description="Discussions you start will appear here."/>}
      </MobileSection>
      <MobileSection title="My polls" subtitle="Polls you created" action={<button type="button" onClick={onOpenPolls} className="text-xs font-bold text-cv-primary">See all</button>}>
        {myPolls.length ? <div className="space-y-2">{myPolls.slice(0,3).map(item=><button key={item._id||item.id} type="button" onClick={onOpenPolls} className="w-full rounded-xl border border-cv-border bg-cv-surface p-3 text-left"><p className="line-clamp-2 text-sm font-bold text-cv-text">{item.question||item.title||"Poll"}</p><p className="mt-1 text-[10px] text-cv-text-muted">{(item.voters||[]).length} votes</p></button>)}</div> : <MobileEmptyState icon="◉" title="No polls yet" description="Polls you create will appear here."/>}
      </MobileSection>
      <MobileSection title="My feedback" subtitle="Your submitted forms and responses">
        {feedbackLoading ? (
          <MobileSkeleton variant="card" className="h-24" />
        ) : responses.length ? (
          <div className="space-y-3">
            {responses.slice(0, 4).map(({ form, response }) => (
              <MobileCard key={response?._id || form?._id} padding="sm">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cv-success-soft text-cv-success"><CheckCircle2 className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold text-cv-text">{form?.title || "Feedback"}</p>
                    <p className="mt-1 text-[10px] text-cv-text-muted">Submitted {formatDate(response?.createdAt || response?.submittedAt)}{form?.anonymous ? " · Anonymous" : ""}</p>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        ) : (
          <MobileEmptyState icon="✓" title="No feedback responses yet" description="Your submitted feedback will appear here." />
        )}
      </MobileSection>

      <MobileSection title="My responses & actions" subtitle="Things that need your attention">
        {actions.length ? (
          <div className="space-y-3">
            {actions.slice(0, 4).map((issue) => (
              <MobileCard key={issue._id || issue.id} padding="sm" interactive as="button" type="button" onClick={onOpenIssues} className="w-full text-left">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cv-warning-soft text-cv-warning"><ListChecks className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="text-sm font-bold text-cv-text">{issue.status === "resolved" ? "Verify the resolution" : "Follow up on your grievance"}</p><MobileBadge tone="warning">Action</MobileBadge></div><p className="mt-1 line-clamp-2 text-xs text-cv-text-secondary">{issueTitle(issue)}</p></div>
                </div>
              </MobileCard>
            ))}
          </div>
        ) : (
          <MobileEmptyState icon="✓" title="You're all caught up" description="There are no pending student actions right now." />
        )}
      </MobileSection>
    </div>
  );
}
