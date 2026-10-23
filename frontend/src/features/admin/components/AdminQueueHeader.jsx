import { AlertTriangle, ChevronDown, Timer, Users, Eye } from "lucide-react";
import { cv, SANS } from "../../../shared/design-system/inline.js";
import { StatusBadge } from "./AdminShared.jsx";
import { ActionButton } from "./AdminIssueRows.jsx";
import { getAttentionReason } from "../lib/adminPanelUtils.js";

/* =========================================================
   QUEUE HEADER — title + overdue/total summary chips
========================================================= */

export function QueueHeader({ totalIssues, overdueCount }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-medium" style={{ ...SANS, color: cv.text }}>
          Grievance management
        </h2>
        <p className="text-sm mt-1" style={{ color: cv.textSecondary }}>
          Monitor, review and manage the complete grievance lifecycle.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <SummaryChip
          icon={<Timer className="w-3.5 h-3.5" />}
          label={`${overdueCount} overdue`}
          tone="brick"
        />
        <SummaryChip
          icon={<Users className="w-3.5 h-3.5" />}
          label={`${totalIssues} total`}
          tone="stone"
        />
      </div>
    </div>
  );
}

function SummaryChip({ icon, label, tone }) {
  const isBrick = tone === "brick";
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-md border text-xs font-medium"
      style={
        isBrick
          ? { background: cv.dangerSoft, borderColor: cv.dangerSoft, color: cv.danger }
          : { background: cv.surfaceSoft, borderColor: cv.border, color: cv.textSecondary }
      }
    >
      {icon}
      {label}
    </div>
  );
}

/* =========================================================
   NEEDS ATTENTION — collapsible banner + per-case detail
========================================================= */

export function AttentionPanel({
  issues,
  expanded,
  onToggle,
  expandedIssueId,
  onToggleIssue,
  onView,
  onManageWorkflow,
}) {
  if (issues.length === 0) return null;

  return (
    <div
      className="bg-cv-surface border rounded-lg overflow-hidden"
      style={{ borderColor: cv.warningSoft }}
    >
      <button
        onClick={onToggle}
        className="w-full px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4 text-left transition-colors"
        style={{ background: cv.warningSoft }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
            style={{ background: cv.surface, color: cv.warning }}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-medium" style={{ color: cv.text }}>
                Needs attention
              </h3>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: cv.surface, color: cv.warning }}
              >
                {issues.length}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: cv.textSecondary }}>
              {expanded ? "Cases requiring administrative attention" : "Potentially delayed or escalated cases"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:block text-xs font-medium" style={{ color: cv.warning }}>
            {expanded ? "Collapse" : "Expand"}
          </span>
          <ChevronDown
            className="w-4 h-4 transition-transform duration-200"
            style={{ color: cv.warning, transform: expanded ? "rotate(180deg)" : "none" }}
          />
        </div>
      </button>

      {expanded && (
        <div>
          {issues.map((issue) => (
            <AttentionCase
              key={issue._id ?? issue.id}
              issue={issue}
              expanded={expandedIssueId === (issue._id ?? issue.id)}
              onToggle={() => onToggleIssue(issue._id ?? issue.id)}
              onView={() => onView(issue)}
              onManageWorkflow={() => onManageWorkflow(issue)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const WORKFLOW_STATUSES = [
  "created",
  "viewed",
  "assigned",
  "accepted",
  "investigating",
  "resolved",
  "verified",
  "escalated",
];

function AttentionCase({ issue, expanded, onToggle, onView, onManageWorkflow }) {
  const priority = String(issue.priority || "medium").toLowerCase();

  return (
    <div className="border-t" style={{ borderColor: cv.border }}>
      <button
        onClick={onToggle}
        className="w-full px-5 sm:px-6 py-3.5 flex items-center gap-3 text-left transition-colors"
        onMouseEnter={(e) => (e.currentTarget.style.background = cv.surfaceSoft)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
          style={{ background: cv.warningSoft, color: cv.warning }}
        >
          <AlertTriangle className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium truncate" style={{ color: cv.text }}>
              {issue.title || "Untitled Grievance"}
            </p>
            <StatusBadge status={issue.status} />
            {priority === "high" && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ color: cv.danger, background: cv.dangerSoft }}
              >
                High priority
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: cv.warning }}>
            {getAttentionReason(issue)}
          </p>
        </div>

        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform"
          style={{ color: expanded ? cv.primary : cv.textMuted, transform: expanded ? "rotate(180deg)" : "none" }}
        />
      </button>

      {expanded && (
        <div className="px-5 sm:px-6 pb-4 pl-16">
          <div
            className="rounded-lg border p-4"
            style={{ background: cv.surfaceSoft, borderColor: cv.border }}
          >
            <p className="text-sm leading-relaxed" style={{ color: cv.textSecondary }}>
              {issue.text || "No description available."}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              <ActionButton icon={<Eye className="w-3.5 h-3.5" />} label="View details" onClick={onView} />
              {WORKFLOW_STATUSES.includes(issue.status) && (
                <ActionButton label="Manage workflow" tone="primary" onClick={onManageWorkflow} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}