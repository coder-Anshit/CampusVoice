import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  MessageSquareText,
  Users,
  UserCheck,
  FileText,
  Percent,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Star,
  Tag,
  Award,
} from "lucide-react";

import {
  fetchFeedbackStatistics,
  fetchFeedbackResponses,
} from "../../../shared/services/feedback.service.js";
import FeedbackCategorization from "./FeedbackCategorization.jsx";


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function FeedbackAdminResults({
  form,
  onBack,
}) {
  const [statistics, setStatistics] = useState(null);
  const [responses, setResponses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  /*
  |--------------------------------------------------------------------------
  | LOAD ADMIN RESULTS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    async function loadResults() {
      if (!form?._id) {
        setError("Feedback form not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [statisticsData, responsesData] =
          await Promise.all([
            fetchFeedbackStatistics(form._id),
            fetchFeedbackResponses(form._id),
          ]);

        if (!mounted) {
          return;
        }

        setStatistics(statisticsData || null);
        setResponses(
          Array.isArray(responsesData)
            ? responsesData
            : []
        );
      } catch (err) {
        console.error(
          "Admin feedback results error:",
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

    loadResults();

    return () => {
      mounted = false;
    };
  }, [form?._id]);


  /*
  |--------------------------------------------------------------------------
  | QUESTION STATISTICS
  |--------------------------------------------------------------------------
  */

  const questionStatistics = useMemo(() => {
    return Array.isArray(
      statistics?.statistics
    )
      ? statistics.statistics
      : [];
  }, [statistics]);


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="rounded-3xl border border-cv-divider bg-cv-surface p-12 text-center shadow-sm">
        <div className="relative mx-auto mb-5 h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-cv-primary-border" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-indigo-600" />
        </div>
        <p className="text-sm font-medium text-cv-text-muted">
          Loading feedback results…
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
      <div className="rounded-3xl border border-cv-danger-border bg-cv-surface p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cv-danger-soft">
          <AlertCircle size={30} className="text-cv-danger" />
        </div>

        <h2 className="text-lg font-semibold text-cv-text">
          Unable to load results
        </h2>

        <p className="mt-2 text-sm text-cv-text-muted">
          {error}
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-cv-border px-5 py-2.5 text-sm font-semibold text-cv-text-secondary transition hover:border-cv-border-strong hover:bg-cv-surface-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-cv-primary"
        >
          <ArrowLeft size={16} />
          Back to Feedback
        </button>
      </div>
    );
  }


  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

  const responseCount =
    Number(
      statistics?.responseCount ||
        responses.length ||
        0
    );

  const eligibleCount = Number(statistics?.eligibleCount || 0);
  const responseRate = statistics?.responseRate;


  /*
  |--------------------------------------------------------------------------
  | TABS
  |--------------------------------------------------------------------------
  */

  const tabs = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "themes", label: "Themes & Actions", icon: Tag },
    { key: "responses", label: "All Responses", icon: MessageSquareText },
  ];


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto max-w-5xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-cv-text-secondary transition hover:text-cv-text focus:outline-none focus-visible:ring-2 focus-visible:ring-cv-primary"
      >
        <ArrowLeft size={16} />
        Back to Feedback
      </button>

      {/* HEADER CARD */}
      <div className="relative mb-6 overflow-hidden rounded-3xl border border-cv-divider bg-cv-surface p-7 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-cv-primary via-cv-primary to-cv-primary-hover" />

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {form?.category && (
            <span className="rounded-full bg-cv-surface-muted px-3 py-1 text-xs font-medium text-cv-text-secondary">
              {form.category}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cv-primary to-cv-primary-hover px-3 py-1 text-xs font-semibold text-white shadow-sm">
            <Award size={12} />
            Admin Results
          </span>
          {form?.anonymous && (
            <span className="rounded-full bg-cv-success-soft px-3 py-1 text-xs font-medium text-cv-success">
              Anonymous Responses
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-cv-text sm:text-3xl">
          {statistics?.title || form?.title || "Feedback Results"}
        </h1>
        {form?.description && (
          <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-cv-text-secondary">
            {form.description}
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={Users}
            label="Responses"
            value={responseCount}
            tone="indigo"
          />
          <SummaryCard
            icon={UserCheck}
            label="Eligible Students"
            value={eligibleCount || "—"}
            tone="sky"
          />
          <SummaryCard
            icon={FileText}
            label="Questions"
            value={questionStatistics.length || form?.questions?.length || 0}
            tone="violet"
          />
          <SummaryCard
            icon={Percent}
            label="Response Rate"
            value={responseRate == null ? "—" : `${Number(responseRate).toFixed(1)}%`}
            tone="emerald"
          />
        </div>
      </div>

      {responseCount === 0 ? (
        <div className="rounded-3xl border border-cv-divider bg-cv-surface p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cv-primary-soft">
            <MessageSquareText size={30} className="text-cv-primary" />
          </div>
          <h2 className="text-lg font-semibold text-cv-text">No responses yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-cv-text-muted">
            Students have not submitted any responses for this feedback cycle yet.
          </p>
        </div>
      ) : (
        <>
          {/* TABS */}
          <div className="mb-6 flex flex-wrap gap-1.5 rounded-2xl border border-cv-divider bg-cv-surface p-1.5 shadow-sm">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cv-primary ${
                  activeSection === key
                    ? "bg-gradient-to-r from-cv-primary to-cv-primary-hover text-white shadow-md shadow-indigo-200"
                    : "text-cv-text-secondary hover:bg-cv-surface-soft"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {activeSection === "overview" && (
            <section>
              <SectionHeader
                icon={BarChart3}
                title="Question Analysis"
                description="Aggregated results for each question."
              />
              <div className="space-y-4">
                {questionStatistics.map((item, index) => (
                  <AdminQuestionResult
                    key={item.questionId || index}
                    item={item}
                    index={index}
                  />
                ))}
              </div>
            </section>
          )}

          {activeSection === "themes" && (
            <section>
              <FeedbackCategorization form={form} responses={responses} />
            </section>
          )}

          {activeSection === "responses" && (
            <section>
              <SectionHeader
                icon={MessageSquareText}
                title="All Student Responses"
                description={form?.anonymous ? "Responses are displayed anonymously." : "Responses include the available respondent identity."}
              />
              <AllResponses form={form} responses={responses} />
            </section>
          )}
        </>
      )}
    </div>
  );

}


/*
|--------------------------------------------------------------------------
| SUMMARY CARD
|--------------------------------------------------------------------------
*/

const SUMMARY_TONES = {
  indigo: {
    iconBg: "bg-cv-primary-soft",
    iconColor: "text-cv-primary",
    border: "border-cv-primary-border",
    cardBg: "bg-cv-primary-soft/40",
  },
  sky: {
    iconBg: "bg-cv-info-soft",
    iconColor: "text-cv-info",
    border: "border-cv-info-border",
    cardBg: "bg-cv-info-soft/40",
  },
  violet: {
    iconBg: "bg-cv-primary-soft",
    iconColor: "text-cv-primary",
    border: "border-cv-primary-border",
    cardBg: "bg-cv-primary-soft/40",
  },
  emerald: {
    iconBg: "bg-cv-success-soft",
    iconColor: "text-cv-success",
    border: "border-cv-success-border",
    cardBg: "bg-cv-success-soft/40",
  },
};

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone = "indigo",
}) {
  const palette = SUMMARY_TONES[tone] || SUMMARY_TONES.indigo;

  return (
    <div
      className={`group rounded-2xl border ${palette.border} ${palette.cardBg} p-4 transition-all hover:shadow-md hover:-translate-y-0.5`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${palette.iconBg} transition-transform group-hover:scale-105`}
        >
          <Icon size={18} className={palette.iconColor} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-cv-text-muted">
            {label}
          </p>

          <p className="mt-0.5 truncate text-xl font-extrabold text-cv-text">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}


/*
|--------------------------------------------------------------------------
| SECTION HEADER
|--------------------------------------------------------------------------
*/

function SectionHeader({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cv-primary-soft">
          <Icon size={16} className="text-cv-primary" />
        </span>

        <h2 className="text-base font-semibold text-cv-text">
          {title}
        </h2>
      </div>

      {description && (
        <p className="mt-1 pl-10 text-sm text-cv-text-muted">
          {description}
        </p>
      )}
    </div>
  );
}


/*
|--------------------------------------------------------------------------
| QUESTION RESULT
|--------------------------------------------------------------------------
*/

function AdminQuestionResult({
  item,
  index,
}) {
  const type = item?.type;

  return (
    <div className="rounded-2xl border border-cv-divider bg-cv-surface p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cv-primary to-cv-primary-hover text-xs font-bold text-white shadow-sm">
          {index + 1}
        </span>

        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-6 text-cv-text">
            {item?.question ||
              "Untitled question"}
          </h3>

          <p className="mt-1 text-xs font-medium text-cv-text-subtle">
            {item?.responseCount || 0} responses
          </p>
        </div>
      </div>


      {type === "rating" && (
        <RatingResult item={item} />
      )}


      {(type === "mcq" || type === "multi_select" ||
        type === "yes_no") && (
        <ChoiceResult item={item} />
      )}


      {(type === "short_text" ||
        type === "long_text") && (
        <TextResult item={item} />
      )}

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| RATING
|--------------------------------------------------------------------------
*/

function RatingResult({
  item,
}) {
  const average =
    Number(item?.average || 0);

  const distribution =
    item?.distribution || {};

  const total =
    Number(item?.responseCount || 0);

  return (
    <div>

      <div className="mb-5 flex items-center gap-5 rounded-2xl bg-gradient-to-br from-cv-primary-soft to-cv-surface-soft p-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cv-surface shadow-sm">
          <Star size={26} className="fill-amber-400 text-cv-warning" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cv-primary">
            Average Rating
          </p>

          <div className="mt-1 flex items-end gap-1.5">
            <span className="text-4xl font-extrabold text-cv-text">
              {average.toFixed(2)}
            </span>

            <span className="pb-1 text-sm font-medium text-cv-text-muted">
              / 5
            </span>
          </div>
        </div>
      </div>


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

            return (
              <div
                key={rating}
                className="flex items-center gap-3"
              >
                <span className="flex w-8 items-center gap-0.5 text-sm font-semibold text-cv-text-secondary">
                  {rating}
                  <Star size={11} className="fill-cv-warning text-cv-warning" />
                </span>

                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cv-surface-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cv-primary to-cv-primary-hover transition-all duration-700 ease-out"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <span className="w-20 text-right text-xs font-medium text-cv-text-muted">
                  {count} ({percentage}%)
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
| MCQ / YES-NO
|--------------------------------------------------------------------------
*/

function ChoiceResult({
  item,
}) {
  const distribution =
    item?.distribution || {};

  const total =
    Number(item?.responseCount || 0);

  const entries =
    Object.entries(distribution);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-cv-text-muted">
        No responses available.
      </p>
    );
  }

  const maxCount = Math.max(
    ...entries.map(([, count]) => Number(count || 0))
  );

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
            numericCount > 0 && numericCount === maxCount;

          return (
            <div
              key={option}
              className={`rounded-xl border p-4 transition-colors ${
                isTop
                  ? "border-cv-primary-border bg-cv-primary-soft/60"
                  : "border-cv-divider bg-cv-surface"
              }`}
            >

              <div className="mb-2 flex items-center justify-between gap-3">

                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-cv-text-secondary">
                  {option}
                  {isTop && (
                    <span className="rounded-full bg-cv-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cv-primary">
                      Top
                    </span>
                  )}
                </span>

                <span className="text-xs font-medium text-cv-text-muted">
                  {numericCount} (
                  {percentage}%)
                </span>

              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-cv-surface-muted">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isTop
                      ? "bg-gradient-to-r from-cv-primary to-cv-primary-hover"
                      : "bg-cv-border-strong"
                  }`}
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
  );
}


/*
|--------------------------------------------------------------------------
| TEXT RESULT
|--------------------------------------------------------------------------
*/

function TextResult({
  item,
}) {
  const responses =
    Array.isArray(item?.responses)
      ? item.responses
      : [];

  if (responses.length === 0) {
    return (
      <div className="rounded-xl border border-cv-divider bg-cv-bg p-5">
        <p className="text-sm text-cv-text-muted">
          No written responses available.
        </p>
      </div>
    );
  }

  return (
    <div>

      <div className="mb-4 flex items-center gap-2">
        <MessageSquareText
          size={16}
          className="text-cv-primary"
        />

        <span className="text-sm font-semibold text-cv-text-secondary">
          Written Responses
        </span>
      </div>


      <div className="space-y-3">

        {responses.map(
          (response, index) => (
            <div
              key={index}
              className="rounded-xl border border-cv-divider bg-cv-bg p-4"
            >

              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cv-surface text-xs font-semibold text-cv-primary shadow-sm">
                  {index + 1}
                </span>

                <span className="text-xs font-medium text-cv-text-muted">
                  Anonymous Response #
                  {index + 1}
                </span>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-6 text-cv-text-secondary">
                {response}
              </p>

            </div>
          )
        )}

      </div>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| ALL RESPONSES
|--------------------------------------------------------------------------
*/

function AllResponses({
  form,
  responses,
}) {
  const [expanded, setExpanded] =
    useState(false);

  if (!responses.length) {
    return (
      <div className="rounded-2xl border border-cv-divider bg-cv-surface p-8 text-center shadow-sm">
        <p className="text-sm text-cv-text-muted">
          No student responses available.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cv-divider bg-cv-surface shadow-sm">

      {/* HEADER */}

      <button
        type="button"
        onClick={() =>
          setExpanded(
            (current) => !current
          )
        }
        className="flex w-full items-center justify-between gap-4 rounded-2xl px-6 py-4 text-left transition hover:bg-cv-surface-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-cv-primary"
      >

        <div className="flex items-center gap-3">

          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cv-primary-soft transition-transform">
            {expanded ? (
              <ChevronDown
                size={16}
                className="text-cv-primary"
              />
            ) : (
              <ChevronRight
                size={16}
                className="text-cv-primary"
              />
            )}
          </span>

          <div>
            <h3 className="text-base font-semibold text-cv-text">
              Student Responses
            </h3>

            <p className="mt-0.5 text-xs text-cv-text-muted">
              {responses.length} response
              {responses.length === 1
                ? ""
                : "s"}
            </p>
          </div>

        </div>

      </button>


      {/* RESPONSES */}

      {expanded && (
        <div className="space-y-4 border-t border-cv-divider p-6">

          {responses.map(
            (response, index) => (
              <ResponseCard
                key={
                  response?._id ||
                  response?.id ||
                  index
                }
                response={response}
                index={index}
                form={form}
              />
            )
          )}

        </div>
      )}

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| RESPONSE CARD
|--------------------------------------------------------------------------
*/

function ResponseCard({
  response,
  index,
  form,
}) {
  const answers =
    Array.isArray(response?.answers)
      ? response.answers
      : [];

  const formQuestions =
    Array.isArray(form?.questions)
      ? form.questions
      : [];

  const questionMap =
    new Map(
      formQuestions.map(
        (question) => [
          String(question.id),
          question,
        ]
      )
    );

  const isAnonymous =
    Boolean(
      form?.anonymous ||
        response?.anonymous
    );

  const respondent =
    isAnonymous
      ? `Anonymous Student #${index + 1}`
      : response?.studentId ||
        "Identified Student";

  const initials = isAnonymous
    ? "A"
    : String(respondent).trim().charAt(0).toUpperCase() || "S";


  return (
    <div className="rounded-2xl border border-cv-divider bg-cv-bg/70 p-5">

      {/* RESPONDENT */}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cv-primary to-cv-primary-hover text-sm font-bold text-white">
            {initials}
          </span>

          <div>
            <p className="text-sm font-semibold text-cv-text">
              {respondent}
            </p>

            {response?.submittedAt && (
              <p className="mt-0.5 text-xs text-cv-text-muted">
                Submitted{" "}
                {formatDate(
                  response.submittedAt
                )}
              </p>
            )}
          </div>
        </div>

        <span className="rounded-full bg-cv-surface px-3 py-1 text-xs font-medium text-cv-text-muted shadow-sm">
          Response #{index + 1}
        </span>

      </div>


      {/* ANSWERS */}

      <div className="space-y-4">

        {answers.length === 0 ? (
          <p className="text-sm text-cv-text-muted">
            No answers recorded.
          </p>
        ) : (
          answers.map(
            (answer, answerIndex) => {
              const question =
                questionMap.get(
                  String(
                    answer?.questionId
                  )
                );

              const questionNumber = question
                ? formQuestions.findIndex(
                    (item) =>
                      String(item.id) ===
                      String(answer?.questionId)
                  ) + 1
                : answerIndex + 1;

              return (
                <div
                  key={
                    answer?.questionId ||
                    answerIndex
                  }
                  className="rounded-xl border border-cv-divider bg-cv-surface p-4"
                >

                  <p className="text-xs font-semibold uppercase tracking-wide text-cv-primary">
                    Question {questionNumber}
                  </p>

                  <p className="mt-1 text-sm font-semibold leading-6 text-cv-text">
                    {question?.question ||
                      "Question not found"}
                  </p>

                  <div className="mt-3 rounded-lg bg-cv-bg px-3 py-2.5">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-cv-text-secondary">
                      {formatAnswer(
                        answer?.answer
                      )}
                    </p>
                  </div>

                </div>
              );
            }
          )
        )}

      </div>

    </div>
  );
}


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatAnswer(answer) {
  if (
    answer === null ||
    answer === undefined ||
    answer === ""
  ) {
    return "No answer";
  }

  if (Array.isArray(answer)) {
    return answer.join(", ");
  }

  if (
    typeof answer === "object"
  ) {
    return JSON.stringify(answer);
  }

  return String(answer);
}


function formatDate(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}
