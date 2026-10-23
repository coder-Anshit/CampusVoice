import { ArrowRight, BarChart3, ClipboardList, Flag, Megaphone, MessageCircle, UserRound } from "lucide-react";
import { MobileBadge, MobileCard, MobileEmptyState, MobileSection, MobileSkeleton, MobileStatus } from "./primitives/index.js";

function shortDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function issueDepartment(issue) {
  const value = issue?.department;
  if (value && typeof value === "object") return value.name || value.departmentName || value.department || "";
  return value || "";
}

function issueTitle(issue) {
  return issue?.title || issue?.text || "Untitled issue";
}

export default function MobileStudentHome({
  username,
  issues = [],
  polls = [],
  announcements = [],
  discussions = [],
  loading = false,
  onOpenIssues,
  onOpenPolls,
  onOpenDiscussions,
  onOpenAnnouncements,
  onOpenFeedback,
  onOpenDashboard,
}) {
  const firstName = String(username || "Student").split(/\s+/)[0];
  const latestIssues = [...issues].sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)).slice(0, 4);
  const visiblePolls = polls.slice(0, 4);
  const visibleDiscussions = discussions.slice(0, 4);
  const visibleAnnouncements = announcements.slice(0, 3);
  const importantAnnouncement = announcements.find((item) => ["critical", "urgent", "important"].includes(String(item?.priority || "").toLowerCase())) || announcements[0];
  const pulse = {
    issues: issues.filter((item) => !["closed", "verified", "rejected"].includes(String(item?.status || "").toLowerCase())).length,
    polls: polls.length,
    discussions: discussions.length,
    updates: announcements.length,
  };

  if (loading) {
    return (
      <div className="space-y-5" aria-label="Loading campus home">
        <MobileSkeleton variant="card" className="h-32" />
        <MobileSkeleton variant="card" className="h-20" />
        <MobileSkeleton variant="card" className="h-36" />
        <MobileSkeleton variant="card" className="h-36" />
      </div>
    );
  }

  const shortcuts = [
    ["issues", "Issues", Flag, onOpenIssues],
    ["polls", "Polls", BarChart3, onOpenPolls],
    ["discussions", "Discussions", MessageCircle, onOpenDiscussions],
    ["announcements", "Updates", Megaphone, onOpenAnnouncements],
    ["feedback", "Feedback", ClipboardList, onOpenFeedback],
    ["dashboard", "My dashboard", UserRound, onOpenDashboard],
  ];

  return (
    <div className="space-y-7">
      <MobileCard className="relative overflow-hidden bg-cv-primary text-white shadow-cv-md" padding="md">
        <div className="absolute -right-12 -top-14 h-36 w-36 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute -bottom-16 -left-8 h-28 w-28 rounded-full bg-white/5" aria-hidden="true" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">Good to see you</p>
          <h2 className="mt-1 text-[25px] font-extrabold leading-tight tracking-[-0.04em] text-white">Hi, {firstName} 👋</h2>
          <p className="mt-2 max-w-[300px] text-[12px] leading-5 text-white">Stay informed, raise your voice, and see what is happening across campus.</p>
        </div>
      </MobileCard>

      <section aria-label="Campus navigation" className="-mx-1 overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex min-w-max gap-2 px-1">
          {shortcuts.map(([id, label, Icon, handler]) => (
            <button key={id} type="button" onClick={handler} className="flex min-h-16 w-[92px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-cv-border bg-cv-surface px-2 text-center shadow-cv-xs transition-all active:scale-[0.98]">
              <Icon className="h-4 w-4 text-cv-primary" strokeWidth={2.1} />
              <span className="text-[10px] font-bold leading-3 text-cv-text">{label}</span>
            </button>
          ))}
        </div>
      </section>

      <MobileSection title="Campus Pulse" subtitle="A quick view of what is active around campus">
        <div className="-mx-1 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex min-w-max gap-3 px-1">
            {[
              ["Active issues", pulse.issues, "Track campus concerns", onOpenIssues, Flag],
              ["Live polls", pulse.polls, "Share your opinion", onOpenPolls, BarChart3],
              ["Discussions", pulse.discussions, "Join the conversation", onOpenDiscussions, MessageCircle],
              ["Updates", pulse.updates, "Latest campus news", onOpenAnnouncements, Megaphone],
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

      {importantAnnouncement ? (
        <MobileSection title="Important update" action={<button type="button" onClick={onOpenAnnouncements} className="text-xs font-bold text-cv-primary">View all</button>}>
          <MobileCard interactive as="button" type="button" onClick={onOpenAnnouncements} className="w-full text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cv-warning-soft text-cv-warning"><Megaphone className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><MobileBadge tone="warning">{importantAnnouncement.priority || "Important"}</MobileBadge><span className="text-[10px] text-cv-text-muted">{shortDate(importantAnnouncement.createdAt || importantAnnouncement.publishedAt)}</span></div>
                <h3 className="mt-2 line-clamp-2 text-sm font-bold text-cv-text">{importantAnnouncement.title || importantAnnouncement.heading || "Campus announcement"}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-cv-text-secondary">{importantAnnouncement.message || importantAnnouncement.content || importantAnnouncement.description || "Open the announcement for details."}</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-cv-text-muted" />
            </div>
          </MobileCard>
        </MobileSection>
      ) : null}

      <MobileSection title="Latest issues" subtitle="Public campus concerns raised recently" action={<button type="button" onClick={onOpenIssues} className="text-xs font-bold text-cv-primary">See all</button>}>
        {latestIssues.length ? (
          <div className="space-y-3">
            {latestIssues.map((issue) => (
              <MobileCard key={issue._id || issue.id} padding="sm" interactive as="button" type="button" onClick={onOpenIssues} className="w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><span className="text-[10px] font-semibold text-cv-text-muted">{issueDepartment(issue) || issue.category || "Campus"}</span><span className="text-[10px] text-cv-text-subtle">{shortDate(issue.createdAt)}</span></div>
                    <h3 className="mt-1 line-clamp-2 text-sm font-bold text-cv-text">{issueTitle(issue)}</h3>
                    <div className="mt-2"><MobileStatus status={issue.status} /></div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-cv-text-muted" />
                </div>
              </MobileCard>
            ))}
          </div>
        ) : <MobileEmptyState icon="⚑" title="No public issues yet" description="New campus concerns will appear here." />}
      </MobileSection>

      <MobileSection title="Campus polls" subtitle="Questions the campus is voting on" action={<button type="button" onClick={onOpenPolls} className="text-xs font-bold text-cv-primary">See all</button>}>
        {visiblePolls.length ? (
          <div className="-mx-1 overflow-x-auto pb-1 scrollbar-hide"><div className="flex min-w-max gap-3 px-1">
            {visiblePolls.map((poll) => (
              <button key={poll._id || poll.id} type="button" onClick={onOpenPolls} className="w-[245px] rounded-2xl border border-cv-border bg-cv-surface p-4 text-left shadow-cv-xs">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cv-primary-soft text-cv-primary"><BarChart3 className="h-4 w-4" /></span>
                <h3 className="mt-3 line-clamp-2 text-sm font-bold text-cv-text">{poll.question || poll.title || "Campus poll"}</h3>
                <p className="mt-1 text-[10px] text-cv-text-muted">Tap to vote</p>
              </button>
            ))}
          </div></div>
        ) : <MobileEmptyState icon="◉" title="No active polls" description="New campus polls will appear here." />}
      </MobileSection>

      <MobileSection title="Discussions" subtitle="Open conversations across campus" action={<button type="button" onClick={onOpenDiscussions} className="text-xs font-bold text-cv-primary">See all</button>}>
        {visibleDiscussions.length ? (
          <div className="space-y-3">
            {visibleDiscussions.map((discussion) => (
              <MobileCard key={discussion._id || discussion.id} interactive as="button" type="button" onClick={onOpenDiscussions} className="w-full text-left" padding="sm">
                <div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cv-primary-soft text-cv-primary"><MessageCircle className="h-4 w-4" /></div><div className="min-w-0 flex-1"><h3 className="line-clamp-2 text-sm font-bold text-cv-text">{discussion.title || discussion.question || discussion.text || "Campus discussion"}</h3><p className="mt-1 line-clamp-1 text-xs text-cv-text-secondary">{discussion.description || discussion.content || discussion.text || "Join the conversation."}</p><p className="mt-2 text-[10px] text-cv-text-muted">{discussion.category || "Campus"} · {shortDate(discussion.createdAt)}</p></div><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-cv-text-muted" /></div>
              </MobileCard>
            ))}
          </div>
        ) : <MobileEmptyState icon="💬" title="No discussions yet" description="New campus conversations will appear here." />}
      </MobileSection>

      <MobileSection title="Campus updates" subtitle="Recent institutional announcements" action={<button type="button" onClick={onOpenAnnouncements} className="text-xs font-bold text-cv-primary">See all</button>}>
        {visibleAnnouncements.length ? (
          <div className="space-y-3">
            {visibleAnnouncements.map((announcement) => (
              <MobileCard key={announcement._id || announcement.id} padding="sm" interactive as="button" type="button" onClick={onOpenAnnouncements} className="w-full text-left">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="line-clamp-2 text-sm font-bold text-cv-text">{announcement.title || announcement.heading || "Campus update"}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-cv-text-secondary">{announcement.message || announcement.content || announcement.description || "Open for details."}</p></div><span className="shrink-0 text-[10px] text-cv-text-muted">{shortDate(announcement.createdAt || announcement.publishedAt)}</span></div>
              </MobileCard>
            ))}
          </div>
        ) : <MobileEmptyState icon="•" title="No campus updates" description="New institutional announcements will appear here." />}
      </MobileSection>
    </div>
  );
}
