import React, { useState } from "react";
import {
  GripVertical,
  Trash2,
  Copy,
  ChevronDown,
  Star,
  ListChecks,
  CheckCircle2,
  Type as TypeIcon,
  AlignLeft,
  Plus,
} from "lucide-react";

const QUESTION_TYPES = [
  {
    value: "rating",
    label: "Rating (1–5)",
    icon: Star,
    accent: "rgb(var(--cv-category-amber))",
    tint: "rgb(var(--cv-category-amber-soft))",
  },
  {
    value: "mcq",
    label: "Single choice",
    icon: ListChecks,
    accent: "rgb(var(--cv-category-purple))",
    tint: "rgb(var(--cv-category-purple-soft))",
  },
  {
    value: "multi_select",
    label: "Checkboxes (select multiple)",
    icon: ListChecks,
    accent: "rgb(var(--cv-category-purple))",
    tint: "rgb(var(--cv-category-purple-soft))",
  },
  {
    value: "yes_no",
    label: "Yes / No",
    icon: CheckCircle2,
    accent: "rgb(var(--cv-category-green))",
    tint: "rgb(var(--cv-category-green-soft))",
  },
  {
    value: "short_text",
    label: "Short Text",
    icon: TypeIcon,
    accent: "rgb(var(--cv-category-blue))",
    tint: "rgb(var(--cv-category-blue-soft))",
  },
  {
    value: "long_text",
    label: "Long Text",
    icon: AlignLeft,
    accent: "rgb(var(--cv-category-pink))",
    tint: "rgb(var(--cv-category-pink-soft))",
  },
];

const getTypeMeta = (type) =>
  QUESTION_TYPES.find((t) => t.value === type) || QUESTION_TYPES[4];

const CHAR_LIMITS = {
  short_text: 100,
  long_text: 500,
};

export default function FeedbackQuestion({
  question,
  index,
  totalQuestions,
  onUpdate,
  onRemove,
  onDuplicate,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (!question) {
    return null;
  }

  const update = (field, value) => {
    onUpdate(question.id, field, value);
  };

  const meta = getTypeMeta(question.type || "long_text");
  const Icon = meta.icon;
  const charLimit = CHAR_LIMITS[question.type];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-cv-surface shadow-sm transition-shadow duration-200 hover:shadow-md"
      style={{ borderColor: `${meta.accent}30` }}
    >
      {/* type-coded accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: meta.accent }}
      />

      <div className="py-5 pl-6 pr-5">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="shrink-0 cursor-grab text-cv-border-strong transition hover:text-cv-text-subtle active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical size={18} />
            </button>

            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: meta.tint, color: meta.accent }}
            >
              <Icon size={16} />
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-cv-text">
                Question {index + 1}
              </p>
              {collapsed && (
                <p className="truncate text-xs text-cv-text-muted">
                  {question.question || "No question text yet"}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {onDuplicate && (
              <button
                type="button"
                onClick={() => onDuplicate(question.id)}
                className="rounded-lg p-2 text-cv-text-subtle transition hover:bg-cv-surface-soft hover:text-cv-text-secondary"
                title="Duplicate question"
              >
                <Copy size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="rounded-lg p-2 text-cv-text-subtle transition hover:bg-cv-surface-soft hover:text-cv-text-secondary"
              title={collapsed ? "Expand question" : "Collapse question"}
            >
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  collapsed ? "-rotate-90" : ""
                }`}
              />
            </button>

            {totalQuestions > 1 && (
              <button
                type="button"
                onClick={() => onRemove(question.id)}
                className="rounded-lg p-2 text-cv-danger transition hover:bg-cv-danger-soft hover:text-cv-danger"
                title="Remove question"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {!collapsed && (
          <>
            {/* ======================================================
                QUESTION TEXT
            ====================================================== */}

            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-cv-text-secondary">
                Question
              </label>

              <textarea
                value={question.question || ""}
                onChange={(e) => update("question", e.target.value)}
                rows={2}
                placeholder="What would you like to ask?"
                className="w-full resize-none rounded-xl border border-cv-border bg-cv-bg/70 px-4 py-3 text-sm text-cv-text outline-none transition focus:border-transparent focus:bg-cv-surface focus:ring-2"
                style={{ "--tw-ring-color": `${meta.accent}40` }}
              />
            </div>

            {/* ======================================================
                TYPE + REQUIRED
            ====================================================== */}

            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-cv-text-secondary">
                  Question type
                </label>

                <div className="relative">
                  <select
                    value={question.type || "long_text"}
                    onChange={(e) => update("type", e.target.value)}
                    className="w-full appearance-none rounded-xl border border-cv-border bg-cv-bg/70 px-4 py-3 pr-9 text-sm text-cv-text outline-none transition focus:border-transparent focus:bg-cv-surface focus:ring-2"
                    style={{ "--tw-ring-color": `${meta.accent}40` }}
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cv-text-subtle"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-cv-border bg-cv-bg/70 px-4 py-3 sm:justify-start">
                <span className="text-sm text-cv-text-secondary">Required</span>

                <span className="relative inline-flex h-5 w-9 shrink-0 items-center">
                  <input
                    type="checkbox"
                    checked={Boolean(question.required)}
                    onChange={(e) => update("required", e.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    className="absolute inset-0 rounded-full bg-cv-border-strong transition-colors duration-200 peer-checked:bg-[var(--accent)]"
                    style={{ "--accent": meta.accent }}
                  />
                  <span className="absolute left-0.5 h-4 w-4 rounded-full bg-cv-surface shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
                </span>
              </label>
            </div>

            {/* ======================================================
                MCQ OPTIONS
            ====================================================== */}

            {(question.type === "mcq" || question.type === "multi_select") && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-cv-text-secondary">
                    Options
                  </label>
                </div>

                <div className="space-y-2">
                  {(question.options || []).map((option, optionIndex) => (
                    <div
                      key={`${question.id}-${optionIndex}`}
                      className="group flex items-center gap-2"
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium"
                        style={{
                          borderColor: `${meta.accent}50`,
                          color: meta.accent,
                        }}
                      >
                        {optionIndex + 1}
                      </span>

                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          onUpdateOption(
                            question.id,
                            optionIndex,
                            e.target.value
                          )
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        className="flex-1 rounded-xl border border-cv-border bg-cv-bg/70 px-4 py-2.5 text-sm outline-none transition focus:border-transparent focus:bg-cv-surface focus:ring-2"
                        style={{ "--tw-ring-color": `${meta.accent}40` }}
                      />

                      {(question.options || []).length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            onRemoveOption(question.id, optionIndex)
                          }
                          className="rounded-lg p-2 text-cv-border-strong opacity-0 transition group-hover:opacity-100 hover:bg-cv-danger-soft hover:text-cv-danger"
                          title="Remove option"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => onAddOption(question.id)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-2.5 text-sm font-medium transition hover:bg-cv-surface-soft"
                    style={{ borderColor: `${meta.accent}50`, color: meta.accent }}
                  >
                    <Plus size={14} />
                    Add option
                  </button>
                </div>
                {question.type === "multi_select" && (
                  <label className="mt-4 block text-sm font-medium text-cv-text-secondary">
                    Maximum selections (leave blank for no limit)
                    <input
                      type="number"
                      min="1"
                      max={(question.options || []).filter((option) => String(option).trim()).length || 1}
                      value={question.maxSelections ?? ""}
                      onChange={(e) => update("maxSelections", e.target.value === "" ? null : Math.max(1, Number(e.target.value)))}
                      className="mt-1.5 w-full rounded-xl border border-cv-border bg-cv-bg/70 px-4 py-2.5 text-sm text-cv-text outline-none focus:ring-2"
                    />
                  </label>
                )}
              </div>
            )}

            {/* ======================================================
                RATING PREVIEW
            ====================================================== */}

            {question.type === "rating" && (
              <div className="mt-5 rounded-xl border border-cv-divider bg-cv-bg/50 p-4">
                <p className="mb-3 text-xs font-medium text-cv-text-muted">
                  Student will see
                </p>

                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div
                      key={value}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition"
                      style={
                        value === 4
                          ? {
                              backgroundColor: meta.accent,
                              borderColor: meta.accent,
                              color: "rgb(var(--cv-text-inverse))",
                            }
                          : { borderColor: "rgb(var(--cv-border))", color: "rgb(var(--cv-text-muted))" }
                      }
                    >
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================
                YES / NO PREVIEW
            ====================================================== */}

            {question.type === "yes_no" && (
              <div className="mt-5 rounded-xl border border-cv-divider bg-cv-bg/50 p-4">
                <p className="mb-3 text-xs font-medium text-cv-text-muted">
                  Student will see
                </p>

                <div className="flex gap-3">
                  <div
                    className="rounded-xl border px-5 py-2.5 text-sm font-medium"
                    style={{
                      backgroundColor: meta.accent,
                      borderColor: meta.accent,
                      color: "rgb(var(--cv-text-inverse))",
                    }}
                  >
                    Yes
                  </div>
                  <div className="rounded-xl border border-cv-border-strong bg-cv-surface px-5 py-2.5 text-sm text-cv-text-secondary">
                    No
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================
                TEXT PREVIEW
            ====================================================== */}

            {(question.type === "short_text" ||
              question.type === "long_text") && (
              <div className="mt-5 rounded-xl border border-cv-divider bg-cv-bg/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-cv-text-muted">
                    Student will see
                  </p>
                  {charLimit && (
                    <p className="text-xs text-cv-text-subtle">0 / {charLimit}</p>
                  )}
                </div>

                {question.type === "short_text" ? (
                  <div className="rounded-xl border border-cv-border bg-cv-surface px-4 py-3 text-sm text-cv-text-subtle">
                    Student response...
                  </div>
                ) : (
                  <div className="h-20 rounded-xl border border-cv-border bg-cv-surface px-4 py-3 text-sm text-cv-text-subtle">
                    Student response...
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}