import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  MessageSquareText,
  CheckCircle,
  AlertCircle,
  Star,
  ListChecks,
  CheckCircle2,
  Type as TypeIcon,
  AlignLeft,
  ChevronDown,
} from "lucide-react";

import {
  fetchFeedbackResults,
} from "../../../shared/services/feedback.service.js";

// Brand accent used for chrome that isn't tied to a specific question type
// (kept in sync with FeedbackQuestion's per-type palette for the rest).
const BRAND = "rgb(var(--cv-primary))";

const TYPE_META = {
  rating: { icon: Star, accent: "rgb(var(--cv-category-amber))", tint: "rgb(var(--cv-category-amber-soft))" },
  mcq: { icon: ListChecks, accent: "rgb(var(--cv-category-purple))", tint: "rgb(var(--cv-category-purple-soft))" },
  multi_select: { icon: ListChecks, accent: "rgb(var(--cv-category-purple))", tint: "rgb(var(--cv-category-purple-soft))" },
  yes_no: { icon: CheckCircle2, accent: "rgb(var(--cv-category-green))", tint: "rgb(var(--cv-category-green-soft))" },
  short_text: { icon: TypeIcon, accent: "rgb(var(--cv-category-blue))", tint: "rgb(var(--cv-category-blue-soft))" },
  long_text: { icon: AlignLeft, accent: "rgb(var(--cv-category-pink))", tint: "rgb(var(--cv-category-pink-soft))" },
};

const getTypeMeta = (type) => TYPE_META[type] || TYPE_META.long_text;

const STATUS_STYLES = {
  pending: { bg: "rgb(var(--cv-category-amber-soft))", text: "rgb(var(--cv-warning))", label: "Pending" },
  in_progress: { bg: "rgb(var(--cv-category-blue-soft))", text: "rgb(var(--cv-info))", label: "In progress" },
  completed: { bg: "rgb(var(--cv-category-green-soft))", text: "rgb(var(--cv-success))", label: "Completed" },
  resolved: { bg: "rgb(var(--cv-category-green-soft))", text: "rgb(var(--cv-success))", label: "Resolved" },
};

const getStatusStyle = (status) =>
  STATUS_STYLES[status] || { bg: "rgb(var(--cv-surface-muted))", text: "rgb(var(--cv-text-secondary))", label: status };

export default function FeedbackResults({
  form,
  onBack,
}) {
  const [results, setResults] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | LOAD RESULTS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    async function loadResults() {
      try {
        setLoading(true);
        setError("");

        const data =
          await fetchFeedbackResults(
            form?._id
          );

        if (mounted) {
          setResults(data);
        }
      } catch (err) {
        console.error(
          "Feedback results error:",
          err
        );

        if (mounted) {
          setError(
            err?.response?.data?.error ||
              err?.response?.data?.message ||
              "Unable to load feedback results."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (form?._id) {
      loadResults();
    } else {
      setLoading(false);
      setError(
        "Feedback form not found."
      );
    }

    return () => {
      mounted = false;
    };
  }, [form?._id]);


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="rounded-2xl border border-cv-divider bg-cv-surface p-12 text-center shadow-sm">
        <div
          className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-cv-border"
          style={{ borderTopColor: BRAND }}
        />
        <p className="text-sm text-cv-text-muted">
          Loading feedback results...
        </p>
      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <div className="rounded-2xl border border-cv-danger-border bg-cv-surface p-8 text-center shadow-sm">
        <AlertCircle
          size={36}
          className="mx-auto mb-3 text-cv-danger"
        />

        <h2 className="text-lg font-semibold text-cv-text">
          Unable to load results
        </h2>

        <p className="mt-2 text-sm text-cv-text-muted">
          {error}
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-cv-border px-4 py-2.5 text-sm font-medium text-cv-text-secondary transition hover:bg-cv-surface-soft"
        >
          <ArrowLeft size={16} />
          Back to Feedback
        </button>
      </div>
    );
  }


  if (!results) {
    return null;
  }


  const statistics =
    results.statistics || [];

  const responseCount =
    results.responseCount || 0;

  const categories =
    results.categories || [];


  return (
    <div className="mx-auto max-w-4xl">

      {/* ======================================================
          BACK
      ====================================================== */}

      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-cv-text-muted transition hover:text-cv-text"
      >
        <ArrowLeft size={16} />
        Back to Feedback
      </button>


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 overflow-hidden rounded-2xl border border-cv-divider bg-cv-surface shadow-sm">
        <div className="p-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {form?.category && (
              <span className="rounded-full bg-cv-surface-muted px-3 py-1 text-xs font-medium text-cv-text-secondary">
                {form.category}
              </span>
            )}

            <span className="inline-flex items-center gap-1 rounded-full bg-cv-success-soft px-3 py-1 text-xs font-medium text-cv-success">
              <CheckCircle2 size={12} />
              Results
            </span>
          </div>

          <h1 className="text-2xl font-bold text-cv-text">
            {results.title ||
              form?.title ||
              "Feedback Results"}
          </h1>

          {form?.description && (
            <p className="mt-2 text-sm leading-6 text-cv-text-secondary">
              {form.description}
            </p>
          )}

          {/* Response count */}

          <div
            className="mt-5 flex items-center gap-4 rounded-xl px-4 py-3.5"
            style={{ backgroundColor: `${BRAND}0F` }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${BRAND}1F`, color: BRAND }}
            >
              <BarChart3 size={19} />
            </span>

            <div>
              <p className="text-xs text-cv-text-muted">
                Total responses
              </p>

              <p className="text-lg font-bold text-cv-text">
                {responseCount}
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* ======================================================
          EMPTY
      ====================================================== */}

      {responseCount === 0 ? (
        <div className="rounded-2xl border border-cv-divider bg-cv-surface p-12 text-center shadow-sm">
          <MessageSquareText
            size={38}
            className="mx-auto mb-3 text-cv-border-strong"
          />

          <h2 className="text-lg font-semibold text-cv-text">
            No responses yet
          </h2>

          <p className="mt-2 text-sm text-cv-text-muted">
            No student responses were recorded for this feedback cycle.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {statistics.map(
            (item, index) => (
              <QuestionResult
                key={
                  item.questionId ||
                  index
                }
                item={item}
                index={index}
              />
            )
          )}
        </div>
      )}

      {/* ======================================================
          COMMON THEMES + ACTION TAKEN
      ====================================================== */}

      {categories.length > 0 && (
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-cv-text">
              Common Concerns & Action Taken
            </h2>

            <p className="mt-1 text-sm text-cv-text-muted">
              Student responses were grouped into common
              themes and reviewed by the administration.
            </p>
          </div>

          <div className="space-y-5">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| CATEGORY CARD
|--------------------------------------------------------------------------
*/

function CategoryCard({ category }) {
  const [showAllResponses, setShowAllResponses] = useState(false);

  const responses = category.responses || [];
  const visibleResponses = showAllResponses
    ? responses
    : responses.slice(0, 4);

  const statusStyle = category.actionStatus
    ? getStatusStyle(category.actionStatus)
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-cv-divider bg-cv-surface shadow-sm">

      {/* CATEGORY HEADER */}

      <div className="border-b border-cv-divider bg-cv-bg/60 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-cv-text">
              {category.name}
            </h3>

            {category.description && (
              <p className="mt-1 text-sm text-cv-text-muted">
                {category.description}
              </p>
            )}
          </div>

          <span className="rounded-full border border-cv-border bg-cv-surface px-3 py-1 text-xs font-medium text-cv-text-secondary">
            {category.responseCount} response
            {category.responseCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="p-5">

        {/* STUDENT RESPONSES */}

        {responses.length > 0 && (
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-cv-text-subtle">
              Student Responses
            </h4>

            <div className="space-y-2">
              {visibleResponses.map((response, index) => (
                <div
                  key={`${category.id}-${index}`}
                  className="rounded-xl border border-cv-divider bg-cv-bg/60 p-3"
                >
                  <p className="text-sm leading-6 text-cv-text-secondary">
                    {response.answer}
                  </p>
                </div>
              ))}
            </div>

            {responses.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllResponses((v) => !v)}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-cv-text-muted transition hover:text-cv-text"
              >
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${
                    showAllResponses ? "rotate-180" : ""
                  }`}
                />
                {showAllResponses
                  ? "Show less"
                  : `Show ${responses.length - 4} more`}
              </button>
            )}
          </div>
        )}

        {/* ADMIN CONCLUSION */}

        {category.conclusion && (
          <div className="mt-6 rounded-xl border border-cv-divider bg-cv-surface p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-cv-text-subtle">
              Administration's Conclusion
            </h4>

            <p className="mt-2 text-sm leading-6 text-cv-text-secondary">
              {category.conclusion}
            </p>
          </div>
        )}

        {/* ACTION TAKEN */}

        {(
          category.action ||
          category.responsibleDepartment ||
          category.expectedCompletion
        ) && (
          <div
            className="mt-4 rounded-xl border p-4"
            style={{ borderColor: `${BRAND}30`, backgroundColor: `${BRAND}08` }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle size={17} style={{ color: BRAND }} />
                <h4 className="text-sm font-semibold text-cv-text">
                  Action Taken
                </h4>
              </div>

              {statusStyle && (
                <span
                  className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.text,
                  }}
                >
                  {statusStyle.label}
                </span>
              )}
            </div>

            {category.action && (
              <div className="mt-3">
                <p className="text-xs font-medium text-cv-text-subtle">
                  Action
                </p>
                <p className="mt-1 text-sm leading-6 text-cv-text-secondary">
                  {category.action}
                </p>
              </div>
            )}

            {category.responsibleDepartment && (
              <div className="mt-3">
                <p className="text-xs font-medium text-cv-text-subtle">
                  Responsible Department
                </p>
                <p className="mt-1 text-sm text-cv-text-secondary">
                  {category.responsibleDepartment}
                </p>
              </div>
            )}

            {category.expectedCompletion && (
              <div className="mt-3">
                <p className="text-xs font-medium text-cv-text-subtle">
                  Expected Completion
                </p>
                <p className="mt-1 text-sm text-cv-text-secondary">
                  {category.expectedCompletion}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


/*
|--------------------------------------------------------------------------
| QUESTION RESULT
|--------------------------------------------------------------------------
*/

function QuestionResult({
  item,
  index,
}) {
  const type =
    item.type;

  const meta = getTypeMeta(type);
  const Icon = meta.icon;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-cv-surface p-6 shadow-sm"
      style={{ borderColor: `${meta.accent}25` }}
    >
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: meta.accent }}
      />

      {/* Question */}

      <div className="mb-5 flex items-start gap-3 pl-1">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: meta.tint, color: meta.accent }}
        >
          <Icon size={16} />
        </span>

        <div>
          <h2 className="text-base font-semibold leading-6 text-cv-text">
            {item.question}
          </h2>

          <p className="mt-1 text-xs text-cv-text-muted">
            {item.responseCount || 0} responses
          </p>
        </div>
      </div>


      {/* ======================================================
          RATING
      ====================================================== */}

      {type === "rating" && (
        <RatingResult item={item} accent={meta.accent} />
      )}


      {/* ======================================================
          MCQ / YES-NO
      ====================================================== */}

      {(type === "mcq" || type === "multi_select" ||
        type === "yes_no") && (
        <ChoiceResult item={item} accent={meta.accent} />
      )}


      {/* ======================================================
          TEXT
      ====================================================== */}

      {(type === "short_text" ||
        type === "long_text") && (
        <TextResult item={item} accent={meta.accent} />
      )}

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| RATING RESULT
|--------------------------------------------------------------------------
*/

function RatingResult({
  item,
  accent,
}) {
  const average =
    Number(item.average || 0);

  const distribution =
    item.distribution || {};

  const total =
    item.responseCount || 0;

  const topRating = [5, 4, 3, 2, 1].reduce((best, rating) => {
    const count = Number(distribution[String(rating)] || 0);
    return count > (best.count || 0) ? { rating, count } : best;
  }, {});

  return (
    <div>

      {/* Average */}

      <div
        className="mb-5 flex items-center justify-between rounded-xl p-5"
        style={{ backgroundColor: `${accent}0F` }}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-cv-text-muted">
            Average Rating
          </p>

          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-bold text-cv-text">
              {average.toFixed(2)}
            </span>

            <span className="pb-1 text-sm text-cv-text-muted">
              / 5
            </span>
          </div>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <Star
              key={value}
              size={18}
              fill={value <= Math.round(average) ? accent : "none"}
              stroke={value <= Math.round(average) ? accent : "rgb(var(--cv-border-strong))"}
            />
          ))}
        </div>
      </div>


      {/* Distribution */}

      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map(
          (rating) => {
            const count =
              Number(
                distribution[
                  String(rating)
                ] || 0
              );

            const percentage =
              total > 0
                ? Math.round(
                    (count / total) *
                      100
                  )
                : 0;

            const isTop =
              topRating.count > 0 && rating === topRating.rating;

            return (
              <div
                key={rating}
                className="flex items-center gap-3"
              >
                <span
                  className={`w-8 text-sm font-medium ${
                    isTop ? "text-cv-text" : "text-cv-text-muted"
                  }`}
                >
                  {rating}
                </span>

                <div className="h-2 flex-1 overflow-hidden rounded-full bg-cv-surface-muted">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: isTop ? accent : "rgb(var(--cv-border-strong))",
                    }}
                  />
                </div>

                <span className="w-12 text-right text-xs text-cv-text-muted">
                  {count}
                </span>
              </div>
            );
          }
        )}
      </div>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| CHOICE RESULT
|--------------------------------------------------------------------------
*/

function ChoiceResult({
  item,
  accent,
}) {
  const distribution =
    item.distribution || {};

  const total =
    item.responseCount || 0;

  const entries =
    Object.entries(
      distribution
    ).sort(([, a], [, b]) => Number(b) - Number(a));

  if (entries.length === 0) {
    return (
      <p className="text-sm text-cv-text-muted">
        No responses available.
      </p>
    );
  }

  const topCount = Number(entries[0]?.[1] || 0);

  return (
    <div className="space-y-3">

      {entries.map(
        ([option, count]) => {
          const numericCount =
            Number(count || 0);

          const percentage =
            total > 0
              ? Math.round(
                  (numericCount /
                    total) *
                    100
                )
              : 0;

          const isTop =
            numericCount === topCount && numericCount > 0;

          return (
            <div
              key={option}
              className="rounded-xl border p-4 transition"
              style={{
                borderColor: isTop ? "rgb(var(--cv-primary-border))" : "rgb(var(--cv-border))",
                backgroundColor: isTop ? "rgb(var(--cv-primary-soft))" : "transparent",
              }}
            >

              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-cv-text-secondary">
                  {option}
                  {isTop && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: "rgb(var(--cv-primary-soft))", color: accent }}
                    >
                      Top pick
                    </span>
                  )}
                </span>

                <span className="text-xs text-cv-text-muted">
                  {numericCount}{" "}
                  ({percentage}%)
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-cv-surface-muted">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: isTop ? accent : "rgb(var(--cv-border-strong))",
                  }}
                />
              </div>

            </div>
          );
        }
      )}

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| TEXT RESULT
|--------------------------------------------------------------------------
*/

function TextResult({
  item,
  accent,
}) {
  const [showAll, setShowAll] = useState(false);

  const responses =
    item.responses || [];

  if (responses.length === 0) {
    return (
      <div className="rounded-xl border border-cv-divider bg-cv-bg/60 p-5">
        <p className="text-sm text-cv-text-muted">
          No written responses available.
        </p>
      </div>
    );
  }

  const visible = showAll ? responses : responses.slice(0, 4);

  return (
    <div>

      <div className="mb-4 flex items-center gap-2">
        <MessageSquareText
          size={16}
          style={{ color: accent }}
        />

        <span className="text-sm font-medium text-cv-text-secondary">
          Student Responses
        </span>
      </div>


      <div className="space-y-3">
        {visible.map(
          (response, index) => (
            <div
              key={index}
              className="rounded-xl border border-cv-divider bg-cv-bg/60 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-cv-surface text-xs font-medium"
                  style={{ color: accent }}
                >
                  {index + 1}
                </span>

                <span className="text-xs text-cv-text-muted">
                  Anonymous Response{" "}
                  #{index + 1}
                </span>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-6 text-cv-text-secondary">
                {response}
              </p>
            </div>
          )
        )}
      </div>

      {responses.length > 4 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-cv-text-muted transition hover:text-cv-text"
        >
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${
              showAll ? "rotate-180" : ""
            }`}
          />
          {showAll ? "Show less" : `Show ${responses.length - 4} more`}
        </button>
      )}

    </div>
  );
}
