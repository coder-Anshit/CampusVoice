import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Tag,
  MessageSquareText,
  Search,
  X,
  Check,
  Loader2,
  Pencil,
  Copy,
  Printer,
  Smile,
  Meh,
  Frown,
  ClipboardList,
  ArrowUpDown,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| COLOR IDENTITY
|--------------------------------------------------------------------------
| Every category gets a consistent, deterministic accent color derived
| from its name/id. This keeps categories visually distinguishable at a
| glance across the app instead of every card looking identical.
*/

const CATEGORY_PALETTES = [
  { chip: "bg-cv-primary-soft text-cv-primary ring-cv-primary/20", bar: "from-cv-primary to-cv-primary-hover", dot: "bg-cv-primary", icon: "text-cv-primary bg-cv-primary-soft", border: "border-cv-primary-border", tint: "bg-cv-primary-soft/60" },
  { chip: "bg-cv-info-soft text-cv-info ring-cv-info/20", bar: "from-cv-info to-cv-primary", dot: "bg-cv-info", icon: "text-cv-info bg-cv-info-soft", border: "border-cv-info-border", tint: "bg-cv-info-soft/60" },
  { chip: "bg-cv-warning-soft text-cv-warning ring-cv-warning/20", bar: "from-cv-warning to-cv-accent", dot: "bg-cv-warning", icon: "text-cv-warning bg-cv-warning-soft", border: "border-cv-warning-border", tint: "bg-cv-warning-soft/60" },
  { chip: "bg-cv-danger-soft text-cv-danger ring-cv-danger/20", bar: "from-cv-danger to-cv-primary", dot: "bg-cv-danger", icon: "text-cv-danger bg-cv-danger-soft", border: "border-cv-danger-border", tint: "bg-cv-danger-soft/60" },
  { chip: "bg-cv-success-soft text-cv-success ring-cv-success/20", bar: "from-cv-success to-cv-info", dot: "bg-cv-success", icon: "text-cv-success bg-cv-success-soft", border: "border-cv-success-border", tint: "bg-cv-success-soft/60" },
  { chip: "bg-cv-accent-soft text-cv-primary ring-cv-accent/20", bar: "from-cv-accent to-cv-primary", dot: "bg-cv-accent", icon: "text-cv-primary bg-cv-accent-soft", border: "border-cv-primary-border", tint: "bg-cv-accent-soft/60" },
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getPalette(category) {
  const key = String(category?._id || category?.name || category?.title || "default");
  return CATEGORY_PALETTES[hashString(key) % CATEGORY_PALETTES.length];
}

/*
|--------------------------------------------------------------------------
| STATUS / SENTIMENT META
|--------------------------------------------------------------------------
*/

const ACTION_STATUS_OPTIONS = ["pending", "in_progress", "resolved", "on_hold"];

const STATUS_META = {
  pending: { label: "Pending", chip: "bg-cv-warning-soft text-cv-warning ring-cv-warning/20", dot: "bg-cv-warning" },
  in_progress: { label: "In Progress", chip: "bg-cv-info-soft text-cv-info ring-cv-info/20", dot: "bg-cv-info-soft0" },
  resolved: { label: "Resolved", chip: "bg-cv-success-soft text-cv-success ring-cv-success/20", dot: "bg-cv-success" },
  completed: { label: "Resolved", chip: "bg-cv-success-soft text-cv-success ring-cv-success/20", dot: "bg-cv-success" },
  on_hold: { label: "On Hold", chip: "bg-cv-surface-muted text-cv-text-secondary ring-cv-border", dot: "bg-cv-border-strong" },
};

const SENTIMENT_META = {
  positive: { label: "Positive", chip: "bg-cv-success-soft text-cv-success ring-cv-success/20", bar: "bg-cv-success", Icon: Smile },
  neutral: { label: "Neutral", chip: "bg-cv-surface-muted text-cv-text-secondary ring-cv-border", bar: "bg-cv-border-strong", Icon: Meh },
  negative: { label: "Negative", chip: "bg-cv-danger-soft text-cv-danger ring-cv-danger/20", bar: "bg-cv-danger", Icon: Frown },
};

function formatStatus(status) {
  if (!status) return "";
  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function FeedbackCategoryView({
  category,
  onBack,
  // async (categoryId, conclusionText) => void
  onSaveConclusion,
  // async (categoryId, newStatus) => void
  onUpdateActionStatus,
}) {
  const [expanded, setExpanded] = useState(true);

  // ---- Conclusion editing state -----------------------------------------
  const [savedConclusion, setSavedConclusion] = useState(category?.conclusion || "");
  const [isEditingConclusion, setIsEditingConclusion] = useState(false);
  const [draftConclusion, setDraftConclusion] = useState(category?.conclusion || "");
  const [savingConclusion, setSavingConclusion] = useState(false);
  const [conclusionSaved, setConclusionSaved] = useState(false);
  const [conclusionError, setConclusionError] = useState(null);

  useEffect(() => {
    setSavedConclusion(category?.conclusion || "");
    setIsEditingConclusion(false);
    setConclusionError(null);
  }, [category?._id]);

  const handleStartEditConclusion = () => {
    setDraftConclusion(savedConclusion);
    setConclusionError(null);
    setIsEditingConclusion(true);
  };

  const handleCancelEditConclusion = () => {
    setIsEditingConclusion(false);
    setConclusionError(null);
  };

  const handleSaveConclusion = async () => {
    const trimmed = draftConclusion.trim();

    if (!onSaveConclusion) {
      console.warn("FeedbackCategoryView: no onSaveConclusion handler provided.");
      setIsEditingConclusion(false);
      return;
    }

    try {
      setSavingConclusion(true);
      setConclusionError(null);

      await onSaveConclusion(category._id, trimmed);

      setSavedConclusion(trimmed);
      setIsEditingConclusion(false);
      setConclusionSaved(true);
      setTimeout(() => setConclusionSaved(false), 2500);
    } catch (error) {
      console.error("Failed to save conclusion:", error);
      setConclusionError("Couldn't save the conclusion. Try again.");
    } finally {
      setSavingConclusion(false);
    }
  };

  // ---- Action status state ------------------------------------------------
  const initialActionStatus =
    typeof category?.action === "object" ? category.action?.status : undefined;
  const [actionStatus, setActionStatus] = useState(initialActionStatus);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    setActionStatus(typeof category?.action === "object" ? category.action?.status : undefined);
  }, [category?._id]);

  const handleStatusChange = async (newStatus) => {
    const previous = actionStatus;
    setActionStatus(newStatus);

    if (!onUpdateActionStatus) return;

    try {
      setSavingStatus(true);
      await onUpdateActionStatus(category._id, newStatus);
    } catch (error) {
      console.error("Failed to update action status:", error);
      setActionStatus(previous);
    } finally {
      setSavingStatus(false);
    }
  };

  // ---- Copy / print ---------------------------------------------------
  const [copied, setCopied] = useState(false);

  const handleCopySummary = async () => {
    const lines = [
      `Feedback category: ${category?.name || category?.title || "Untitled"}`,
      "",
      "Common finding:",
      category?.commonFinding || category?.summary || "—",
      "",
      "Administration conclusion:",
      savedConclusion || "—",
      "",
      "Action taken:",
      typeof category?.action === "object"
        ? category.action?.description || "—"
        : category?.action || "—",
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  if (!category) {
    return (
      <div className="rounded-2xl border border-cv-border bg-cv-surface p-8 text-center shadow-sm">
        <Tag size={36} className="mx-auto mb-3 text-cv-text-subtle" />
        <p className="text-sm text-cv-text-muted">Feedback category not found.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cv-border-strong px-4 py-2.5 text-sm font-medium text-cv-text-secondary hover:bg-cv-surface-soft"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>
    );
  }

  const palette = getPalette(category);

  /*
  |--------------------------------------------------------------------------
  | NORMALIZE RESPONSES
  |--------------------------------------------------------------------------
  */

  const responses = useMemo(() => {
    return Array.isArray(category.responses) ? category.responses : [];
  }, [category.responses]);

  const responseCount = category.responseCount ?? responses.length;

  const categoryName = category.name || category.title || "Untitled Category";
  const commonFinding =
    category.commonFinding || category.summary || "No common finding has been added yet.";

  // ---- Sentiment breakdown (only shown if data is present) ---------------
  const sentimentCounts = useMemo(() => {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    let any = false;
    responses.forEach((r) => {
      const s = typeof r === "object" ? r?.sentiment : undefined;
      if (s && counts[s] !== undefined) {
        counts[s] += 1;
        any = true;
      }
    });
    return any ? counts : null;
  }, [responses]);

  // ---- Search / filter / sort / pagination for responses -----------------
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery, sentimentFilter, sortOrder, category?._id]);

  const getResponseText = (response) =>
    typeof response === "string"
      ? response
      : response?.text || response?.response || response?.answer || "";

  const filteredResponses = useMemo(() => {
    let list = responses.map((response, index) => ({ response, index }));

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(({ response }) => getResponseText(response).toLowerCase().includes(q));
    }

    if (sentimentFilter) {
      list = list.filter(
        ({ response }) => typeof response === "object" && response?.sentiment === sentimentFilter
      );
    }

    if (sortOrder === "longest") {
      list = [...list].sort(
        (a, b) => getResponseText(b.response).length - getResponseText(a.response).length
      );
    } else if (sortOrder === "shortest") {
      list = [...list].sort(
        (a, b) => getResponseText(a.response).length - getResponseText(b.response).length
      );
    }

    return list;
  }, [responses, searchQuery, sentimentFilter, sortOrder]);

  const visibleResponses = filteredResponses.slice(0, visibleCount);
  const hasMore = filteredResponses.length > visibleResponses.length;
  const isFiltering = searchQuery.trim() || sentimentFilter;

  return (
    <div className="mx-auto max-w-4xl">
      {/* ====================================================
          BACK + UTILITIES
      ==================================================== */}

      <div className="mb-5 flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-cv-text-secondary hover:text-cv-text"
        >
          <ArrowLeft size={16} />
          Back to Feedback Results
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cv-border bg-cv-surface px-3 py-1.5 text-xs font-medium text-cv-text-secondary hover:bg-cv-surface-soft"
          >
            {copied ? <Check size={14} className="text-cv-success" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy summary"}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cv-border bg-cv-surface px-3 py-1.5 text-xs font-medium text-cv-text-secondary hover:bg-cv-surface-soft"
          >
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      {/* ====================================================
          CATEGORY HEADER
      ==================================================== */}

      <div className="mb-5 overflow-hidden rounded-2xl border border-cv-border bg-cv-surface shadow-sm">
        <div className={`h-1.5 bg-gradient-to-r ${palette.bar}`} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${palette.icon}`}>
                <Tag size={20} />
              </span>
              <div>
                <p className="text-xs font-medium text-cv-text-subtle">Feedback category</p>
                <h1 className="mt-0.5 font-serif text-2xl font-bold leading-tight text-cv-text">
                  {categoryName}
                </h1>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-cv-bg px-4 py-3">
              <p className="text-xs text-cv-text-muted">Responses</p>
              <p className="mt-1 text-xl font-bold text-cv-text">{responseCount}</p>
            </div>

            {typeof category.action === "object" && actionStatus && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset ${
                  STATUS_META[actionStatus]?.chip || STATUS_META.pending.chip
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[actionStatus]?.dot || STATUS_META.pending.dot}`} />
                {STATUS_META[actionStatus]?.label || formatStatus(actionStatus)}
              </span>
            )}

            {sentimentCounts && (
              <div className="flex items-center gap-1.5">
                {Object.entries(sentimentCounts)
                  .filter(([, count]) => count > 0)
                  .map(([key, count]) => {
                    const meta = SENTIMENT_META[key];
                    return (
                      <span
                        key={key}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.chip}`}
                      >
                        <meta.Icon size={12} />
                        {count}
                      </span>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Sentiment distribution bar */}
          {sentimentCounts && (
            <div className="mt-4 flex h-1.5 w-full overflow-hidden rounded-full bg-cv-surface-muted">
              {Object.entries(sentimentCounts).map(([key, count]) =>
                count > 0 ? (
                  <div
                    key={key}
                    className={SENTIMENT_META[key].bar}
                    style={{ width: `${(count / responseCount) * 100}%` }}
                  />
                ) : null
              )}
            </div>
          )}
        </div>
      </div>

      {/* ====================================================
          COMMON FINDING
      ==================================================== */}

      <div className={`mb-5 rounded-2xl border ${palette.border} ${palette.tint} p-6`}>
        <div className="mb-3 flex items-center gap-2">
          <MessageSquareText size={18} className="text-cv-text-muted" />
          <h2 className="text-base font-semibold text-cv-text">Common Finding</h2>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6 text-cv-text-secondary">{commonFinding}</p>
      </div>

      {/* ====================================================
          RESPONSES
      ==================================================== */}

      <div className="rounded-2xl border border-cv-border bg-cv-surface shadow-sm">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between gap-4 border-b border-cv-border px-6 py-4 text-left hover:bg-cv-surface-soft"
        >
          <div className="flex items-center gap-3">
            <span className="transition-transform duration-200" style={{ transform: expanded ? "rotate(0deg)" : "rotate(-90deg)" }}>
              <ChevronDown size={18} className="text-cv-text-muted" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-cv-text">Student Responses</h2>
              <p className="mt-0.5 text-xs text-cv-text-muted">
                {responseCount} response{responseCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </button>

        {expanded && (
          <div className="p-6">
            {responses.length === 0 ? (
              <div className="rounded-xl border border-cv-border bg-cv-bg p-6 text-center">
                <MessageSquareText size={32} className="mx-auto mb-2 text-cv-text-subtle" />
                <p className="text-sm text-cv-text-muted">
                  No responses have been assigned to this category yet.
                </p>
              </div>
            ) : (
              <>
                {/* Toolbar: search / sentiment filter / sort */}
                <div className="mb-4 flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cv-text-subtle" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search responses…"
                      className="w-full rounded-lg border border-cv-border bg-cv-bg py-2 pl-9 pr-8 text-sm text-cv-text-secondary placeholder:text-cv-text-subtle focus:border-cv-border-strong focus:bg-cv-surface focus:outline-none focus:ring-2 focus:ring-cv-border"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cv-text-subtle hover:text-cv-text-secondary"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {sentimentCounts && (
                      <div className="flex items-center gap-1">
                        {Object.keys(SENTIMENT_META).map((key) => {
                          if (!sentimentCounts[key]) return null;
                          const meta = SENTIMENT_META[key];
                          const active = sentimentFilter === key;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSentimentFilter(active ? null : key)}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset transition-colors ${
                                active ? meta.chip : "bg-cv-surface text-cv-text-subtle ring-cv-border hover:text-cv-text-secondary"
                              }`}
                            >
                              <meta.Icon size={12} />
                              {meta.label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="relative">
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="appearance-none rounded-lg border border-cv-border bg-cv-bg py-2 pl-8 pr-7 text-xs font-medium text-cv-text-secondary focus:outline-none focus:ring-2 focus:ring-cv-border"
                      >
                        <option value="default">Original order</option>
                        <option value="longest">Longest first</option>
                        <option value="shortest">Shortest first</option>
                      </select>
                      <ArrowUpDown size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-cv-text-subtle" />
                    </div>
                  </div>
                </div>

                {filteredResponses.length === 0 ? (
                  <div className="rounded-xl border border-cv-border bg-cv-bg p-6 text-center">
                    <Search size={28} className="mx-auto mb-2 text-cv-text-subtle" />
                    <p className="text-sm text-cv-text-muted">No responses match your search or filter.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {visibleResponses.map(({ response, index }) => (
                        <ResponseCard
                          key={response?.id || response?._id || index}
                          response={response}
                          index={index}
                        />
                      ))}
                    </div>

                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => setVisibleCount((c) => c + 6)}
                        className="mt-4 w-full rounded-xl border border-dashed border-cv-border-strong py-2.5 text-sm font-medium text-cv-text-muted hover:border-cv-border-strong hover:text-cv-text-secondary"
                      >
                        Show {Math.min(6, filteredResponses.length - visibleResponses.length)} more
                        {isFiltering ? " matching" : ""} response
                        {filteredResponses.length - visibleResponses.length === 1 ? "" : "s"}
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ====================================================
          CONCLUSION
      ==================================================== */}

      <div className="mt-5 rounded-2xl border border-cv-border bg-cv-surface p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cv-surface-muted text-sm font-bold text-cv-text-secondary">
              C
            </div>
            <h2 className="text-base font-semibold text-cv-text">Administration Conclusion</h2>
          </div>

          {!isEditingConclusion && (
            <button
              type="button"
              onClick={handleStartEditConclusion}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-cv-text-muted hover:bg-cv-surface-soft hover:text-cv-text-secondary print:hidden"
            >
              <Pencil size={13} />
              {savedConclusion ? "Edit" : "Add conclusion"}
            </button>
          )}
        </div>

        {isEditingConclusion ? (
          <div className="space-y-3">
            <textarea
              value={draftConclusion}
              onChange={(e) => setDraftConclusion(e.target.value)}
              rows={4}
              autoFocus
              placeholder="Summarize the administration's conclusion for this feedback category…"
              className="w-full resize-y rounded-xl border border-cv-border bg-cv-bg p-3 text-sm leading-6 text-cv-text-secondary placeholder:text-cv-text-subtle focus:border-cv-border-strong focus:bg-cv-surface focus:outline-none focus:ring-2 focus:ring-cv-border"
            />

            {conclusionError && <p className="text-xs text-cv-danger">{conclusionError}</p>}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveConclusion}
                disabled={savingConclusion}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cv-text px-3.5 py-2 text-xs font-semibold text-white hover:bg-cv-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingConclusion ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {savingConclusion ? "Saving…" : "Save conclusion"}
              </button>
              <button
                type="button"
                onClick={handleCancelEditConclusion}
                disabled={savingConclusion}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cv-border px-3.5 py-2 text-xs font-medium text-cv-text-secondary hover:bg-cv-surface-soft"
              >
                Cancel
              </button>
              <span className="text-xs text-cv-text-subtle">{draftConclusion.trim().length} characters</span>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            {savedConclusion ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-cv-text-secondary">{savedConclusion}</p>
            ) : (
              <p className="text-sm text-cv-text-subtle">
                Administration has not added a conclusion for this category yet.
              </p>
            )}
            {conclusionSaved && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-cv-success-soft px-2.5 py-1 text-xs font-medium text-cv-success print:hidden">
                <Check size={12} />
                Saved
              </span>
            )}
          </div>
        )}
      </div>

      {/* ====================================================
          ACTION TAKEN
      ==================================================== */}

      <div className="mt-5 rounded-2xl border border-cv-border bg-cv-surface p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cv-surface-muted text-sm font-bold text-cv-text-secondary">
              A
            </div>
            <h2 className="text-base font-semibold text-cv-text">Action Taken</h2>
          </div>

          {typeof category.action === "object" && onUpdateActionStatus && (
            <div className="relative print:hidden">
              <select
                value={actionStatus || "pending"}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={savingStatus}
                className={`appearance-none rounded-full py-1.5 pl-3 pr-7 text-xs font-medium ring-1 ring-inset focus:outline-none ${
                  STATUS_META[actionStatus]?.chip || STATUS_META.pending.chip
                }`}
              >
                {ACTION_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_META[status].label}
                  </option>
                ))}
              </select>
              {savingStatus && (
                <Loader2 size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 animate-spin" />
              )}
            </div>
          )}
        </div>

        {category.action ? (
          <div className="space-y-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-cv-text-secondary">
              {category.action.description || category.action}
            </p>

            {typeof category.action === "object" && (
              <div className="flex flex-wrap gap-4">
                {category.action.responsibleDepartment && (
                  <div className="flex items-center gap-1.5 text-xs text-cv-text-muted">
                    <ClipboardList size={13} className="text-cv-text-subtle" />
                    Responsible:{" "}
                    <span className="font-medium text-cv-text-secondary">
                      {category.action.responsibleDepartment}
                    </span>
                  </div>
                )}
                {category.action.expectedCompletion && (
                  <div className="text-xs text-cv-text-muted">
                    Expected completion:{" "}
                    <span className="font-medium text-cv-text-secondary">
                      {category.action.expectedCompletion}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-cv-text-subtle">No action has been recorded yet.</p>
        )}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| RESPONSE CARD
|--------------------------------------------------------------------------
*/

function ResponseCard({ response, index }) {
  const text =
    typeof response === "string"
      ? response
      : response?.text || response?.response || response?.answer || "";

  const sentiment = typeof response === "object" ? response?.sentiment : undefined;
  const meta = sentiment ? SENTIMENT_META[sentiment] : null;

  return (
    <div className="rounded-xl border border-cv-border bg-cv-bg p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cv-surface text-xs font-semibold text-cv-text-muted">
            {index + 1}
          </span>
          <span className="text-xs font-medium text-cv-text-muted">
            Anonymous Response #{index + 1}
          </span>
        </div>

        {meta && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${meta.chip}`}>
            <meta.Icon size={11} />
            {meta.label}
          </span>
        )}
      </div>

      <p className="whitespace-pre-wrap text-sm leading-6 text-cv-text-secondary">
        {text || "No response text available."}
      </p>
    </div>
  );
}
