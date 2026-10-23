import { cv, SANS } from "../../../shared/design-system/inline.js";
// -----------------------------------------------------------------------------
// Design system notes (apply once, project-wide):
// - Add to your index.html <head>, or import in your global CSS:
//     <link rel="preconnect" href="https://fonts.googleapis.com">
//     <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
//   Fraunces carries the headings/numbers, Inter carries UI chrome. Falls back
//   to Georgia/system-ui cleanly if the fonts aren't loaded yet.
// - Palette (ink/stone/moss — warm, muted, editorial rather than default SaaS
//   purple-and-gray): see the hex values inline below. If you'd rather have
//   these as Tailwind theme tokens, they map cleanly to a `colors.ink/stone/
//   moss/ochre/brick/steel` extension.
// -----------------------------------------------------------------------------

import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle,
  ChevronRight,
  Clock3,
  Eye,
  Flag,
  Tag,
  Timer,
  Trash2,
  User,
  UserCheck,
} from "lucide-react";

import {
  formatDateTime,
  isIssueOverdue,
  getReportCount,
  hasSLA,
} from "../lib/adminPanelUtils.js";
import { StatusBadge } from "./AdminShared.jsx";


export function IssueRow({
  issue,
  onDelete,
  onClose,
  onView,
  onWorkflow,
}) {
  const id = issue._id ?? issue.id;
  const overdue = isIssueOverdue(issue);
  const priority = String(issue.priority || "medium").toLowerCase();
  const reports = getReportCount(issue.reports);
  const assigned = issue.assignedTo?.name || issue.assignedTo?.username;

  const shortId = String(id || "").slice(-6).toUpperCase();
  const ref = shortId ? `GRV-${shortId}` : null;

  const accent = overdue
    ? cv.danger
    : priority === "high"
      ? cv.warning
      : "transparent";

  return (
    <div
      className="bg-cv-surface rounded-lg border transition-shadow p-5"
      style={{
        borderColor: cv.border,
        borderLeft: `3px solid ${accent}`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = cv.borderStrong)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = cv.border)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            {ref && (
              <span
                className="text-[11px] tracking-wide"
                style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: cv.textMuted }}
              >
                {ref}
              </span>
            )}
            <StatusBadge status={issue.status} />
          </div>

          <h3
            className="text-lg font-medium leading-snug"
            style={{ ...SANS, color: cv.text }}
          >
            {issue.title || "Untitled Grievance"}
          </h3>

          {(priority === "high" || overdue) && (
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              {priority === "high" && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium"
                  style={{ color: cv.warning }}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  High priority
                </span>
              )}
              {overdue && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-medium"
                  style={{ color: cv.danger }}
                >
                  <Timer className="w-3.5 h-3.5" />
                  Overdue
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className="hidden sm:flex shrink-0 items-center gap-1.5 text-xs"
          style={{ color: cv.textMuted }}
        >
          <Clock3 className="w-3.5 h-3.5" />
          {formatDateTime(issue.createdAt)}
        </div>
      </div>

      <p
        className="text-sm leading-relaxed mt-3 line-clamp-2"
        style={{ color: cv.textSecondary }}
      >
        {issue.text || "No description available."}
      </p>

      <div className="flex flex-wrap gap-2 mt-4">
        <MetaTag icon={<User className="w-3 h-3" />}>
          {issue.anonymous ? "Anonymous" : issue.user || "Unknown"}
        </MetaTag>

        <MetaTag icon={<Tag className="w-3 h-3" />}>
          {issue.category || "General"}
        </MetaTag>

        {issue.department && (
          <MetaTag icon={<Building2 className="w-3 h-3" />}>
            {issue.department}
          </MetaTag>
        )}

        {assigned && (
          <MetaTag icon={<UserCheck className="w-3 h-3" />}>
            {assigned}
          </MetaTag>
        )}

        {reports > 0 && (
          <MetaTag
            icon={<Flag className="w-3 h-3" />}
            tone="brick"
          >
            {reports} report{reports !== 1 ? "s" : ""}
          </MetaTag>
        )}
      </div>

      {hasSLA(issue) && (
        <div className="mt-4 pt-3.5 border-t" style={{ borderColor: cv.border }}>
          <SLAIndicator issue={issue} />
        </div>
      )}

      <div
        className="sm:hidden mt-3 text-xs flex items-center gap-1.5"
        style={{ color: cv.textMuted }}
      >
        <CalendarDays className="w-3.5 h-3.5" />
        {formatDateTime(issue.createdAt)}
      </div>

      <div
        className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t"
        style={{ borderColor: cv.border }}
      >
        <ActionButton
          onClick={onView}
          icon={<Eye className="w-3.5 h-3.5" />}
          label="View details"
        />

        {onWorkflow && (
          <ActionButton
            onClick={onWorkflow}
            label="Manage workflow"
            tone="primary"
          />
        )}

        {onClose && (
          <ActionButton
            onClick={() => onClose(id)}
            icon={<CheckCircle className="w-3.5 h-3.5" />}
            label="Close grievance"
            tone="green"
          />
        )}

        {onDelete && (
          <ActionButton
            onClick={() => onDelete(id)}
            icon={<Trash2 className="w-3.5 h-3.5" />}
            label="Delete"
            tone="gray"
          />
        )}
      </div>
    </div>
  );
}

export function AttentionRow({ issue, onView }) {
  const overdue = isIssueOverdue(issue);
  const priority = String(issue.priority || "medium").toLowerCase();

  const reason = overdue
    ? "SLA overdue"
    : issue.status === "escalated"
      ? "Escalated grievance"
      : priority === "high"
        ? "High priority"
        : issue.status === "assigned"
          ? "Awaiting employee action"
          : "Unresolved for several days";

  const tone = overdue || issue.status === "escalated" ? "brick" : "ochre";
  const iconBg = tone === "brick" ? cv.dangerSoft : cv.warningSoft;
  const iconColor = tone === "brick" ? cv.danger : cv.warning;

  return (
    <button
      onClick={onView}
      className="w-full text-left px-5 py-3.5 flex items-center gap-4 transition-colors"
      style={{ background: "transparent" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = cv.surfaceSoft)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
        style={{ background: iconBg, color: iconColor }}
      >
        <AlertTriangle className="w-4 h-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-medium truncate"
          style={{ color: cv.text }}
        >
          {issue.title || "Untitled Grievance"}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-1">
          <StatusBadge status={issue.status} />
          <span className="text-xs font-medium" style={{ color: iconColor }}>
            {reason}
          </span>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 shrink-0" style={{ color: cv.textMuted }} />
    </button>
  );
}

export function StatusButton({
  label,
  count,
  active,
  onClick,
  danger,
}) {
  const activeBg = danger ? cv.danger : cv.primary;
  const idleColor = danger ? cv.danger : cv.textSecondary;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3.5 py-2.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors"
      style={
        active
          ? { background: activeBg, color: cv.textInverse }
          : { background: "transparent", color: idleColor }
      }
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = danger ? cv.dangerSoft : cv.surfaceSoft;
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      {label}
      <span
        className="text-[11px] min-w-[22px] text-center px-1.5 py-0.5 rounded font-semibold"
        style={
          active
            ? { background: "rgb(var(--cv-surface) / 0.22)", color: cv.textInverse }
            : { background: danger ? cv.dangerSoft : cv.surfaceSoft, color: idleColor }
        }
      >
        {count}
      </span>
    </button>
  );
}

const metricTones = {
  amber: { fg: cv.warning, bg: cv.warningSoft },
  blue: { fg: cv.info, bg: cv.infoSoft },
  purple: { fg: cv.primary, bg: cv.primarySoft },
  red: { fg: cv.danger, bg: cv.dangerSoft },
};

export function MiniMetric({
  label,
  value,
  icon,
  tone,
}) {
  const t = metricTones[tone] || metricTones.purple;

  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: cv.border, background: cv.surface }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-medium leading-none" style={{ ...SANS, color: cv.text }}>
            {value}
          </p>
          <p className="text-[11px] font-medium mt-1.5" style={{ color: cv.textMuted }}>
            {label}
          </p>
        </div>
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
          style={{ background: t.bg, color: t.fg }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

const actionTones = {
  default: {
    color: cv.textSecondary,
    border: cv.border,
    bg: "transparent",
    hoverBg: cv.surfaceSoft,
  },
  green: {
    color: cv.primary,
    border: cv.primaryBorder,
    bg: "transparent",
    hoverBg: cv.primarySoft,
  },
  primary: {
    color: cv.textInverse,
    border: cv.primary,
    bg: cv.primary,
    hoverBg: cv.primaryHover,
  },
  gray: {
    color: cv.textMuted,
    border: cv.border,
    bg: "transparent",
    hoverBg: cv.dangerSoft,
    hoverColor: cv.danger,
    hoverBorder: cv.dangerSoft,
  },
};

export function ActionButton({
  onClick,
  icon,
  label,
  tone = "default",
}) {
  const t = actionTones[tone] || actionTones.default;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border font-medium transition-colors"
      style={{ color: t.color, borderColor: t.border, background: t.bg }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = t.hoverBg;
        if (t.hoverColor) e.currentTarget.style.color = t.hoverColor;
        if (t.hoverBorder) e.currentTarget.style.borderColor = t.hoverBorder;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = t.bg;
        e.currentTarget.style.color = t.color;
        e.currentTarget.style.borderColor = t.border;
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export function SLAIndicator({ issue }) {
  const expected = Number(issue.expectedResolutionDays);
  if (!expected || !issue.assignedAt) return null;

  const start = new Date(issue.assignedAt).getTime();
  const day = 86400000;
  const total = expected * day;
  const due = start + total;
  const now = Date.now();
  const elapsed = Math.max(0, now - start);
  const percentage = Math.min(100, Math.round((elapsed / total) * 100));
  const overdue = now > due;

  const days = Math.ceil(Math.abs((due - now) / day));

  const label = overdue
    ? `Overdue by ${days} day${days !== 1 ? "s" : ""}`
    : days <= 1
      ? "Due within 1 day"
      : `${days} days remaining`;

  const barColor = overdue
    ? cv.danger
    : percentage >= 80
      ? cv.warning
      : cv.primary;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-1.5">
          <Timer
            className="w-3.5 h-3.5"
            style={{ color: overdue ? cv.danger : cv.textMuted }}
          />
          <span className="text-[11px] font-medium" style={{ color: cv.textSecondary }}>
            SLA
          </span>
        </div>

        <span
          className="text-[11px] font-semibold"
          style={{ color: overdue ? cv.danger : cv.textSecondary }}
        >
          {label}
        </span>
      </div>

      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: cv.surfaceSoft }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

function MetaTag({ icon, tone, children }) {
  const isBrick = tone === "brick";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium"
      style={
        isBrick
          ? { background: cv.dangerSoft, borderColor: cv.dangerSoft, color: cv.danger }
          : { background: cv.surfaceSoft, borderColor: cv.border, color: cv.textSecondary }
      }
    >
      <span style={{ opacity: 0.75 }}>{icon}</span>
      {children}
    </span>
  );
}
