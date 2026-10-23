import { cv, SANS } from "../../../shared/design-system/inline.js";
import { useState } from "react";
import { CheckCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  publishFeedbackForm,
  closeFeedbackForm,
} from "../../../shared/services/feedback.service.js";
import FeedbackAdminResults  from "../../feedback/components/FeedbackAdminResults.jsx";
import {
  getRawStatusLabel,
  getFilterLabel,
} from "../lib/adminPanelUtils.js";

const FONT_SANS = "var(--cv-font-sans)";

export function StatusBadge({ status }) {
  // Ten statuses share five semantic dots rather than ten arbitrary hues:
  // attention (brass) · in progress (slate) · resolved (moss) · critical (brick) · archived (ink)
  const dotColor = {
    created: "rgb(var(--cv-warning))",
    viewed: "rgb(var(--cv-info))",
    assigned: "rgb(var(--cv-info))",
    accepted: "rgb(var(--cv-info))",
    investigating: "rgb(var(--cv-info))",
    resolved: "rgb(var(--cv-success))",
    verified: "rgb(var(--cv-success))",
    escalated: "rgb(var(--cv-danger))",
    closed: "rgb(var(--cv-text))",
  }[status] || "rgb(var(--cv-info))";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-cv-border bg-cv-surface-soft px-2.5 py-1 text-[11px] font-medium text-cv-text-secondary"
      style={{ fontFamily: FONT_SANS }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: dotColor }}
        aria-hidden="true"
      />
      {getRawStatusLabel(status)}
    </span>
  );
}

export function MetaChip({ children, danger }) {
  return (
    <span
      className={`inline-flex items-center text-[11.5px] px-2.5 py-1 rounded-md font-medium border ${
        danger
          ? "bg-cv-danger-soft text-cv-danger border-cv-danger-border"
          : "bg-cv-surface-soft text-cv-text-secondary border-cv-border"
      }`}
      style={{ fontFamily: FONT_SANS }}
    >
      {children}
    </span>
  );
}

export function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-cv-info">{icon}</span>
      <h3
        className="text-[13px] font-semibold text-cv-text"
        style={{ fontFamily: FONT_SANS }}
      >
        {title}
      </h3>
    </div>
  );
}

export function InfoBox({ label, value }) {
  return (
    <div className="rounded-md border border-cv-border bg-cv-surface-soft p-3.5">
      <p className="text-[11px] text-cv-text-secondary font-medium" style={{ fontFamily: FONT_SANS }}>
        {label}
      </p>
      <p
        className="text-sm text-cv-text font-medium mt-1 break-words"
        style={{ fontFamily: FONT_SANS }}
      >
        {value}
      </p>
    </div>
  );
}

export function EmptyState({ filter }) {
  return (
    <div className="rounded-lg border border-cv-border bg-cv-surface-soft p-12 text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cv-surface-muted flex items-center justify-center">
        <CheckCircle className="w-6 h-6 text-cv-info" />
      </div>
      <p className="text-sm text-cv-text-secondary" style={{ fontFamily: FONT_SANS }}>
        No {getFilterLabel(filter).toLowerCase()} grievances found.
      </p>
    </div>
  );
}

export function EmptyContent({ text }) {
  return (
    <div className="rounded-lg border border-cv-border bg-cv-surface-soft p-10 text-center">
      <p className="text-sm text-cv-text-subtle" style={{ fontFamily: FONT_SANS }}>
        {text}
      </p>
    </div>
  );
}

const feedbackDate = value =>
  value ? new Date(value).toLocaleDateString() : "";

const feedbackStatus = status =>
  String(status || "draft").replace(/_/g, " ");

export function FeedbackAdminPanel({
  feedbackForms,
  loading,
  selectedForm,
  view,
  onCreate,
  onSelect,
  onRefresh,
  onBack,
  showCreateButton = true,
}) {
  if (view === "results" && selectedForm) {
    return <FeedbackAdminResults form={selectedForm} onBack={onBack} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className="text-[22px] sm:text-2xl font-semibold text-cv-text"
            style={{ fontFamily: FONT_SANS }}
          >
            Student Feedback
          </h2>
          <p className="mt-1 text-[13px] text-cv-text-secondary" style={{ fontFamily: FONT_SANS }}>
            Create feedback cycles, collect student responses, and review institutional findings.
          </p>
        </div>
        {showCreateButton && <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 rounded-md bg-cv-text px-5 py-2.5 text-sm font-medium text-cv-surface-soft hover:opacity-90"
          style={{ fontFamily: FONT_SANS }}
        >
          <Plus className="w-4 h-4" />
          Create Feedback
        </button>}
      </div>

      {loading ? (
        <div className="rounded-lg border border-cv-border bg-cv-surface-soft p-10 text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-cv-border border-t-cv-text" />
          <p className="text-sm text-cv-text-secondary" style={{ fontFamily: FONT_SANS }}>
            Loading feedback forms...
          </p>
        </div>
      ) : feedbackForms.length === 0 ? (
        <div className="rounded-lg border border-dashed border-cv-border-strong bg-cv-surface-soft p-10 text-center">
          <h3
            className="text-lg font-semibold text-cv-text"
            style={{ fontFamily: FONT_SANS }}
          >
            No feedback forms yet
          </h3>
          <p className="mt-2 text-sm text-cv-text-secondary" style={{ fontFamily: FONT_SANS }}>
            Create your first structured student feedback cycle.
          </p>
          {showCreateButton && <button
            type="button"
            onClick={onCreate}
            className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-cv-text px-5 py-2.5 text-sm font-medium text-cv-surface-soft hover:opacity-90"
            style={{ fontFamily: FONT_SANS }}
          >
            <Plus className="w-4 h-4" />
            Create Feedback Form
          </button>}
        </div>
      ) : (
        <div className="grid gap-4">
          {feedbackForms.map(form => (
            <FeedbackFormCard
              key={form._id}
              form={form}
              onSelect={onSelect}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FeedbackFormCard({ form, onSelect, onRefresh }) {
  const [busy, setBusy] = useState(false);
  const status = form.status || "draft";

  async function handlePublish() {
    try {
      setBusy(true);
      await publishFeedbackForm(form._id);
      await onRefresh();
      toast.success("Feedback form published.");
    } catch (error) {
      console.error("Failed to publish feedback:", error);
      toast.error(
        error?.response?.data?.error ||
          "Failed to publish feedback form."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleClose() {
    try {
      setBusy(true);
      await closeFeedbackForm(form._id);
      await onRefresh();
      toast.success("Feedback form closed.");
    } catch (error) {
      console.error("Failed to close feedback:", error);
      toast.error(
        error?.response?.data?.error ||
          "Failed to close feedback form."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-cv-border bg-cv-surface-soft p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border border-cv-border bg-cv-surface px-3 py-1 text-[11px] font-medium text-cv-text-secondary"
              style={{ fontFamily: FONT_SANS }}
            >
              {feedbackStatus(status)}
            </span>

            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-cv-text-secondary border border-cv-border bg-cv-surface"
              style={{ fontFamily: FONT_SANS }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: form.anonymous ? cv.success : cv.info }}
                aria-hidden="true"
              />
              {form.anonymous ? "Anonymous" : "Identified"}
            </span>

            {form.category && (
              <span
                className="text-[11px] text-cv-text-secondary"
                style={{ fontFamily: FONT_SANS }}
              >
                {form.category}
              </span>
            )}
          </div>

          <h3
            className="text-lg font-semibold text-cv-text"
            style={{ fontFamily: FONT_SANS }}
          >
            {form.title}
          </h3>

          {form.description && (
            <p
              className="mt-1 line-clamp-2 text-sm text-cv-text-secondary"
              style={{ fontFamily: FONT_SANS }}
            >
              {form.description}
            </p>
          )}

          <div
            className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-cv-text-secondary"
            style={{ fontFamily: FONT_SANS }}
          >
            <span>
              {Array.isArray(form.questions) ? form.questions.length : 0} questions
            </span>
            {form.startDate && (
              <span>Starts {feedbackDate(form.startDate)}</span>
            )}
            {form.endDate && (
              <span>Ends {feedbackDate(form.endDate)}</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {status === "draft" && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={busy}
              className="rounded-md bg-cv-text px-4 py-2 text-sm font-medium text-cv-surface-soft hover:opacity-90 disabled:opacity-50"
              style={{ fontFamily: FONT_SANS }}
            >
              {busy ? "Publishing..." : "Publish"}
            </button>
          )}

          {(status === "published" || status === "active") && (
            <button
              type="button"
              onClick={handleClose}
              disabled={busy}
              className="rounded-md border border-cv-border-strong px-4 py-2 text-sm font-medium text-cv-text hover:bg-cv-surface-muted disabled:opacity-50"
              style={{ fontFamily: FONT_SANS }}
            >
              {busy ? "Closing..." : "Close"}
            </button>
          )}

          {["closed", "completed", "action_taken"].includes(status) && (
            <button
              type="button"
              onClick={() => onSelect(form)}
              className="rounded-md bg-cv-text px-4 py-2 text-sm font-medium text-cv-surface-soft hover:opacity-90"
              style={{ fontFamily: FONT_SANS }}
            >
              View Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}