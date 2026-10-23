import { cv, SANS } from "../../../shared/design-system/inline.js";
// -----------------------------------------------------------------------------
// Same design system as adminPanel.issueRows.js — ink/stone/moss palette,
// Fraunces (headings/numbers) + Inter (UI chrome). See that file's header
// comment for the Google Fonts <link> tag if you haven't added it yet.
//
// Note: SectionTitle and InfoBox are reimplemented locally below rather than
// imported from adminPanel.shared, since they carry most of this modal's
// visual weight — restyling everything around them and leaving those two
// as the old gray/rounded-2xl style would have undone most of the redesign.
// -----------------------------------------------------------------------------

import {
  AlertCircle,
  Building2,
  CheckCircle,
  Clock3,
  Timer,
  User,
  X,
} from "lucide-react";

import { StatusBadge } from "./AdminShared.jsx";

import { SLAIndicator } from "./AdminIssueRows.jsx";

import {
  formatDateTime,
  getRawStatusLabel,
  getReportCount,
  hasSLA,
  capitalize,
} from "../lib/adminPanelUtils.js";


export function IssueDetailsModal({
  issue,
  open,
  onClose,
}) {
  if (!open || !issue) return null;

  const assignedTo =
    issue.assignedTo?.name ||
    issue.assignedTo?.username ||
    "Not assigned";

  const reportCount = getReportCount(issue.reports);
  const id = issue._id ?? issue.id;
  const shortId = String(id || "").slice(-6).toUpperCase();
  const ref = shortId ? `GRV-${shortId}` : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgb(var(--cv-text) / 0.45)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="bg-cv-surface rounded-xl w-full max-w-4xl max-h-[92vh] overflow-y-auto"
        style={{ boxShadow: "var(--cv-shadow-lg)" }}
      >
        {/* HEADER */}
        <div
          className="sticky top-0 z-10 bg-cv-surface border-b px-6 py-5 flex items-start justify-between gap-4"
          style={{ borderColor: cv.border }}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
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

            <h2 className="text-xl font-medium" style={{ ...SANS, color: cv.text }}>
              {issue.title || "Untitled Grievance"}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close details"
            className="w-9 h-9 shrink-0 rounded-md flex items-center justify-center transition-colors"
            style={{ background: cv.surfaceSoft }}
            onMouseEnter={(e) => (e.currentTarget.style.background = cv.border)}
            onMouseLeave={(e) => (e.currentTarget.style.background = cv.surfaceSoft)}
          >
            <X className="w-4 h-4" style={{ color: cv.textSecondary }} />
          </button>
        </div>

        <div className="p-6 space-y-7">
          {/* CASE SUMMARY */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoBox label="Status" value={getRawStatusLabel(issue.status)} />
            <InfoBox label="Priority" value={capitalize(issue.priority || "Medium")} />
            <InfoBox label="Category" value={issue.category || "General"} />
            <InfoBox label="Reports" value={String(reportCount)} numeric />
          </div>

          {/* DESCRIPTION */}
          <section>
            <SectionTitle icon={<AlertCircle className="w-4 h-4" />} title="Description" />

            <div
              className="rounded-lg border p-4"
              style={{ background: cv.surfaceSoft, borderColor: cv.border }}
            >
              <p className="text-sm leading-7 whitespace-pre-wrap" style={{ color: cv.textSecondary }}>
                {issue.text || "No description available."}
              </p>
            </div>
          </section>

          {/* SUBMISSION */}
          <section>
            <SectionTitle icon={<User className="w-4 h-4" />} title="Submission information" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoBox
                label="Submitted by"
                value={issue.anonymous ? "Anonymous" : issue.user || "Unknown"}
              />
              <InfoBox label="Submitted on" value={formatDateTime(issue.createdAt)} />
              <InfoBox label="Category" value={issue.category || "General"} />
              <InfoBox label="Priority" value={capitalize(issue.priority || "Medium")} />
            </div>
          </section>

          {/* WORKFLOW */}
          <section>
            <SectionTitle icon={<Building2 className="w-4 h-4" />} title="Workflow information" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoBox label="Department" value={issue.department || "Not assigned"} />
              <InfoBox label="Assigned to" value={assignedTo} />
              <InfoBox label="Assigned by" value={issue.assignedBy || "Not assigned"} />
              <InfoBox
                label="Expected resolution"
                value={
                  issue.expectedResolutionDays
                    ? `${issue.expectedResolutionDays} days`
                    : "Not set"
                }
              />
              <InfoBox
                label="Assigned at"
                value={issue.assignedAt ? formatDateTime(issue.assignedAt) : "Not assigned"}
              />
              <InfoBox label="Last updated" value={formatDateTime(issue.updatedAt)} />
            </div>
          </section>

          {/* SLA */}
          {hasSLA(issue) && (
            <section>
              <SectionTitle icon={<Timer className="w-4 h-4" />} title="Resolution SLA" />

              <div
                className="rounded-lg border p-4"
                style={{ background: cv.surfaceSoft, borderColor: cv.border }}
              >
                <SLAIndicator issue={issue} />
              </div>
            </section>
          )}

          {/* RESOLUTION */}
          {issue.resolutionNote && (
            <section>
              <SectionTitle icon={<CheckCircle className="w-4 h-4" />} title="Resolution" />

              <div
                className="rounded-lg border p-4"
                style={{ background: cv.primarySoft, borderColor: cv.primaryBorder }}
              >
                <p className="text-sm leading-6 whitespace-pre-wrap" style={{ color: cv.primaryHover }}>
                  {issue.resolutionNote}
                </p>
              </div>
            </section>
          )}

          {/* TIMELINE */}
          {Array.isArray(issue.timeline) && issue.timeline.length > 0 && (
            <section>
              <SectionTitle icon={<Clock3 className="w-4 h-4" />} title="Workflow timeline" />

              <div className="rounded-lg border overflow-hidden" style={{ borderColor: cv.border }}>
                {issue.timeline.map((event, index) => (
                  <div
                    key={`${event.action}-${index}`}
                    className="flex items-start gap-4 p-4 border-b last:border-b-0"
                    style={{ borderColor: cv.border }}
                  >
                    <div
                      className="w-8 h-8 shrink-0 rounded-md flex items-center justify-center"
                      style={{ background: cv.primarySoft, color: cv.primary }}
                    >
                      <Clock3 className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium" style={{ color: cv.text }}>
                        {event.action}
                      </p>

                      <p className="text-xs mt-1" style={{ color: cv.textSecondary }}>
                        {event.by || "System"}
                        {event.role ? ` (${event.role})` : ""}
                      </p>

                      {event.time && (
                        <p className="text-xs mt-1" style={{ color: cv.textMuted }}>
                          {formatDateTime(event.time)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
        style={{ background: cv.primarySoft, color: cv.primary }}
      >
        {icon}
      </div>
      <h3 className="text-sm font-medium" style={{ color: cv.text }}>
        {title}
      </h3>
      <div className="flex-1 h-px" style={{ background: cv.border }} />
    </div>
  );
}

function InfoBox({ label, value, numeric }) {
  return (
    <div
      className="rounded-lg border p-3"
      style={{ borderColor: cv.border, background: cv.surface }}
    >
      <p className="text-[11px] font-medium" style={{ color: cv.textMuted }}>
        {label}
      </p>
      <p
        className={numeric ? "text-lg font-medium mt-1" : "text-sm font-medium mt-1"}
        style={numeric ? { ...SANS, color: cv.text } : { color: cv.text }}
      >
        {value}
      </p>
    </div>
  );
}