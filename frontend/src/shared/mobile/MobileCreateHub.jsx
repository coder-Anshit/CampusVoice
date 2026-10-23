import { BarChart3, ClipboardList, Flag, MessageCircle, Megaphone, X } from "lucide-react";

const STUDENT_ACTIONS = [
  {
    id: "issue",
    label: "Create Issue",
    description: "Report something that needs attention.",
    icon: Flag,
    tone: "danger",
  },
  {
    id: "discussion",
    label: "Create Discussion",
    description: "Start a campus conversation.",
    icon: MessageCircle,
    tone: "primary",
  },
  {
    id: "poll",
    label: "Create Poll",
    description: "Ask a quick question and collect votes.",
    icon: BarChart3,
    tone: "primary",
  },
];

const PRIVILEGED_ACTIONS = [
  {
    id: "issue",
    label: "Create Issue",
    description: "Report something that needs attention.",
    icon: Flag,
    tone: "danger",
  },
  {
    id: "poll",
    label: "Create Poll",
    description: "Ask students a focused question and collect votes.",
    icon: BarChart3,
    tone: "primary",
  },
  {
    id: "discussion",
    label: "Create Discussion",
    description: "Open a campus conversation or ask a question.",
    icon: MessageCircle,
    tone: "primary",
  },
  {
    id: "feedback",
    label: "Create Feedback",
    description: "Build a feedback form for students.",
    icon: ClipboardList,
    tone: "neutral",
  },
  {
    id: "announcement",
    label: "Create Announcement",
    description: "Publish an official campus update.",
    icon: Megaphone,
    tone: "primary",
  },
];

const ACTION_STYLES = {
  primary: "bg-cv-primary-soft text-cv-primary",
  danger: "bg-cv-danger-soft text-cv-danger",
  neutral: "bg-cv-surface-soft text-cv-text-secondary",
};

export default function MobileCreateHub({
  open,
  onClose,
  role = "student",
  onCreateIssue,
  onCreateDiscussion,
  onCreateFeedback,
  onCreatePoll,
  onCreateAnnouncement,
}) {
  if (!open) return null;

  const normalizedRole = String(role || "student").toLowerCase();
  const isPrivileged = ["admin", "employee", "faculty", "hod", "superadmin", "super_admin", "super-admin"].includes(normalizedRole);

  const actions = isPrivileged ? PRIVILEGED_ACTIONS : STUDENT_ACTIONS;

  const handlers = {
    issue: onCreateIssue,
    discussion: onCreateDiscussion,
    feedback: onCreateFeedback,
    poll: onCreatePoll,
    announcement: onCreateAnnouncement,
  };

  return (
    <div className="fixed inset-0 z-[60] cv-mobile-only">
      <button
        aria-label="Close create menu"
        onClick={onClose}
        className="absolute inset-0 bg-[rgb(25_21_28/0.42)] backdrop-blur-[2px]"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-create-title"
        className="absolute inset-x-0 bottom-0 mx-auto max-w-xl overflow-hidden rounded-t-[28px] border-t border-cv-border bg-cv-surface px-4 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3 shadow-[0_-20px_60px_rgb(54_43_58/0.16)]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-cv-border" />

        <div className="mb-5 flex items-start justify-between gap-4 px-1">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-cv-primary">
              Quick action
            </p>
            <h2 id="mobile-create-title" className="mt-1 text-lg font-bold tracking-[-0.025em] text-cv-text">
              Create something
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-cv-text-secondary">
              Choose what you want to share with your campus.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cv-touch-target flex items-center justify-center rounded-full border border-cv-border bg-cv-surface-soft text-cv-text-muted transition-colors active:bg-cv-primary-soft active:text-cv-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {actions.map(({ id, label, description, icon: Icon, tone }) => (
            <button
              key={id}
              type="button"
              onClick={handlers[id]}
              className="group flex min-h-[68px] w-full items-center gap-3 rounded-[18px] border border-cv-border bg-cv-surface px-3.5 text-left shadow-cv-xs transition-all active:scale-[0.99] active:bg-cv-surface-soft"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${ACTION_STYLES[tone]}`}
              >
                <Icon className="h-[19px] w-[19px]" strokeWidth={2.1} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold tracking-[-0.01em] text-cv-text">
                  {label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-cv-text-secondary">
                  {description}
                </span>
              </span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-[10px] font-medium text-cv-text-muted">
          {isPrivileged ? `${normalizedRole === "admin" ? "Administrator" : "Staff"} workspace · Community actions are available here.` : "Your campus. Your voice."}
        </p>
      </section>
    </div>
  );
}
