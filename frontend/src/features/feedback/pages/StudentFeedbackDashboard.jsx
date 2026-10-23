import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import {
  fetchStudentFeedbackForms,
  fetchActiveFeedbackForm,
  fetchFeedbackResults,
  fetchMyFeedbackResponse,
} from "../../../shared/services/feedback.service.js";

import FeedbackFormView from "../components/FeedbackFormView.jsx";

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

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

function getStatus(form) {
  return String(form?.status || "feedback")
    .replaceAll("_", " ")
    .toLowerCase();
}

function isActiveForm(form) {
  return ["published", "active"].includes(
    String(form?.status || "").toLowerCase()
  );
}

/* -------------------------------------------------------------------------- */
/* SMALL UI                                                                    */
/* -------------------------------------------------------------------------- */

function Tab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full rounded-xl px-4 py-2.5 text-[11px] font-semibold
        transition-all duration-200
        ${
          active
            ? "bg-cv-primary text-white shadow-sm"
            : "text-cv-text-secondary hover:bg-cv-primary-soft hover:text-cv-primary-hover"
        }
      `}
    >
      {children}
    </button>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-cv-border bg-cv-surface-soft p-4">
      <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-cv-text-subtle">
        {label}
      </p>

      <p className="mt-1.5 text-xl font-semibold tracking-tight text-cv-text">
        {value}
      </p>
    </div>
  );
}

function SoftBadge({ children, tone = "neutral" }) {
  const styles = {
    neutral:
      "bg-cv-surface text-cv-text-secondary border-cv-primary-border",
    plum:
      "bg-cv-primary-soft text-cv-primary border-cv-primary-border",
    green:
      "bg-cv-success-soft text-cv-success border-cv-success-border",
    blue:
      "bg-cv-info-soft text-cv-info border-cv-info-border",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-semibold ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* LOADING                                                                     */
/* -------------------------------------------------------------------------- */

function FeedbackSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((item) => (
        <div
          key={item}
          className="rounded-cv-xl border border-cv-border bg-cv-surface p-5"
        >
          <div className="animate-pulse space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-cv-surface-muted" />
              <div className="h-6 w-24 rounded-full bg-cv-surface-muted" />
            </div>

            <div className="h-4 w-2/3 rounded bg-cv-surface-muted" />

            <div className="h-3 w-full rounded bg-cv-surface-muted" />
            <div className="h-3 w-4/5 rounded bg-cv-surface-muted" />

            <div className="flex justify-between gap-4">
              <div className="h-3 w-40 rounded bg-cv-surface-muted" />
              <div className="h-9 w-24 rounded-xl bg-cv-surface-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EMPTY STATE                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <div className="rounded-cv-xl border border-dashed border-cv-border bg-cv-surface px-6 py-12 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-cv-primary-soft text-lg text-cv-primary">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-semibold text-cv-text">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-cv-text-muted">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FEEDBACK CARD                                                              */
/* -------------------------------------------------------------------------- */

function FeedbackCard({
  form,
  submitted,
  action,
  onAction,
}) {
  const status = getStatus(form);
  const active = isActiveForm(form);

  return (
    <article
      className="
        group relative overflow-hidden
        rounded-cv-xl
        border border-cv-border
        bg-cv-surface
        p-5
        transition-all duration-200
        hover:-translate-y-[1px]
        hover:border-cv-primary-border
        hover:shadow-cv-lg
      "
    >
      {/* Subtle hover accent */}
      <div className="absolute left-0 top-0 h-full w-[3px] bg-cv-primary-border opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          {/* Badges */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SoftBadge tone={active ? "blue" : "neutral"}>
              {status}
            </SoftBadge>

            <SoftBadge tone={form?.anonymous ? "plum" : "neutral"}>
              {form?.anonymous ? "Anonymous" : "Identified"}
            </SoftBadge>

            {submitted && (
              <SoftBadge tone="green">
                ✓ Submitted
              </SoftBadge>
            )}
          </div>

          {/* Title */}
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-cv-text">
            {form?.title || "Untitled Feedback"}
          </h3>

          {/* Description */}
          {form?.description && (
            <p className="mt-1.5 line-clamp-2 max-w-2xl text-xs leading-5 text-cv-text-secondary">
              {form.description}
            </p>
          )}

          {/* Metadata */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-medium text-cv-text-subtle">
            <span>
              {form?.questions?.length || 0} questions
            </span>

            {form?.startDate && (
              <span>
                Starts {formatDate(form.startDate)}
              </span>
            )}

            {form?.endDate && (
              <span>
                Ends {formatDate(form.endDate)}
              </span>
            )}
          </div>
        </div>

        {/* Minimal Action */}
        <button
          type="button"
          onClick={onAction}
          className="
            shrink-0 self-start
            rounded-xl
            border border-cv-primary-border
            bg-cv-primary-soft
            px-4 py-2.5
            text-[11px] font-semibold
            text-cv-primary-hover
            transition-all duration-200
            hover:border-cv-primary-border
            hover:bg-cv-primary-soft
            hover:text-cv-primary-hover
            active:scale-[0.98]
            md:self-center
          "
        >
          {action}
          <span className="ml-1.5 text-cv-text-subtle">→</span>
        </button>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* MY RESPONSES                                                               */
/* -------------------------------------------------------------------------- */

function MyResponses({ responses, onOpen }) {
  return (
    <section>
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-cv-primary">
          Your activity
        </p>

        <h2 className="mt-1.5 text-[19px] font-semibold tracking-[-0.02em] text-cv-text">
          My Responses
        </h2>

        <p className="mt-1 text-xs text-cv-text-muted">
          Your submitted feedback and answers.
        </p>
      </div>

      {responses.length ? (
        <div className="space-y-3">
          {responses.map((item) => (
            <button
              type="button"
              key={
                item.response?._id ||
                item.form?._id
              }
              onClick={() => onOpen(item)}
              className="
                group w-full
                rounded-cv-xl
                border border-cv-border
                bg-cv-surface
                p-5
                text-left
                transition-all duration-200
                hover:-translate-y-[1px]
                hover:border-cv-primary-border
                hover:shadow-cv-lg
              "
            >
              <div className="flex items-center gap-4">
                <div
                  className="
                    flex h-10 w-10 shrink-0
                    items-center justify-center
                    rounded-xl
                    border border-cv-success-border
                    bg-cv-success-soft
                    text-sm font-semibold
                    text-cv-success
                  "
                >
                  ✓
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-cv-text">
                    {item.form?.title || "Feedback"}
                  </h3>

                  <p className="mt-1 text-[10px] text-cv-text-subtle">
                    Submitted{" "}
                    {formatDate(
                      item.response?.createdAt ||
                        item.response?.submittedAt
                    )}

                    {item.form?.anonymous
                      ? " • Anonymous"
                      : ""}
                  </p>
                </div>

                <span
                  className="
                    shrink-0
                    text-[11px] font-semibold
                    text-cv-primary
                    transition-all duration-200
                    group-hover:translate-x-0.5
                    group-hover:text-cv-primary-hover
                  "
                >
                  View
                  <span className="ml-1 text-cv-text-subtle">
                    →
                  </span>
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="💬"
          title="No responses yet"
          description="Submit an active feedback form and your response will appear here."
        />
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* RESPONSE DETAIL                                                            */
/* -------------------------------------------------------------------------- */

function ResponseView({ item, onBack }) {
  const { form, response } = item;

  const answers = Array.isArray(
    response?.answers
  )
    ? response.answers
    : [];

  const questionMap = new Map(
    (form?.questions || []).map((question) => [
      String(
        question.id ??
          question._id ??
          question.questionId
      ),
      question,
    ])
  );

  return (
    <div className="max-w-3xl space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="
          inline-flex items-center gap-2
          text-xs font-medium
          text-cv-text-muted
          transition-colors
          hover:text-cv-primary-hover
        "
      >
        <span>←</span>
        Back to My Responses
      </button>

      <div className="overflow-hidden rounded-cv-xl border border-cv-border bg-cv-surface shadow-cv-card">
        <div className="h-1 bg-cv-primary-border" />

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <SoftBadge tone="green">
              ✓ Response submitted
            </SoftBadge>

            {form?.anonymous && (
              <SoftBadge tone="plum">
                Anonymous
              </SoftBadge>
            )}
          </div>

          <h2 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-cv-text">
            {form?.title || "Feedback"}
          </h2>

          <p className="mt-1 text-xs text-cv-text-muted">
            Submitted{" "}
            {formatDate(
              response?.createdAt ||
                response?.submittedAt
            )}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {answers.length ? (
          answers.map((answer, index) => {
            const question = questionMap.get(
              String(
                answer?.questionId ??
                  answer?.question_id ??
                  ""
              )
            );

            const value = Array.isArray(
              answer?.answer
            )
              ? answer.answer.join(", ")
              : answer?.answer;

            return (
              <div
                key={
                  answer?.questionId ||
                  index
                }
                className="
                  rounded-cv-xl
                  border border-cv-border
                  bg-cv-surface p-5
                "
              >
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-cv-text-subtle">
                  Question {index + 1}
                </p>

                <p className="mt-1.5 text-sm font-medium leading-5 text-cv-text">
                  {question?.question ||
                    question?.text ||
                    "Question"}
                </p>

                <div className="mt-4 rounded-2xl border border-cv-border bg-cv-surface-soft px-4 py-3">
                  <p className="whitespace-pre-wrap text-xs leading-5 text-cv-text-secondary">
                    {String(value ?? "—")}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon="📄"
            title="No answers available"
            description="There are no answer details available for this response."
          />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* RESULTS VIEW                                                               */
/* -------------------------------------------------------------------------- */

function ResultsView({
  form,
  data,
  onBack,
}) {
  const statistics = data?.statistics || [];
  const categories = data?.categories || [];

  const responseCount = Number(
    data?.responseCount || 0
  );

  const responseRate =
    data?.responseRate != null
      ? Number(data.responseRate)
      : null;

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="
          inline-flex items-center gap-2
          text-xs font-medium
          text-cv-text-muted
          transition-colors
          hover:text-cv-primary-hover
        "
      >
        <span>←</span>
        Back to Past Results
      </button>

      {/* Results Header */}
      <div className="overflow-hidden rounded-cv-xl border border-cv-border bg-cv-surface shadow-cv-card">
        <div className="h-1 bg-cv-primary-border" />

        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <SoftBadge tone="green">
              Results Published
            </SoftBadge>

            {form?.category && (
              <SoftBadge>
                {form.category}
              </SoftBadge>
            )}
          </div>

          <h1 className="mt-3 text-xl font-semibold tracking-[-0.02em] text-cv-text">
            {data?.title ||
              form?.title ||
              "Feedback Results"}
          </h1>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-cv-text-muted">
            What students reported and what the institution is doing with the findings.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
            <Metric
              label="Responses"
              value={responseCount}
            />

            <Metric
              label="Questions"
              value={statistics.length}
            />

            <Metric
              label="Response rate"
              value={
                responseRate == null
                  ? "—"
                  : `${responseRate.toFixed(1)}%`
              }
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <section className="rounded-cv-xl border border-cv-border bg-cv-surface p-5 md:p-6">
        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cv-primary">
            Evidence
          </p>

          <h2 className="mt-1.5 text-[18px] font-semibold text-cv-text">
            What students reported
          </h2>

          <p className="mt-1 text-[11px] text-cv-text-muted">
            Aggregate results from submitted responses.
          </p>
        </div>

        <div className="space-y-3">
          {statistics.length ? (
            statistics.map((item, index) => (
              <div
                key={
                  item.questionId ||
                  index
                }
                className="
                  rounded-2xl
                  border border-cv-border
                  bg-cv-surface-soft
                  p-4
                "
              >
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-cv-text-subtle">
                  Question {index + 1}
                </p>

                <p className="mt-1.5 text-sm font-medium leading-5 text-cv-text">
                  {item.question}
                </p>

                {item.type === "rating" ? (
                  <div className="mt-4 flex items-baseline gap-2">
                    <p className="text-3xl font-semibold tracking-tight text-cv-primary">
                      {Number(
                        item.average || 0
                      ).toFixed(2)}
                    </p>

                    <span className="text-xs font-medium text-cv-text-muted">
                      / 5 average
                    </span>
                  </div>
                ) : item.distribution ? (
                  <div className="mt-4 space-y-3">
                    {Object.entries(
                      item.distribution
                    ).map(
                      ([key, value]) => {
                        const total = Number(
                          item.responseCount ||
                            responseCount ||
                            0
                        );

                        const percentage = total
                          ? Math.round(
                              (Number(
                                value || 0
                              ) /
                                total) *
                                100
                            )
                          : 0;

                        return (
                          <div key={key}>
                            <div className="mb-1.5 flex justify-between gap-4 text-[10px] text-cv-text-muted">
                              <span className="font-medium">
                                {key}
                              </span>

                              <span className="font-semibold text-cv-text-secondary">
                                {value} ({percentage}%)
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-cv-divider">
                              <div
                                className="h-full rounded-full bg-cv-primary transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-cv-text-muted">
                    No aggregate statistic available.
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-xs text-cv-text-muted">
              No statistics are available yet.
            </p>
          )}
        </div>
      </section>

      {/* Themes */}
      {categories.length > 0 && (
        <section>
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cv-primary">
              Student voice
            </p>

            <h2 className="mt-1.5 text-[18px] font-semibold text-cv-text">
              Common concerns & themes
            </h2>

            <p className="mt-1 text-[11px] text-cv-text-muted">
              Published themes from student responses.
            </p>
          </div>

          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={
                  category.id ||
                  category._id ||
                  category.name
                }
                className="
                  rounded-cv-xl
                  border border-cv-border
                  bg-cv-surface p-5
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-cv-text">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="mt-1 text-xs leading-5 text-cv-text-secondary">
                        {category.description}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 rounded-full border border-cv-primary-border bg-cv-primary-soft px-3 py-1 text-[9px] font-semibold text-cv-text-secondary">
                    {category.responseCount ||
                      0}{" "}
                    responses
                  </span>
                </div>

                {/* Underlying Responses */}
                {category.responses?.length > 0 && (
                  <details className="mt-4 overflow-hidden rounded-2xl border border-cv-border bg-cv-surface-soft">
                    <summary className="cursor-pointer px-4 py-3 text-[11px] font-semibold text-cv-text-secondary transition-colors hover:text-cv-primary-hover">
                      View underlying responses
                    </summary>

                    <div className="space-y-2 border-t border-cv-border p-3">
                      {category.responses.map(
                        (
                          response,
                          index
                        ) => (
                          <div
                            key={index}
                            className="rounded-xl border border-cv-border bg-cv-surface p-3 text-xs leading-5 text-cv-text-secondary"
                          >
                            <span className="mr-2 text-[9px] font-semibold text-cv-text-subtle">
                              #{index + 1}
                            </span>

                            {response.answer}
                          </div>
                        )
                      )}
                    </div>
                  </details>
                )}

                {/* Administration Action */}
                {(category.conclusion ||
                  category.action) && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {category.conclusion && (
                      <div className="rounded-2xl border border-cv-border bg-cv-surface-soft p-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-cv-text-subtle">
                          Administration's conclusion
                        </p>

                        <p className="mt-1.5 text-xs leading-5 text-cv-text-secondary">
                          {category.conclusion}
                        </p>
                      </div>
                    )}

                    {category.action && (
                      <div className="rounded-2xl border border-cv-primary-border bg-cv-primary-soft p-4">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-cv-primary">
                          Action / accountability
                        </p>

                        <p className="mt-1.5 text-xs leading-5 text-cv-text-secondary">
                          {category.action}
                        </p>

                        {category.responsibleDepartment && (
                          <p className="mt-2 text-[10px] text-cv-text-muted">
                            <span className="font-semibold">
                              Responsible:
                            </span>{" "}
                            {
                              category.responsibleDepartment
                            }
                          </p>
                        )}

                        {category.expectedCompletion && (
                          <p className="mt-1 text-[10px] text-cv-text-muted">
                            <span className="font-semibold">
                              Expected:
                            </span>{" "}
                            {
                              category.expectedCompletion
                            }
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export default function StudentFeedbackDashboard() {
  const [forms, setForms] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState("active");

  const [selectedForm, setSelectedForm] =
    useState(null);

  const [selectedResults, setSelectedResults] =
    useState(null);

  const [responseDetail, setResponseDetail] =
    useState(null);

  /* ------------------------------------------------------------------------ */
  /* LOAD DATA                                                                */
  /* ------------------------------------------------------------------------ */

  const loadFeedback = useCallback(async () => {
    try {
      setLoading(true);

      const formData =
        await fetchStudentFeedbackForms();

      const safeForms = Array.isArray(formData)
        ? formData
        : Array.isArray(formData?.forms)
        ? formData.forms
        : [];

      setForms(safeForms);

      const responseChecks =
        await Promise.all(
          safeForms.map(async (form) => {
            try {
              const result =
                await fetchMyFeedbackResponse(
                  form._id
                );

              if (
                result?.submitted &&
                result?.response
              ) {
                return {
                  form,
                  response: result.response,
                };
              }

              if (
                result?._id ||
                result?.answers
              ) {
                return {
                  form,
                  response: result,
                };
              }

              return null;
            } catch {
              return null;
            }
          })
        );

      setResponses(
        responseChecks.filter(Boolean)
      );
    } catch (error) {
      console.error(
        "Failed to load student feedback:",
        error
      );

      toast.error(
        error?.response?.data?.error ||
          "Unable to load feedback"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  /* ------------------------------------------------------------------------ */
  /* DERIVED DATA                                                             */
  /* ------------------------------------------------------------------------ */

  const activeForms = useMemo(
    () =>
      forms.filter((form) =>
        ["published", "active"].includes(
          String(form?.status || "").toLowerCase()
        )
      ),
    [forms]
  );

  const pastForms = useMemo(
    () =>
      forms.filter((form) =>
        [
          "closed",
          "completed",
          "action_taken",
        ].includes(
          String(form?.status || "").toLowerCase()
        )
      ),
    [forms]
  );

  const respondedIds = useMemo(
    () =>
      new Set(
        responses.map((item) =>
          String(item.form?._id)
        )
      ),
    [responses]
  );

  /* ------------------------------------------------------------------------ */
  /* OPEN FORM                                                                */
  /* ------------------------------------------------------------------------ */

  async function openForm(form) {
    try {
      const data =
        await fetchActiveFeedbackForm(
          form._id
        );

      setSelectedForm(
        data?.form || data
      );

      setView("form");
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Unable to open feedback form"
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* OPEN RESULTS                                                             */
  /* ------------------------------------------------------------------------ */

  async function openResults(form) {
    try {
      const data =
        await fetchFeedbackResults(
          form._id
        );

      setSelectedForm(form);

      setSelectedResults(
        data?.results || data
      );

      setView("results");
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
          "Results are not available yet."
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* FORM VIEW                                                                */
  /* ------------------------------------------------------------------------ */

  if (
    view === "form" &&
    selectedForm
  ) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => {
            setSelectedForm(null);
            setView("active");
          }}
          className="
            inline-flex items-center gap-2
            text-xs font-medium
            text-cv-text-muted
            transition-colors
            hover:text-cv-primary-hover
          "
        >
          <span>←</span>
          Back to Feedback
        </button>

        <FeedbackFormView
          form={selectedForm}
          onBack={() => {
            setSelectedForm(null);
            setView("active");
          }}
          onSubmitted={async () => {
            setSelectedForm(null);
            setView("active");
            await loadFeedback();
          }}
        />
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* RESULTS VIEW                                                             */
  /* ------------------------------------------------------------------------ */

  if (
    view === "results" &&
    selectedResults
  ) {
    return (
      <ResultsView
        form={selectedForm}
        data={selectedResults}
        onBack={() =>
          setView("results-list")
        }
      />
    );
  }

  /* ------------------------------------------------------------------------ */
  /* RESPONSE VIEW                                                            */
  /* ------------------------------------------------------------------------ */

  if (
    view === "response" &&
    responseDetail
  ) {
    return (
      <ResponseView
        item={responseDetail}
        onBack={() =>
          setView("responses")
        }
      />
    );
  }

  /* ------------------------------------------------------------------------ */
  /* MAIN WORKSPACE                                                           */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="px-1 py-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-cv-primary">
          Student voice
        </p>

        <h1 className="mt-1.5 text-[27px] font-semibold tracking-[-0.035em] text-cv-text md:text-[30px]">
          Student Feedback
        </h1>

        <p className="mt-1 max-w-2xl text-xs leading-5 text-cv-text-muted">
          Share your experience and help improve campus life.
        </p>
      </div>

      {/* Navigation */}
      <div className="grid w-full grid-cols-1 gap-1 rounded-2xl border border-cv-border bg-cv-surface p-1.5 shadow-cv-sm sm:grid-cols-3">
        <Tab
          active={view === "active"}
          onClick={() => setView("active")}
        >
          Active Feedback
        </Tab>

        <Tab
          active={view === "responses"}
          onClick={() => setView("responses")}
        >
          My Responses
        </Tab>

        <Tab
          active={
            view === "results-list" ||
            view === "results"
          }
          onClick={() =>
            setView("results-list")
          }
        >
          Past Results
        </Tab>
      </div>

      {/* Content */}
      {loading ? (
        <FeedbackSkeleton />
      ) : view === "active" ? (
        <section>
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-cv-primary">
              Your input matters
            </p>

            <h2 className="mt-1.5 text-[19px] font-semibold tracking-[-0.02em] text-cv-text">
              Active Feedback
            </h2>

            <p className="mt-1 text-xs text-cv-text-muted">
              Forms currently accepting your response.
            </p>
          </div>

          {activeForms.length ? (
            <div className="space-y-3">
              {activeForms.map((form) => {
                const submitted =
                  respondedIds.has(
                    String(form._id)
                  );

                return (
                  <FeedbackCard
                    key={form._id}
                    form={form}
                    submitted={submitted}
                    action={
                      submitted
                        ? "View response"
                        : "Give feedback"
                    }
                    onAction={() => {
                      if (submitted) {
                        const item =
                          responses.find(
                            (response) =>
                              String(
                                response.form?._id
                              ) ===
                              String(form._id)
                          );

                        if (item) {
                          setResponseDetail(
                            item
                          );

                          setView(
                            "response"
                          );
                        }
                      } else {
                        openForm(form);
                      }
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="📝"
              title="No active feedback"
              description="There are no active feedback forms for you right now."
            />
          )}
        </section>
      ) : view === "responses" ? (
        <MyResponses
          responses={responses}
          onOpen={(item) => {
            setResponseDetail(item);
            setView("response");
          }}
        />
      ) : (
        <section>
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-cv-primary">
              Completed cycles
            </p>

            <h2 className="mt-1.5 text-[19px] font-semibold tracking-[-0.02em] text-cv-text">
              Past Feedback & Results
            </h2>

            <p className="mt-1 text-xs text-cv-text-muted">
              See published findings and institutional action from completed cycles.
            </p>
          </div>

          {pastForms.length ? (
            <div className="space-y-3">
              {pastForms.map((form) => (
                <FeedbackCard
                  key={form._id}
                  form={form}
                  submitted={respondedIds.has(
                    String(form._id)
                  )}
                  action="View results"
                  onAction={() =>
                    openResults(form)
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📄"
              title="Nothing here yet"
              description="No completed feedback cycles are available yet."
            />
          )}
        </section>
      )}
    </div>
  );
}