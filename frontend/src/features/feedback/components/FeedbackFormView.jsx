import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Loader2,
  RotateCcw,
  Send,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";

import { submitFeedbackResponse } from "../../../shared/services/feedback.service.js";

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const RATING_LABELS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

// How long the success screen stays before onSubmitted() is called.
const SUCCESS_REDIRECT_MS = 1800;

// Drafts live in sessionStorage: they survive a refresh or a dropped
// connection, but are wiped when the tab closes (safe on shared lab PCs).
const DRAFT_PREFIX = "campusvoice:feedback-draft:";

// Rough seconds per question type, used for the "About N min" estimate.
const SECONDS_PER_QUESTION = {
  rating: 8,
  yes_no: 6,
  mcq: 10,
  multi_select: 12,
  short_text: 30,
  long_text: 75,
};

const TEXT_FIELD =
  "w-full rounded-2xl border border-cv-border bg-cv-surface-soft/60 px-4 py-3 text-sm text-cv-text outline-none transition placeholder:text-cv-text-subtle focus:border-cv-primary-border focus:bg-cv-surface focus:ring-4 focus:ring-cv-primary/20";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function isAnswered(value) {
  if (Array.isArray(value)) return value.length > 0;
  return !(value === undefined || value === null || String(value).trim() === "");
}

function loadDraft(formId) {
  if (!formId) return {};
  try {
    const raw = window.sessionStorage.getItem(DRAFT_PREFIX + formId);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    return {};
  }
}

function saveDraft(formId, answers) {
  try {
    window.sessionStorage.setItem(
      DRAFT_PREFIX + formId,
      JSON.stringify(answers)
    );
    return true;
  } catch (err) {
    return false;
  }
}

function clearDraft(formId) {
  try {
    window.sessionStorage.removeItem(DRAFT_PREFIX + formId);
  } catch (err) {
    /* storage unavailable, nothing to clear */
  }
}

function estimateMinutes(questions) {
  const seconds = questions.reduce(
    (total, q) => total + (SECONDS_PER_QUESTION[q.type] ?? 10),
    0
  );
  return Math.max(1, Math.round(seconds / 60));
}

function scrollBehavior() {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reduce ? "auto" : "smooth";
}

/*
|--------------------------------------------------------------------------
| SMALL UI PIECES
|--------------------------------------------------------------------------
*/

// Keyboard focus ring for hidden native radios. Place directly after the
// <input className="peer sr-only"> inside a `relative` label.
function FocusRing() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 ring-2 ring-cv-primary ring-offset-2 transition-opacity peer-focus-visible:opacity-100"
    />
  );
}

function CharCount({ length, max, alwaysShow = false }) {
  const threshold = alwaysShow ? 1 : max * 0.8;
  if (length < threshold) return null;

  const nearLimit = length >= max * 0.9;

  return (
    <p
      className={`mt-2 text-right text-xs tabular-nums ${
        nearLimit ? "text-cv-warning" : "text-cv-text-subtle"
      }`}
    >
      {length.toLocaleString()} / {max.toLocaleString()}
    </p>
  );
}

function RatingInput({ name, value, onChange, labelId }) {
  const [hover, setHover] = useState(0);
  const current = Number(value) || 0;
  const shown = hover || current;

  return (
    <div>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="-ml-1.5 flex items-center"
        onMouseLeave={() => setHover(0)}
      >
        {RATING_LABELS.map((label, i) => {
          const n = i + 1;
          const active = n <= shown;

          return (
            <label
              key={n}
              onMouseEnter={() => setHover(n)}
              className="relative cursor-pointer rounded-xl p-1.5 transition-transform active:scale-90 motion-reduce:transition-none"
            >
              <input
                type="radio"
                name={name}
                value={n}
                checked={current === n}
                onChange={() => onChange(n)}
                aria-label={`${n} out of 5, ${label}`}
                className="peer sr-only"
              />
              <FocusRing />
              <Star
                size={32}
                strokeWidth={1.75}
                aria-hidden="true"
                className={`transition-colors ${
                  active
                    ? "fill-amber-400 text-cv-warning"
                    : "fill-transparent text-cv-border-strong"
                }`}
              />
            </label>
          );
        })}
      </div>

      <p
        className={`mt-1 h-5 text-sm font-medium ${
          shown ? "text-cv-text-secondary" : "text-cv-text-subtle"
        }`}
      >
        {shown ? RATING_LABELS[shown - 1] : "Tap a star to rate"}
      </p>
    </div>
  );
}

function McqInput({ name, options, value, onChange, labelId }) {
  return (
    <div role="radiogroup" aria-labelledby={labelId} className="space-y-2">
      {options.map((option, i) => {
        const selected = value === option;

        return (
          <label
            key={`${name}-${i}`}
            className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 transition-colors motion-reduce:transition-none ${
              selected
                ? "border-cv-primary-border bg-cv-primary-soft/80"
                : "border-cv-border bg-cv-surface hover:border-cv-primary-border hover:bg-cv-primary-soft/40"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={selected}
              onChange={() => onChange(option)}
              className="peer sr-only"
            />
            <FocusRing />

            <span
              aria-hidden="true"
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                selected
                  ? "border-cv-primary bg-cv-primary"
                  : "border-cv-border-strong bg-cv-surface"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full bg-cv-surface transition-transform motion-reduce:transition-none ${
                  selected ? "scale-100" : "scale-0"
                }`}
              />
            </span>

            <span
              className={`text-sm ${
                selected
                  ? "font-medium text-cv-text"
                  : "text-cv-text-secondary"
              }`}
            >
              {option}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function MultiSelectInput({ name, options, value, onChange, labelId, maxSelections }) {
  const selected = Array.isArray(value) ? value : [];
  const toggle = (option) => {
    if (selected.includes(option)) onChange(selected.filter((item) => item !== option));
    else if (!maxSelections || selected.length < Number(maxSelections)) onChange([...selected, option]);
  };
  const limitReached = Boolean(maxSelections) && selected.length >= Number(maxSelections);
  return (
    <div role="group" aria-labelledby={labelId} className="space-y-2">
      <p className="mb-2 text-xs text-cv-text-muted">Select all that apply{maxSelections ? ` · choose up to ${maxSelections}` : ""}</p>
      {options.map((option, i) => {
        const checked = selected.includes(option);
        const disabled = !checked && limitReached;
        return (
          <label key={`${name}-${i}`} className={`relative flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-colors ${checked ? "border-cv-primary-border bg-cv-primary-soft/80" : "border-cv-border bg-cv-surface hover:border-cv-primary-border"} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
            <input type="checkbox" name={`${name}-${i}`} value={option} checked={checked} disabled={disabled} onChange={() => toggle(option)} className="h-4 w-4 accent-cv-primary" />
            <span className="text-sm text-cv-text-secondary">{option}</span>
          </label>
        );
      })}
      {maxSelections && <p className="text-xs text-cv-text-muted">{selected.length} of {maxSelections} selected</p>}
    </div>
  );
}

function YesNoInput({ name, value, onChange, labelId }) {
  const choices = [
    { label: "Yes", Icon: Check },
    { label: "No", Icon: X },
  ];

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelId}
      className="grid grid-cols-2 gap-3 sm:max-w-sm"
    >
      {choices.map(({ label, Icon }) => {
        const selected = value === label;

        return (
          <label
            key={label}
            className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-semibold transition-colors motion-reduce:transition-none ${
              selected
                ? "border-cv-primary bg-cv-primary text-white shadow-md shadow-cv-sm"
                : "border-cv-border bg-cv-surface text-cv-text-secondary hover:border-cv-primary-border hover:bg-cv-primary-soft/40"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={label}
              checked={selected}
              onChange={() => onChange(label)}
              className="peer sr-only"
            />
            <FocusRing />
            <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
            {label}
          </label>
        );
      })}
    </div>
  );
}

function ShortTextInput({ value, onChange, labelId }) {
  const text = String(value);

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer..."
        maxLength={500}
        aria-labelledby={labelId}
        className={TEXT_FIELD}
      />
      <CharCount length={text.length} max={500} />
    </div>
  );
}

function LongTextInput({ value, onChange, labelId }) {
  const text = String(value);

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Share your thoughts..."
        rows={5}
        maxLength={5000}
        aria-labelledby={labelId}
        className={`${TEXT_FIELD} resize-none leading-6`}
      />
      <CharCount length={text.length} max={5000} alwaysShow />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MAIN VIEW
|--------------------------------------------------------------------------
| Wrapped so the body remounts whenever the form changes. That keeps the
| per-form draft loading simple and prevents answers leaking between forms.
*/

export default function FeedbackFormView(props) {
  return (
    <FeedbackFormBody key={props.form?._id ?? "no-form"} {...props} />
  );
}

function FeedbackFormBody({ form, onBack, onSubmitted }) {
  const formId = form?._id;

  const questions = useMemo(() => form?.questions || [], [form]);

  const initialDraft = useRef(null);
  if (initialDraft.current === null) {
    initialDraft.current = loadDraft(formId);
  }

  const [answers, setAnswers] = useState(initialDraft.current);
  const [restored, setRestored] = useState(() =>
    Object.values(initialDraft.current).some(isAnswered)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const questionRefs = useRef({});
  const successRef = useRef(null);
  const redirectTimer = useRef(null);
  const clearTimer = useRef(null);

  /* ---------------------------- derived state ---------------------------- */

  const answeredCount = questions.filter((q) =>
    isAnswered(answers[q.id])
  ).length;

  const requiredTotal = questions.filter((q) => q.required).length;

  const requiredLeft = questions.filter(
    (q) => q.required && !isAnswered(answers[q.id])
  ).length;

  const progress = questions.length
    ? Math.round((answeredCount / questions.length) * 100)
    : 0;

  const estMinutes = useMemo(() => estimateMinutes(questions), [questions]);

  const validationMessage =
    attempted && requiredLeft > 0
      ? requiredLeft === 1
        ? "One required question still needs an answer."
        : `${requiredLeft} required questions still need an answer.`
      : "";

  const bannerMessage = error || validationMessage;

  /* ------------------------------ effects -------------------------------- */

  // Autosave draft (debounced).
  useEffect(() => {
    if (!formId || success) return undefined;

    const hasAny = Object.values(answers).some(isAnswered);

    const timer = setTimeout(() => {
      if (hasAny) {
        setDraftSaved(saveDraft(formId, answers));
      } else {
        clearDraft(formId);
        setDraftSaved(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [answers, formId, success]);

  // Bring the confirmation into view once submitted.
  useEffect(() => {
    if (success && successRef.current) {
      successRef.current.scrollIntoView({
        block: "start",
        behavior: scrollBehavior(),
      });
    }
  }, [success]);

  // Clean up timers on unmount.
  useEffect(
    () => () => {
      clearTimeout(redirectTimer.current);
      clearTimeout(clearTimer.current);
    },
    []
  );

  /* ------------------------------ handlers ------------------------------- */

  function updateAnswer(questionId, value) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
    setError("");
  }

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      clearTimer.current = setTimeout(() => setConfirmClear(false), 3000);
      return;
    }

    clearTimeout(clearTimer.current);
    setConfirmClear(false);
    setAnswers({});
    setAttempted(false);
    setError("");
    setRestored(false);
    clearDraft(formId);
  }

  function handleDone() {
    clearTimeout(redirectTimer.current);
    const next = onSubmitted || onBack;
    if (next) next();
  }

  async function handleSubmit() {
    setError("");

    const missing = questions.filter(
      (q) => q.required && !isAnswered(answers[q.id])
    );

    if (missing.length > 0) {
      setAttempted(true);

      // Jump to the first unanswered required question and focus it.
      const target = questionRefs.current[missing[0].id];
      if (target) {
        target.scrollIntoView({
          block: "center",
          behavior: scrollBehavior(),
        });
        const focusable = target.querySelector("input, textarea");
        if (focusable) focusable.focus({ preventScroll: true });
      }
      return;
    }

    try {
      setSubmitting(true);

      const formattedAnswers = questions.map((question) => ({
        questionId: question.id,
        answer: answers[question.id] ?? "",
      }));

      await submitFeedbackResponse(form._id, formattedAnswers);

      clearDraft(formId);
      setSuccess(true);

      if (onSubmitted) {
        redirectTimer.current = setTimeout(() => {
          onSubmitted();
        }, SUCCESS_REDIRECT_MS);
      }
    } catch (err) {
      console.error("Feedback submission error:", err);

      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to submit feedback.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  /*
  |------------------------------------------------------------------------
  | NO FORM
  |------------------------------------------------------------------------
  */

  if (!form) {
    return (
      <div className="mx-auto max-w-md rounded-cv-2xl border border-cv-border/80 bg-cv-surface p-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cv-surface-muted">
          <AlertCircle className="text-cv-text-subtle" size={26} />
        </div>

        <h2 className="text-lg font-semibold text-cv-text">
          Feedback form not found
        </h2>

        <p className="mt-1 text-sm text-cv-text-muted">
          It may have been removed or is no longer available.
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 rounded-2xl bg-cv-text px-5 py-2.5 text-sm font-medium text-white transition hover:bg-cv-text-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cv-border"
        >
          Back to feedback
        </button>
      </div>
    );
  }

  /*
  |------------------------------------------------------------------------
  | SUCCESS
  |------------------------------------------------------------------------
  */

  if (success) {
    return (
      <div ref={successRef} className="mx-auto max-w-xl">
        <style>{`
          @keyframes cv-pop {
            0% { transform: scale(.6); opacity: 0; }
            60% { transform: scale(1.08); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .cv-pop { animation: cv-pop .5s ease-out both; }
          @media (prefers-reduced-motion: reduce) { .cv-pop { animation: none; } }
        `}</style>

        <div
          role="status"
          className="rounded-cv-2xl border border-cv-success-border bg-gradient-to-br from-cv-success-soft via-cv-surface to-cv-primary-soft p-8 text-center sm:p-12"
        >
          <div className="cv-pop mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-cv-success-soft ring-8 ring-cv-success-soft">
            <Check
              className="text-cv-success"
              size={36}
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-cv-text">
            Feedback submitted
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-cv-text-muted">
            Thank you for taking the time. Your response has been
            recorded.
          </p>

          <p className="mt-4 inline-block rounded-full bg-cv-surface/80 px-4 py-1.5 text-xs font-medium text-cv-text-secondary ring-1 ring-cv-success-border">
            You answered {answeredCount} of {questions.length}{" "}
            {questions.length === 1 ? "question" : "questions"}
          </p>

          <div className="mt-8">
            <button
              type="button"
              onClick={handleDone}
              className="rounded-2xl bg-cv-text px-6 py-3 text-sm font-semibold text-white transition hover:bg-cv-text-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cv-border"
            >
              Back to feedback
            </button>

            {onSubmitted && (
              <p className="mt-3 text-xs text-cv-text-subtle">
                Taking you back automatically...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /*
  |------------------------------------------------------------------------
  | FORM
  |------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto max-w-3xl">
      {/* ---------------------------- BACK ---------------------------- */}

      <button
        type="button"
        onClick={onBack}
        disabled={submitting}
        className="group mb-5 inline-flex items-center gap-2 rounded-xl py-1 pr-2 text-sm font-medium text-cv-text-muted transition hover:text-cv-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cv-primary/20 disabled:opacity-50"
      >
        <ArrowLeft
          size={16}
          className="transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
        />
        Back to feedback
      </button>

      {/* --------------------------- HEADER --------------------------- */}

      <div className="relative mb-5 overflow-hidden rounded-cv-2xl border border-cv-primary-border/80 bg-gradient-to-br from-cv-primary-soft via-cv-surface to-cv-accent-soft p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-cv-primary/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-cv-accent/15 blur-3xl"
        />

        <div className="relative">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {form.category && (
              <span className="rounded-full bg-cv-surface/80 px-3 py-1 text-xs font-medium text-cv-primary ring-1 ring-cv-primary/20">
                {form.category}
              </span>
            )}

            {form.anonymous && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cv-success-soft px-3 py-1 text-xs font-medium text-cv-success ring-1 ring-cv-success-border">
                <ShieldCheck size={13} aria-hidden="true" />
                Anonymous
              </span>
            )}

            {questions.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cv-surface/80 px-3 py-1 text-xs font-medium text-cv-text-secondary ring-1 ring-cv-border/70">
                <Clock size={13} aria-hidden="true" />
                About {estMinutes} min
              </span>
            )}
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-cv-text sm:text-3xl">
            {form.title}
          </h1>

          {form.description && (
            <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-cv-text-secondary sm:text-[15px]">
              {form.description}
            </p>
          )}

          <p className="mt-5 max-w-2xl rounded-2xl bg-cv-surface/70 px-4 py-3 text-xs leading-5 text-cv-text-muted ring-1 ring-white">
            Please answer honestly. Your feedback helps the
            administration understand student experience and identify
            areas for improvement.
          </p>
        </div>
      </div>

      {/* ------------------------ RESTORED NOTICE ---------------------- */}

      {restored && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-cv-info-soft px-4 py-3 text-sm text-cv-info ring-1 ring-cv-info-soft">
          <RotateCcw size={16} className="shrink-0" aria-hidden="true" />
          <p className="flex-1">
            We restored the answers you started earlier.
          </p>
          <button
            type="button"
            onClick={() => setRestored(false)}
            aria-label="Dismiss"
            className="rounded-lg p-1 text-cv-info transition hover:bg-cv-info-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cv-info"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* --------------------------- PROGRESS -------------------------- */}

      {questions.length > 0 && (
        <div className="sticky top-3 z-10 mb-5">
          <div className="rounded-2xl border border-cv-border/80 bg-cv-surface/85 px-4 py-3 shadow-cv-md backdrop-blur">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
              <span className="font-medium text-cv-text-secondary">
                {answeredCount} of {questions.length} answered
              </span>

              <span className="flex items-center gap-3">
                {requiredLeft > 0 ? (
                  <span className="text-cv-text-muted">
                    {requiredLeft} required left
                  </span>
                ) : (
                  requiredTotal > 0 && (
                    <span className="inline-flex items-center gap-1 font-medium text-cv-success">
                      <Check size={13} strokeWidth={3} aria-hidden="true" />
                      Required done
                    </span>
                  )
                )}

                {draftSaved && answeredCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-cv-text-subtle">
                    <Check size={13} aria-hidden="true" />
                    Draft saved
                  </span>
                )}
              </span>
            </div>

            <div
              role="progressbar"
              aria-label="Form completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="h-1.5 overflow-hidden rounded-full bg-cv-surface-muted"
            >
              <div
                className="h-full rounded-full bg-cv-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* -------------------------- QUESTIONS -------------------------- */}

      {questions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-cv-border bg-cv-surface p-10 text-center">
          <p className="text-sm text-cv-text-muted">
            This form doesn&apos;t have any questions yet.
          </p>
        </div>
      ) : (
        <fieldset disabled={submitting} className="min-w-0 space-y-4">
          {questions.map((question, index) => {
            const value = answers[question.id] ?? "";
            const answered = isAnswered(value);
            const invalid = attempted && question.required && !answered;

            const inputName = `cv-${formId}-${question.id}`;
            const labelId = `${inputName}-label`;
            const setValue = (v) => updateAnswer(question.id, v);

            return (
              <section
                key={question.id}
                ref={(el) => {
                  questionRefs.current[question.id] = el;
                }}
                className={`rounded-3xl border p-5 transition-all motion-reduce:transition-none sm:p-6 ${
                  invalid
                    ? "border-cv-danger-border bg-cv-danger-soft/40"
                    : "border-cv-border/80 bg-cv-surface focus-within:border-cv-primary-border focus-within:shadow-cv-lg"
                }`}
              >
                {/* Question */}

                <div className="mb-4 flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={`mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      answered
                        ? "bg-cv-success-soft text-cv-success"
                        : invalid
                        ? "bg-cv-danger-soft text-cv-danger"
                        : "bg-cv-surface-muted text-cv-text-muted"
                    }`}
                  >
                    {answered ? (
                      <Check size={14} strokeWidth={3} />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <h2
                    id={labelId}
                    className="text-base font-semibold leading-7 text-cv-text"
                  >
                    {question.question}

                    {question.required && (
                      <>
                        <span
                          aria-hidden="true"
                          className="ml-1 text-cv-danger"
                        >
                          *
                        </span>
                        <span className="sr-only"> (required)</span>
                      </>
                    )}
                  </h2>
                </div>

                {/* Answer (indented to line up with the question text) */}

                <div className="sm:pl-10">
                  {question.type === "rating" && (
                    <RatingInput
                      name={inputName}
                      value={value}
                      onChange={setValue}
                      labelId={labelId}
                    />
                  )}

                  {question.type === "multi_select" && (
                    <MultiSelectInput
                      name={inputName}
                      options={question.options || []}
                      value={value}
                      onChange={setValue}
                      labelId={labelId}
                      maxSelections={question.maxSelections}
                    />
                  )}

                  {question.type === "mcq" && (
                    <McqInput
                      name={inputName}
                      options={question.options || []}
                      value={value}
                      onChange={setValue}
                      labelId={labelId}
                    />
                  )}

                  {question.type === "yes_no" && (
                    <YesNoInput
                      name={inputName}
                      value={value}
                      onChange={setValue}
                      labelId={labelId}
                    />
                  )}

                  {question.type === "short_text" && (
                    <ShortTextInput
                      value={value}
                      onChange={setValue}
                      labelId={labelId}
                    />
                  )}

                  {question.type === "long_text" && (
                    <LongTextInput
                      value={value}
                      onChange={setValue}
                      labelId={labelId}
                    />
                  )}

                  {invalid && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-cv-danger">
                      <AlertCircle size={14} aria-hidden="true" />
                      This question needs an answer.
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </fieldset>
      )}

      {/* ---------------------------- SUBMIT --------------------------- */}

      {questions.length > 0 && (
        <div className="mt-6 rounded-3xl border border-cv-primary-border bg-gradient-to-br from-cv-primary-soft/70 via-cv-surface to-cv-accent-soft/60 p-5 sm:p-6">
          <p className="mb-4 text-xs text-cv-text-muted">
            Questions marked with{" "}
            <span className="font-semibold text-cv-danger">*</span> are
            required.
          </p>

          {bannerMessage && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-3 rounded-2xl border border-cv-danger-border bg-cv-danger-soft px-4 py-3 text-sm text-cv-danger"
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span>{bannerMessage}</span>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
            {answeredCount > 0 && (
              <button
                type="button"
                onClick={handleClear}
                disabled={submitting}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-cv-text-muted transition hover:bg-cv-surface hover:text-cv-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cv-primary/20 disabled:opacity-50"
              >
                {confirmClear ? "Tap again to clear" : "Clear answers"}
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cv-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cv-sm transition hover:bg-cv-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cv-primary/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
            >
              {submitting ? (
                <Loader2
                  size={17}
                  className="animate-spin motion-reduce:animate-none"
                />
              ) : (
                <Send size={17} />
              )}

              {submitting ? "Submitting..." : "Submit feedback"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}