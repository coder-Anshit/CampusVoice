import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { fetchMyIssues, verifyIssue } from "../../../shared/services/issues.service.js";
import {
  fetchStudentFeedbackForms,
  fetchMyFeedbackResponse,
} from "../../../shared/services/feedback.service.js";

/* -------------------------------------------------------------------------- */
/* STATUS                                                                      */
/* -------------------------------------------------------------------------- */

const STATUS_META = {
  created: {
    label: "Created",
    dot: "bg-cv-warning",
    badge: "bg-cv-warning-soft text-cv-warning border-cv-warning-border",
  },
  viewed: {
    label: "Viewed",
    dot: "bg-cv-info",
    badge: "bg-cv-info-soft text-cv-info border-cv-info-border",
  },
  pending: {
    label: "Created",
    dot: "bg-cv-warning",
    badge: "bg-cv-warning-soft text-cv-warning border-cv-warning-border",
  },
  approved: {
    label: "Viewed",
    dot: "bg-cv-success",
    badge: "bg-cv-success-soft text-cv-success border-cv-success-border",
  },
  assigned: {
    label: "Assigned",
    dot: "bg-cv-info",
    badge: "bg-cv-info-soft text-cv-info border-cv-info-border",
  },
  accepted: {
    label: "Accepted",
    dot: "bg-cv-primary",
    badge: "bg-cv-primary-soft text-cv-primary border-cv-primary-border",
  },
  investigating: {
    label: "Investigating",
    dot: "bg-cv-primary",
    badge: "bg-cv-primary-soft text-cv-primary border-cv-primary-border",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-cv-warning",
    badge: "bg-cv-warning-soft text-cv-warning border-cv-warning-border",
  },
  verified: {
    label: "Verified",
    dot: "bg-cv-success",
    badge: "bg-cv-success-soft text-cv-success border-cv-success-border",
  },
  escalated: {
    label: "Escalated",
    dot: "bg-cv-danger",
    badge: "bg-cv-danger-soft text-cv-danger border-cv-danger-border",
  },
  closed: {
    label: "Closed",
    dot: "bg-cv-text-subtle",
    badge: "bg-cv-surface-muted text-cv-text-muted border-cv-border",
  },
  rejected: {
    label: "Rejected",
    dot: "bg-cv-danger",
    badge: "bg-cv-danger-soft text-cv-danger border-cv-danger-border",
  },
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(name) {
  return (name || "Student")
    .split(/\s+/)
    .map((x) => x[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* -------------------------------------------------------------------------- */
/* SMALL UI COMPONENTS                                                         */
/* -------------------------------------------------------------------------- */

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-cv-border bg-cv-surface-soft px-4 py-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cv-text-subtle">
        {label}
      </p>

      <p
        className="mt-1.5 truncate text-sm font-medium text-cv-text"
        title={String(value || "—")}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function MiniMetric({ label, value, accent }) {
  const accentMap = {
    purple: "text-cv-primary",
    green: "text-cv-success",
    orange: "text-cv-warning",
  };

  return (
    <div className="min-w-0 rounded-2xl border border-cv-border bg-cv-surface-soft px-4 py-3">
      <p className="truncate text-[9px] font-semibold uppercase tracking-[0.1em] text-cv-text-subtle">
        {label}
      </p>

      <p
        className={`mt-1 text-xl font-bold tracking-tight ${
          accentMap[accent] || "text-cv-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, accent = "purple" }) {
  const accentClasses = {
    purple: "text-cv-primary",
    orange: "text-cv-warning",
    green: "text-cv-success",
    blue: "text-cv-info",
  };

  return (
    <div className="mb-5">
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
          accentClasses[accent] || accentClasses.purple
        }`}
      >
        {eyebrow}
      </p>

      <h2 className="mt-1.5 text-[21px] font-semibold tracking-[-0.02em] text-cv-text">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-xs leading-5 text-cv-text-muted">
          {description}
        </p>
      )}
    </div>
  );
}

function Empty({ icon = "○", title, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-cv-border bg-cv-surface-soft px-6 py-12 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-cv-primary-soft text-lg text-cv-primary">
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold text-cv-text">
        {title}
      </p>

      {text && (
        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-cv-text-muted">
          {text}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ISSUE ROW                                                                   */
/* -------------------------------------------------------------------------- */


function IssueRow({
  issue,
  onOpen,
  compact = false,
}) {
  const priority = String(
    issue.priority || ""
  ).trim();

  const priorityLabel = priority
    ? `${priority.charAt(0).toUpperCase()}${priority.slice(
        1
      )} priority`
    : null;

  const department =
    typeof issue.department === "object"
      ? issue.department?.name ||
        issue.department?.department ||
        issue.department?.departmentName
      : issue.department;

  return (
    <article
      className={`
        group relative overflow-hidden
        rounded-cv-xl
        border border-cv-border
        bg-cv-surface
        px-5 py-4
        transition-all duration-200
        hover:-translate-y-[1px]
        hover:border-cv-primary-border
        hover:shadow-cv-lg
        ${compact ? "mb-2" : "mb-3"}
      `}
    >
      {/* Subtle hover accent */}
      <div
        className="
          absolute left-0 top-0 h-full w-[3px]
          bg-cv-primary
          opacity-0
          transition-opacity duration-200
          group-hover:opacity-100
        "
      />

      {/* Top row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="
              inline-flex items-center
              rounded-full
              border border-cv-primary-border
              bg-cv-primary-soft
              px-2.5 py-1
              text-[9px] font-semibold
              text-cv-text-secondary
            "
          >
            {issue.category || "General"}
          </span>

          <span className="text-[10px] text-cv-text-subtle">
            {formatDate(issue.createdAt)}
          </span>
        </div>

        <StatusBadge status={issue.status} />
      </div>

      {/* Main content */}
      <div className="mt-3.5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <h3
            className="
              text-[15px]
              font-semibold
              tracking-[-0.012em]
              text-cv-text
            "
          >
            {issue.title || "Untitled Issue"}
          </h3>

          <p
            className="
              mt-1.5
              max-w-3xl
              line-clamp-2
              text-xs
              leading-5
              text-cv-text-secondary
            "
          >
            {issue.text || "No description provided."}
          </p>
        </div>

        {/* Minimal CTA */}
        <button
          type="button"
          onClick={() => onOpen(issue)}
          className="
            inline-flex shrink-0
            items-center justify-center
            rounded-xl
            border border-cv-primary-border
            bg-cv-primary-soft
            px-3.5 py-2
            text-[10px] font-semibold
            text-cv-primary-hover
            transition-all duration-200
            hover:border-cv-primary-border
            hover:bg-cv-primary-soft
            hover:text-cv-primary-hover
            active:scale-[0.98]
            md:mb-0.5
          "
        >
          View details
          <span className="ml-1.5 text-cv-text-subtle transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </div>

      {/* Metadata footer */}
      {(department || priorityLabel) && (
        <div
          className="
            mt-3.5
            flex flex-wrap
            items-center
            gap-x-5 gap-y-1.5
            border-t border-cv-divider
            pt-3
          "
        >
          {department && (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cv-primary-border" />

              <span className="text-[10px] font-medium text-cv-text-muted">
                {department}
              </span>
            </div>
          )}

          {priorityLabel && (
            <span
              className={`
                text-[10px] font-medium
                ${
                  priority.toLowerCase() === "high"
                    ? "text-cv-warning"
                    : priority.toLowerCase() === "urgent"
                    ? "text-cv-danger"
                    : "text-cv-text-muted"
                }
              `}
            >
              {priorityLabel}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* RESPONSE ANSWERS                                                            */
/* -------------------------------------------------------------------------- */

function ResponseAnswers({ form, response }) {
  const answers = Array.isArray(response?.answers)
    ? response.answers
    : [];

  const map = new Map(
    (form?.questions || []).map((q) => [String(q.id), q])
  );

  return (
    <div className="mt-5 space-y-3 border-t border-cv-border pt-5">
      {answers.length ? (
        answers.map((answer, index) => {
          const question = map.get(String(answer?.questionId));

          const value = Array.isArray(answer?.answer)
            ? answer.answer.join(", ")
            : answer?.answer;

          return (
            <div
              key={answer?.questionId || index}
              className="rounded-2xl border border-cv-border bg-cv-surface-soft p-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cv-text-subtle">
                Question {index + 1}
              </p>

              <p className="mt-1.5 text-sm font-medium leading-5 text-cv-text">
                {question?.question || question?.text || "Question"}
              </p>

              <p className="mt-2.5 whitespace-pre-wrap text-xs leading-5 text-cv-text-secondary">
                {String(value ?? "—")}
              </p>
            </div>
          );
        })
      ) : (
        <p className="text-xs text-cv-text-muted">
          No answer details available.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MY FEEDBACK                                                                 */
/* -------------------------------------------------------------------------- */

function MyFeedback({ responses, loading }) {
  return (
    <section className="rounded-cv-xl border border-cv-border bg-cv-surface p-5 shadow-cv-card md:p-6">
      <SectionHeading
        eyebrow="Personal responses"
        title="My Feedback"
        description="Your submitted feedback and responses."
      />

      {loading ? (
        <div className="rounded-2xl border border-cv-border bg-cv-surface-soft p-12 text-center text-xs text-cv-text-muted">
          Loading your responses…
        </div>
      ) : responses.length ? (
        <div className="space-y-3">
          {responses.map(({ form, response }) => (
            <details
              key={response?._id || form?._id}
              className="
                group rounded-2xl border border-cv-border
                bg-cv-surface p-4
                transition-all duration-200
                hover:border-cv-primary-border
                hover:shadow-cv-lg
              "
            >
              <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cv-success-soft text-sm font-bold text-cv-success">
                      ✓
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-cv-text">
                        {form?.title || "Feedback"}
                      </h3>

                      <p className="mt-1 text-[10px] text-cv-text-subtle">
                        Submitted{" "}
                        {formatDate(
                          response?.createdAt || response?.submittedAt
                        )}

                        {form?.anonymous ? " • Anonymous" : ""}
                      </p>
                    </div>
                  </div>

                  <span className="ml-13 shrink-0 text-[11px] font-semibold text-cv-primary transition-colors group-hover:text-cv-primary-hover sm:ml-0">
                    View response
                    <span className="ml-1.5 text-cv-text-subtle">↓</span>
                  </span>
                </div>
              </summary>

              <ResponseAnswers form={form} response={response} />
            </details>
          ))}
        </div>
      ) : (
        <Empty
          icon="💬"
          title="No feedback responses yet"
          text="Your submitted feedback will appear here."
        />
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* MY GRIEVANCES                                                               */
/* -------------------------------------------------------------------------- */

function MyIssues({ issues, onOpen }) {
  return (
    <section className="rounded-cv-xl border border-cv-border bg-cv-surface p-5 shadow-cv-card md:p-6">
      <SectionHeading
        eyebrow="Personal grievances"
        title="My Grievances"
        description="Track the issues you've raised and their progress."
      />

      {issues.length ? (
        <div className="space-y-3">
          {issues.map((issue) => (
            <IssueRow
              key={issue._id || issue.id}
              issue={issue}
              onOpen={onOpen}
            />
          ))}
        </div>
      ) : (
        <Empty
          icon="⚑"
          title="No grievances yet"
          text="Issues you submit will appear here so you can follow their progress."
        />
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* MY TASKS                                                                    */
/* -------------------------------------------------------------------------- */

function MyTasks({ items, onOpen }) {
  return (
    <section className="rounded-3xl border border-cv-border bg-cv-surface p-5 shadow-sm">
      {/* Section header */}
      <div className="mb-5">
        <p className="text-[9px] uppercase tracking-[0.18em] font-semibold text-cv-primary">
          STUDENT ACTIONS
        </p>

        <h2 className="mt-1 text-xl font-semibold tracking-[-0.015em] text-cv-text">
          My Tasks
        </h2>

        <p className="mt-1 text-xs text-cv-text-secondary">
          Actions that need your attention from your grievance workflow.
        </p>
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((issue) => {
            const isResolved = issue.status === "resolved";

            return (
              <article
                key={issue._id || issue.id}
                className="
                  group relative overflow-hidden
                  rounded-cv-lg
                  border border-cv-border
                  bg-cv-surface
                  p-4
                  transition-all duration-200
                  hover:-translate-y-[1px]
                  hover:border-cv-primary-border
                  hover:bg-cv-surface
                  hover:shadow-cv-lg
                "
              >
                {/* Hover accent */}
                <div
                  className="
                    absolute left-0 top-0 h-full w-[3px]
                    bg-cv-primary
                    opacity-0
                    transition-opacity duration-200
                    group-hover:opacity-100
                  "
                />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Task information */}
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className={`
                        flex h-10 w-10 shrink-0 items-center justify-center
                        rounded-2xl
                        text-sm font-semibold
                        ${
                          isResolved
                            ? "bg-cv-success-soft text-cv-success"
                            : "bg-cv-primary-soft text-cv-primary"
                        }
                      `}
                    >
                      {isResolved ? "✓" : "→"}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-cv-text">
                          {isResolved
                            ? "Verify the resolution"
                            : "Follow up on your grievance"}
                        </p>

                        <span
                          className={`
                            rounded-full
                            px-2 py-0.5
                            text-[9px] font-semibold
                            ${
                              isResolved
                                ? "bg-cv-success-soft text-cv-success"
                                : "bg-cv-primary-soft text-cv-primary"
                            }
                          `}
                        >
                          {isResolved ? "Action required" : "Follow-up"}
                        </span>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-cv-text-secondary line-clamp-2">
                        {issue.title || "Untitled grievance"}
                      </p>

                      {issue.category && (
                        <p className="mt-2 text-[10px] font-medium text-cv-text-subtle">
                          {issue.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={() => onOpen(issue)}
                    className="
                      inline-flex shrink-0 items-center justify-center
                      rounded-xl
                      border border-cv-primary-border
                      bg-cv-primary-soft
                      px-3.5 py-2
                      text-[10px] font-semibold
                      text-cv-primary-hover
                      transition-all duration-200
                      hover:border-cv-primary-border
                      hover:bg-cv-primary-soft
                      hover:text-cv-primary-hover
                      active:scale-[0.98]
                    "
                  >
                    Open issue
                    <span className="ml-1.5 text-cv-text-subtle transition-transform duration-200 group-hover:translate-x-0.5">
                      →
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div
          className="
            flex min-h-[210px]
            flex-col items-center justify-center
            rounded-cv-xl
            border border-dashed border-cv-border
            bg-cv-surface
            px-6 py-10
            text-center
          "
        >
          <div
            className="
              flex h-11 w-11 items-center justify-center
              rounded-2xl
              bg-cv-primary-soft
              text-cv-primary
              text-lg
            "
          >
            ✓
          </div>

          <h3 className="mt-3 text-sm font-semibold text-cv-text">
            You're all caught up
          </h3>

          <p className="mt-1.5 max-w-sm text-xs leading-5 text-cv-text-muted">
            There are no student actions waiting for you right now.
          </p>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* PROFILE                                                                     */
/* -------------------------------------------------------------------------- */

function StatCard({ icon, label, value, accent = "purple" }) {
  const styles = {
    purple: {
      icon: "bg-cv-primary-soft text-cv-primary",
      value: "text-cv-primary-hover",
    },
    green: {
      icon: "bg-cv-success-soft text-cv-success",
      value: "text-cv-success",
    },
    blue: {
      icon: "bg-cv-info-soft text-cv-info",
      value: "text-cv-info",
    },
    orange: {
      icon: "bg-cv-warning-soft text-cv-warning",
      value: "text-cv-warning",
    },
  };

  const style = styles[accent] || styles.purple;

  return (
    <div
      className="
        rounded-2xl border border-cv-border
        bg-cv-surface p-4
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-cv-lg
      "
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-base ${style.icon}`}
        >
          {icon}
        </div>

        <span className={`text-2xl font-bold ${style.value}`}>
          {value}
        </span>
      </div>

      <p className="mt-3 text-xs font-medium text-cv-text-secondary">
        {label}
      </p>
    </div>
  );
}

function Profile({
  username,
  profile,
  stats,
}) {
  return (
    <div className="space-y-5">
      {/* Identity */}
      <section
        className="
          relative overflow-hidden
          rounded-cv-2xl
          border border-cv-border
          bg-cv-surface
          p-6 md:p-7
          shadow-sm
        "
      >
        {/* Subtle identity accent */}
        <div className="absolute left-0 top-0 h-full w-1 bg-cv-primary" />

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div
              className="
                flex h-[68px] w-[68px] shrink-0
                items-center justify-center
                rounded-cv-xl
                bg-cv-primary
                text-xl font-semibold
                text-white
                shadow-sm
              "
            >
              {initials(username)}
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.18em] font-semibold text-cv-primary">
                STUDENT PROFILE
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-cv-text">
                {username || "Student"}
              </h2>

              <p className="mt-1 text-xs text-cv-text-muted">
                Your CampusVoice account
              </p>
            </div>
          </div>

          {/* Account status */}
          <div
            className="
              inline-flex w-fit items-center gap-2
              rounded-full
              border border-cv-success-soft
              bg-cv-success-soft
              px-3 py-1.5
              text-[10px] font-semibold
              text-cv-success
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cv-success" />
            Active account
          </div>
        </div>

        {/* Academic information */}
        <div className="mt-7 border-t border-cv-divider pt-6">
          <p className="mb-3 text-[9px] uppercase tracking-[0.18em] font-semibold text-cv-primary">
            ACADEMIC INFORMATION
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ProfileInfo
              label="Department"
              value={profile.department}
            />

            <ProfileInfo
              label="Course"
              value={profile.course}
            />

            <ProfileInfo
              label="Semester"
              value={profile.semester}
            />

            <ProfileInfo
              label="Student ID"
              value={profile.studentId}
            />
          </div>
        </div>
      </section>

      {/* Campus activity */}
      <section>
        <div className="mb-3 px-1">
          <p className="text-[9px] uppercase tracking-[0.18em] font-semibold text-cv-primary">
            CAMPUS ACTIVITY
          </p>

          <h3 className="mt-1 text-lg font-semibold tracking-[-0.015em] text-cv-text">
            Your activity
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ProfileStat
            label="Grievances"
            value={stats.grievances}
            icon="⚑"
            tone="plum"
          />

          <ProfileStat
            label="Resolved"
            value={stats.resolved}
            icon="✓"
            tone="green"
          />

          <ProfileStat
            label="Active"
            value={stats.active}
            icon="◌"
            tone="blue"
          />

          <ProfileStat
            label="Feedbacks"
            value={stats.feedback}
            icon="◉"
            tone="violet"
          />
        </div>
      </section>
    </div>
  );
}

function ProfileInfo({ label, value }) {
  return (
    <div
      className="
        rounded-cv-lg
        border border-cv-border
        bg-cv-surface
        px-4 py-3.5
        transition-colors duration-200
        hover:border-cv-primary-border
        hover:bg-cv-surface
      "
    >
      <p className="text-[9px] uppercase tracking-[0.12em] font-semibold text-cv-text-subtle">
        {label}
      </p>

      <p className="mt-1.5 truncate text-xs font-semibold text-cv-text-secondary">
        {value && value !== "—" ? value : "Not available"}
      </p>
    </div>
  );
}

function ProfileStat({
  label,
  value,
  icon,
  tone = "plum",
}) {
  const tones = {
    plum: {
      icon: "bg-cv-primary-soft text-cv-primary",
      value: "text-cv-primary-hover",
    },
    green: {
      icon: "bg-cv-success-soft text-cv-success",
      value: "text-cv-success",
    },
    blue: {
      icon: "bg-cv-info-soft text-cv-info",
      value: "text-cv-info",
    },
    violet: {
      icon: "bg-cv-primary-soft text-cv-primary",
      value: "text-cv-primary",
    },
  };

  const selected = tones[tone] || tones.plum;

  return (
    <div
      className="
        rounded-cv-lg
        border border-cv-border
        bg-cv-surface
        p-4
        transition-all duration-200
        hover:-translate-y-[1px]
        hover:border-cv-primary-border
        hover:shadow-cv-lg
      "
    >
      <div
        className={`
          flex h-9 w-9 items-center justify-center
          rounded-xl
          text-sm
          ${selected.icon}
        `}
      >
        {icon}
      </div>

      <p
        className={`
          mt-3
          text-xl font-semibold
          ${selected.value}
        `}
      >
        {value}
      </p>

      <p className="mt-0.5 text-[10px] font-medium text-cv-text-muted">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ISSUE DETAILS                                                               */
/* -------------------------------------------------------------------------- */

function IssueDetails({ issue, onBack, onChanged }) {
  const [currentIssue, setCurrentIssue] = useState(issue);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setCurrentIssue(issue);
  }, [issue]);

  const handleSatisfaction = async (action) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await verifyIssue(currentIssue._id || currentIssue.id, action);
      setCurrentIssue(updated);
      onChanged?.(updated);
      toast.success(action === "close" ? "Grievance closed. Thank you for verifying the resolution." : "Grievance escalated. The institution will review it again.");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Unable to update grievance");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="
          inline-flex items-center gap-2
          text-xs font-semibold text-cv-text-muted
          transition-colors
          hover:text-cv-text
        "
      >
        <span className="text-sm">←</span>
        Back to My Grievances
      </button>

      <section className="overflow-hidden rounded-cv-xl border border-cv-border bg-cv-surface shadow-cv-card">
        <div className="h-1 bg-cv-primary-border" />

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cv-text-subtle">
                Grievance
              </p>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-cv-text md:text-2xl">
                {currentIssue.title || "Untitled Issue"}
              </h2>
            </div>

            <StatusBadge status={currentIssue.status} />
          </div>

          <div className="mt-6 rounded-2xl bg-cv-surface-soft px-4 py-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-cv-text-secondary">
              {currentIssue.text}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Info
              label="Category"
              value={currentIssue.category || "General"}
            />

            <Info
              label="Department"
              value={currentIssue.department || "Not assigned"}
            />

            <Info
              label="Priority"
              value={currentIssue.priority || "Medium"}
            />

            <Info
              label="Submitted"
              value={formatDate(currentIssue.createdAt)}
            />
          </div>

          {currentIssue.resolutionNote && (
            <div className="mt-5 rounded-2xl border border-cv-success-border bg-cv-success-soft/60 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cv-success">
                Resolution
              </p>

              <p className="mt-1.5 text-xs leading-6 text-cv-success/80">
                {currentIssue.resolutionNote}
              </p>
            </div>
          )}
        </div>

          {(currentIssue.status === "resolved" || currentIssue.status === "verified") && (
            <div className="mt-5 overflow-hidden rounded-2xl border border-cv-primary-border bg-cv-primary-soft/40">
              <div className="px-4 py-4 sm:px-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cv-primary">
                  Your verification
                </p>
                <h3 className="mt-1 text-sm font-semibold text-cv-text">
                  Is this issue actually resolved?
                </h3>
                <p className="mt-1 text-xs leading-5 text-cv-text-secondary">
                  Your response determines whether the grievance is closed or returned for further attention.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleSatisfaction("close")}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-cv-success px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading ? "Updating…" : "Yes, close grievance"}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleSatisfaction("escalate")}
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-cv-danger-border bg-cv-surface px-4 py-2.5 text-xs font-semibold text-cv-danger transition hover:bg-cv-danger-soft disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Not satisfied — escalate
                  </button>
                </div>
              </div>
            </div>
          )}
      </section>

      <section className="rounded-cv-xl border border-cv-border bg-cv-surface p-6 shadow-cv-card">
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cv-primary">
            Progress
          </p>

          <h3 className="mt-1.5 text-lg font-semibold text-cv-text">
            Workflow timeline
          </h3>
        </div>

        {currentIssue.timeline?.length ? (
          <div className="space-y-5">
            {currentIssue.timeline.map((event, index) => (
              <div
                key={`${event.time || index}-${index}`}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <span className="mt-1 flex h-3 w-3 shrink-0 rounded-full border-2 border-cv-primary bg-cv-surface" />

                  {index < currentIssue.timeline.length - 1 && (
                    <span className="mt-2 w-px flex-1 bg-cv-border" />
                  )}
                </div>

                <div className="pb-1">
                  <p className="text-sm font-medium text-cv-text">
                    {event.action || "Update"}
                  </p>

                  <p className="mt-1 text-[10px] text-cv-text-subtle">
                    {event.by || "System"} · {formatDate(event.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-cv-text-muted">
            No workflow events yet.
          </p>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                              */
/* -------------------------------------------------------------------------- */

export default function StudentDashboard({ username }) {
  const [issues, setIssues] = useState([]);
  const [myResponses, setMyResponses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  const [selectedIssue, setSelectedIssue] = useState(null);

  const [section, setSection] = useState("profile");

  /* ------------------------------------------------------------------------ */
  /* LOAD GRIEVANCES                                                          */
  /* ------------------------------------------------------------------------ */

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const data = await fetchMyIssues();

      setIssues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load my issues:", error);

      toast.error(
        error?.response?.data?.error ||
          "Unable to load your grievances"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* ------------------------------------------------------------------------ */
  /* LOAD FEEDBACK SUMMARY                                                    */
  /* ------------------------------------------------------------------------ */

  const loadFeedbackSummary = useCallback(async () => {
    try {
      setFeedbackLoading(true);

      const forms = await fetchStudentFeedbackForms();

      const safeForms = Array.isArray(forms) ? forms : [];

      const checks = await Promise.all(
        safeForms.map(async (form) => {
          try {
            const result = await fetchMyFeedbackResponse(form._id);

            return result?.submitted && result?.response
              ? {
                  form,
                  response: result.response,
                }
              : null;
          } catch {
            return null;
          }
        })
      );

      setMyResponses(checks.filter(Boolean));
    } catch (error) {
      console.error(
        "Failed to load feedback summary:",
        error
      );
    } finally {
      setFeedbackLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    loadFeedbackSummary();
  }, [load, loadFeedbackSummary]);

  /* ------------------------------------------------------------------------ */
  /* STATS                                                                     */
  /* ------------------------------------------------------------------------ */

  const stats = useMemo(
    () => ({
      grievances: issues.length,

      actions: issues.filter((i) =>
        ["resolved", "escalated"].includes(i.status)
      ).length,

      active: issues.filter((i) =>
        ["assigned", "accepted", "investigating"].includes(i.status)
      ).length,

      resolved: issues.filter((i) =>
        ["resolved", "verified", "closed"].includes(i.status)
      ).length,

      feedback: myResponses.length,
    }),
    [issues, myResponses]
  );

  /* ------------------------------------------------------------------------ */
  /* PROFILE                                                                   */
  /* ------------------------------------------------------------------------ */

  const profile = useMemo(
    () => ({
      department:
        localStorage.getItem("department") ||
        localStorage.getItem("dept") ||
        "—",

      course:
        localStorage.getItem("course") ||
        localStorage.getItem("program") ||
        "—",

      semester:
        localStorage.getItem("semester") || "—",

      studentId:
        localStorage.getItem("studentId") ||
        localStorage.getItem("rollNumber") ||
        "—",
    }),
    []
  );

  /* ------------------------------------------------------------------------ */
  /* DETAIL VIEW                                                               */
  /* ------------------------------------------------------------------------ */

  if (selectedIssue) {
    return (
      <IssueDetails
        issue={selectedIssue}
        onBack={() => setSelectedIssue(null)}
        onChanged={(updated) => {
          setIssues((current) => current.map((item) =>
            String(item._id || item.id) === String(updated._id || updated.id) ? updated : item
          ));
          setSelectedIssue(updated);
        }}
      />
    );
  }

  /* ------------------------------------------------------------------------ */
  /* NAVIGATION                                                                */
  /* ------------------------------------------------------------------------ */

  const nav = [
    ["issues", "My Grievances", "⚑"],
    ["tasks", "My Tasks", "✓"],
    ["feedback", "My Feedback", "◉"],
    ["profile", "My Profile", "○"],
  ];

  /* ------------------------------------------------------------------------ */
  /* PAGE                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------ */}
      {/* PAGE INTRO                                                          */}
      {/* ------------------------------------------------------------------ */}

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cv-primary">
          Personal campus space
        </p>

        <h1 className="mt-1.5 text-[28px] font-semibold tracking-[-0.035em] text-cv-text md:text-[31px]">
          My Dashboard
        </h1>

        <p className="mt-1 text-xs leading-5 text-cv-text-muted">
          Your grievances, feedback and campus activity in one place.
        </p>
      </div>

      

      {/* ------------------------------------------------------------------ */}
      {/* SECTION NAV                                                         */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid grid-cols-4 gap-2">
        {nav.map(
          ([key, label, icon]) => (
            <button
              key={key}
              onClick={() =>
                setSection(key)
              }
              className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold text-center border transition ${
                section === key
                  ? "bg-cv-primary text-white border-cv-primary shadow-sm"
                  : "bg-cv-surface text-cv-text-muted border-cv-border hover:bg-cv-surface-soft"
              }`}
            >
              <span className="mr-2">
                {icon}
              </span>

              {label}
            </button>
          )
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CONTENT                                                             */}
      {/* ------------------------------------------------------------------ */}

      {loading ? (
        <div className="rounded-cv-xl border border-cv-border bg-cv-surface p-14 text-center shadow-cv-card">
          <div className="mx-auto h-9 w-9 animate-pulse rounded-xl bg-cv-border" />

          <p className="mt-4 text-xs text-cv-text-muted">
            Loading your workspace…
          </p>
        </div>
      ) : section === "issues" ? (
        <MyIssues
          issues={issues}
          onOpen={setSelectedIssue}
        />
      ) : section === "tasks" ? (
        <MyTasks
          items={issues.filter((i) =>
            ["resolved", "escalated"].includes(i.status)
          )}
          onOpen={setSelectedIssue}
        />
      ) : section === "feedback" ? (
        <MyFeedback
          responses={myResponses}
          loading={feedbackLoading}
        />
      ) : (
        <Profile
          username={username}
          profile={profile}
          stats={stats}
        />
      )}
    </div>
  );
}