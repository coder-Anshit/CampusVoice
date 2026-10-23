import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Plus,
  Tag,
  Check,
  X,
  Save,
  Loader2,
  ChevronDown,
  MessageSquareText,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  Sprout,
} from "lucide-react";

import {
  fetchFeedbackCategories,
  createFeedbackCategory,
  updateFeedbackCategory,
  assignFeedbackResponseToCategory,
  removeFeedbackResponseFromCategory,
  // NOTE: this export does not exist in feedback.service.js yet.
  // Add a `deleteFeedbackCategory(formId, categoryId)` function there
  // (and a matching Flask DELETE route) to enable category deletion.
  // Everything below guards against it being undefined, so nothing
  // breaks if you haven't added it yet — the delete button will just
  // show a friendly error instead of crashing.
  deleteFeedbackCategory,
  
} from "../../../shared/services/feedback.service.js";

/*
|--------------------------------------------------------------------------
| DESIGN TOKENS — calm, nature-inspired palette (sand / water / leaf)
|--------------------------------------------------------------------------
| A theme is "planted" (planned, sand), "growing" (in progress, water)
| or "grown" (completed, leaf) — the status colors follow that metaphor.
*/

const STATUS_META = {
  planned: {
    label: "Planned",
    text: "text-[rgb(var(--cv-warning))]",
    bg: "bg-[rgb(var(--cv-warning-soft))]",
    dot: "bg-[rgb(var(--cv-warning))]",
  },
  in_progress: {
    label: "In Progress",
    text: "text-[rgb(var(--cv-info))]",
    bg: "bg-[rgb(var(--cv-info-soft))]",
    dot: "bg-[rgb(var(--cv-info))]",
  },
  completed: {
    label: "Completed",
    text: "text-[rgb(var(--cv-success))]",
    bg: "bg-[rgb(var(--cv-success-soft))]",
    dot: "bg-[rgb(var(--cv-success))]",
  },
};

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.planned;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.bg} ${meta.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function getResponseId(response) {
  return String(response?._id || response?.id || "");
}

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function FeedbackCategorization({ form, responses }) {
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // BUGFIX: creating a category and toggling a single response used to
  // share one `saving` boolean, so assigning a response anywhere on the
  // page would also disable/spin the "Create Category" button, and the
  // "Save Analysis & Action" button too. These are now independent.
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [togglingResponseId, setTogglingResponseId] = useState(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [error, setError] = useState("");

  // BUGFIX: rapid question switching could let an older, slower request
  // resolve after a newer one and silently overwrite it with stale
  // categories. A request token guards against that.
  const loadRequestRef = useRef(0);

  /*
  |--------------------------------------------------------------------------
  | OPEN-ENDED QUESTIONS
  |--------------------------------------------------------------------------
  */

  const textQuestions = useMemo(() => {
    return (form?.questions || []).filter(
      (question) =>
        question?.type === "short_text" || question?.type === "long_text"
    );
  }, [form]);

  /*
  |--------------------------------------------------------------------------
  | DEFAULT QUESTION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!selectedQuestionId && textQuestions.length > 0) {
      setSelectedQuestionId(String(textQuestions[0].id));
    }
  }, [selectedQuestionId, textQuestions]);

  /*
  |--------------------------------------------------------------------------
  | LOAD CATEGORIES
  |--------------------------------------------------------------------------
  */

  const loadCategories = async () => {
    if (!form?._id || !selectedQuestionId) {
      setCategories([]);
      return;
    }

    const requestId = ++loadRequestRef.current;

    try {
      setLoading(true);
      setError("");

      const data = await fetchFeedbackCategories(form._id, selectedQuestionId);

      // Ignore this response if a newer request has since been issued.
      if (requestId !== loadRequestRef.current) return;

      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      if (requestId !== loadRequestRef.current) return;

      console.error("Failed to load feedback categories:", err);
      setError(err?.response?.data?.error || "Unable to load categories.");
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?._id, selectedQuestionId]);

  /*
  |--------------------------------------------------------------------------
  | CREATE CATEGORY
  |--------------------------------------------------------------------------
  */

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;

    try {
      setCreatingCategory(true);
      setError("");

      await createFeedbackCategory(form._id, {
        questionId: selectedQuestionId,
        name,
        description: newCategoryDescription.trim(),
      });

      setNewCategoryName("");
      setNewCategoryDescription("");
      setShowCreateForm(false);

      await loadCategories();
    } catch (err) {
      console.error("Failed to create feedback category:", err);
      setError(err?.response?.data?.error || "Unable to create category.");
    } finally {
      setCreatingCategory(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESPONSE HELPERS
  |--------------------------------------------------------------------------
  */

  const getAnswerForQuestion = (response, questionId) => {
    const answer = (response?.answers || []).find(
      (item) => String(item?.questionId) === String(questionId)
    );
    return answer?.answer;
  };

  const formatAnswer = (answer) => {
    if (answer === null || answer === undefined || answer === "") {
      return "No answer";
    }
    if (Array.isArray(answer)) return answer.join(", ");
    if (typeof answer === "object") return JSON.stringify(answer);
    return String(answer);
  };

  /*
  |--------------------------------------------------------------------------
  | CATEGORY MEMBERSHIP
  |--------------------------------------------------------------------------
  */

  const isResponseInCategory = (category, responseId) => {
    return (category?.responseRefs || []).some(
      (ref) => String(ref?.responseId) === String(responseId)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | ASSIGN / REMOVE
  |--------------------------------------------------------------------------
  */

  const toggleResponseCategory = async (category, response) => {
    const responseId = getResponseId(response);
    if (!responseId) return;

    try {
      setTogglingResponseId(responseId);
      setError("");

      const alreadyAssigned = isResponseInCategory(category, responseId);
      const payload = { responseId, questionId: selectedQuestionId };

      if (alreadyAssigned) {
        await removeFeedbackResponseFromCategory(form._id, category._id, payload);
      } else {
        await assignFeedbackResponseToCategory(form._id, category._id, payload);
      }

      await loadCategories();
    } catch (err) {
      console.error("Failed to update category response:", err);
      setError(
        err?.response?.data?.error || "Unable to update response category."
      );
    } finally {
      setTogglingResponseId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RENAME / DELETE CATEGORY (new)
  |--------------------------------------------------------------------------
  */

  const handleRenameCategory = async (category, { name, description }) => {
    const trimmedName = name.trim();
    if (!trimmedName) return { ok: false, error: "Name can't be empty." };

    try {
      await updateFeedbackCategory(form._id, category._id, {
        name: trimmedName,
        description: description.trim(),
      });
      await loadCategories();
      return { ok: true };
    } catch (err) {
      console.error("Failed to rename category:", err);
      return {
        ok: false,
        error: err?.response?.data?.error || "Unable to rename category.",
      };
    }
  };

  const handleDeleteCategory = async (category) => {
    if (typeof deleteFeedbackCategory !== "function") {
      setError(
        "Deleting categories isn't wired up on the backend yet — add a deleteFeedbackCategory service call and DELETE route to enable this."
      );
      return { ok: false };
    }

    try {
      await deleteFeedbackCategory(form._id, category._id);
      await loadCategories();
      return { ok: true };
    } catch (err) {
      console.error("Failed to delete category:", err);
      setError(err?.response?.data?.error || "Unable to delete category.");
      return { ok: false };
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESPONSES FOR SELECTED QUESTION
  |--------------------------------------------------------------------------
  */

  const questionResponses = useMemo(() => {
    if (!selectedQuestionId) return [];

    return (responses || []).filter((response) => {
      const answer = getAnswerForQuestion(response, selectedQuestionId);
      return answer !== null && answer !== undefined && String(answer).trim() !== "";
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses, selectedQuestionId]);

  /*
  |--------------------------------------------------------------------------
  | OVERVIEW STATS (new)
  |--------------------------------------------------------------------------
  */

  const overview = useMemo(() => {
    const totalResponses = questionResponses.length;
    const categorizedIds = new Set();

    categories.forEach((category) => {
      (category?.responseRefs || []).forEach((ref) => {
        categorizedIds.add(String(ref?.responseId));
      });
    });

    const categorizedCount = questionResponses.filter((response) =>
      categorizedIds.has(getResponseId(response))
    ).length;

    const statusCounts = { planned: 0, in_progress: 0, completed: 0 };
    categories.forEach((category) => {
      const status = category?.actionStatus || "planned";
      if (statusCounts[status] !== undefined) statusCounts[status] += 1;
    });

    return {
      totalResponses,
      categorizedCount,
      uncategorizedCount: Math.max(totalResponses - categorizedCount, 0),
      totalCategories: categories.length,
      statusCounts,
      pct:
        totalResponses > 0
          ? Math.round((categorizedCount / totalResponses) * 100)
          : 0,
    };
  }, [categories, questionResponses]);

  /*
  |--------------------------------------------------------------------------
  | NO TEXT QUESTIONS
  |--------------------------------------------------------------------------
  */

  if (textQuestions.length === 0) return null;

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <section className="rounded-2xl border border-[rgb(var(--cv-border))] bg-cv-surface p-6 shadow-sm">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--cv-success-soft))] text-[rgb(var(--cv-success))]">
              <Tag size={16} />
            </span>
            <h2 className="text-base font-semibold text-[rgb(var(--cv-text))]">
              Response Categorization
            </h2>
          </div>
          <p className="mt-1.5 text-sm text-[rgb(var(--cv-text-muted))]">
            Group open-ended student responses into meaningful themes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm((current) => !current)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[rgb(var(--cv-success))] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[rgb(var(--cv-success))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--cv-success))]"
        >
          <Plus size={16} />
          Create Category
        </button>
      </div>

      {/* OVERVIEW STRIP (new) */}
      {categories.length > 0 && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[rgb(var(--cv-border))] bg-[rgb(var(--cv-surface-soft))] p-4">
            <p className="text-xs font-medium text-[rgb(var(--cv-text-subtle))]">Categorized</p>
            <p className="mt-1 text-lg font-semibold text-[rgb(var(--cv-text))]">
              {overview.categorizedCount}
              <span className="text-sm font-normal text-[rgb(var(--cv-text-subtle))]">
                {" "}
                / {overview.totalResponses}
              </span>
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--cv-border))]">
              <div
                className="h-full rounded-full bg-[rgb(var(--cv-success))] transition-all duration-500"
                style={{ width: `${overview.pct}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-[rgb(var(--cv-border))] bg-[rgb(var(--cv-surface-soft))] p-4">
            <p className="text-xs font-medium text-[rgb(var(--cv-text-subtle))]">Themes</p>
            <p className="mt-1 text-lg font-semibold text-[rgb(var(--cv-text))]">
              {overview.totalCategories}
            </p>
            <p className="mt-2 text-xs text-[rgb(var(--cv-text-subtle))]">
              {overview.uncategorizedCount} response
              {overview.uncategorizedCount === 1 ? "" : "s"} still unsorted
            </p>
          </div>

          <div className="rounded-xl border border-[rgb(var(--cv-border))] bg-[rgb(var(--cv-surface-soft))] p-4">
            <p className="text-xs font-medium text-[rgb(var(--cv-text-subtle))]">Action status</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(overview.statusCounts).map(([status, count]) => {
                const meta = STATUS_META[status];
                return (
                  <span
                    key={status}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.bg} ${meta.text}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {count} {meta.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* QUESTION SELECTOR */}
      <div className="mt-6">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[rgb(var(--cv-text-subtle))]">
          Open-ended Question
        </label>
        <div className="relative">
          <select
            value={selectedQuestionId}
            onChange={(event) => setSelectedQuestionId(event.target.value)}
            className="w-full appearance-none rounded-xl border border-[rgb(var(--cv-border))] bg-[rgb(var(--cv-surface-soft))] px-4 py-3 pr-10 text-sm text-[rgb(var(--cv-text))] outline-none transition focus:border-[rgb(var(--cv-success))] focus:bg-cv-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--cv-success))]"
          >
            {textQuestions.map((question, index) => (
              <option key={question.id} value={question.id}>
                Question {index + 1}: {question.question}
              </option>
            ))}
          </select>
          <ChevronDown
            size={17}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--cv-text-subtle))]"
          />
        </div>
      </div>

      {/* CREATE CATEGORY */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          showCreateForm ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="rounded-xl border border-[rgb(var(--cv-border))] bg-[rgb(var(--cv-surface-soft))] p-5">
            <h3 className="text-sm font-semibold text-[rgb(var(--cv-text))]">
              Create Response Category
            </h3>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="e.g. Wi-Fi / Internet"
                className="w-full rounded-xl border border-[rgb(var(--cv-border))] bg-cv-surface px-4 py-3 text-sm text-[rgb(var(--cv-text))] outline-none transition focus:border-[rgb(var(--cv-success))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--cv-success))]"
              />

              <textarea
                value={newCategoryDescription}
                onChange={(event) => setNewCategoryDescription(event.target.value)}
                placeholder="Optional description"
                rows={2}
                className="w-full resize-none rounded-xl border border-[rgb(var(--cv-border))] bg-cv-surface px-4 py-3 text-sm text-[rgb(var(--cv-text))] outline-none transition focus:border-[rgb(var(--cv-success))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--cv-success))]"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={creatingCategory || !newCategoryName.trim()}
                  onClick={handleCreateCategory}
                  className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--cv-success))] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[rgb(var(--cv-success))] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingCategory ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Save Category
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[rgb(var(--cv-border))] bg-cv-surface px-4 py-2.5 text-sm font-medium text-[rgb(var(--cv-text-muted))] transition hover:bg-[rgb(var(--cv-surface-muted))]"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-[rgb(var(--cv-danger-border))] bg-[rgb(var(--cv-danger-soft))] px-4 py-3 text-sm text-[rgb(var(--cv-danger))]">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* LOADING */}
      {loading ? (
        <div className="mt-6 space-y-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl border border-[rgb(var(--cv-border))] bg-[rgb(var(--cv-surface-muted))]"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        /* EMPTY */
        <div className="mt-6 rounded-xl border border-dashed border-[rgb(var(--cv-border-strong))] bg-[rgb(var(--cv-surface-soft))] p-8 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--cv-success-soft))] text-[rgb(var(--cv-success))]">
            <Sprout size={22} />
          </span>
          <h3 className="text-sm font-semibold text-[rgb(var(--cv-text))]">
            No categories yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[rgb(var(--cv-text-muted))]">
            Create categories such as "Wi-Fi / Internet", "Hostel", "Faculty",
            or "Infrastructure" to start grouping responses into themes.
          </p>
        </div>
      ) : (
        /* CATEGORIES */
        <div className="mt-6 space-y-4">
          {categories.map((category) => {
            const assignedResponses = questionResponses.filter((response) =>
              isResponseInCategory(category, getResponseId(response))
            );

            return (
              <CategoryCard
                key={category._id}
                category={category}
                assignedResponses={assignedResponses}
                allResponses={questionResponses}
                form={form}
                selectedQuestionId={selectedQuestionId}
                onToggleResponse={toggleResponseCategory}
                onRename={handleRenameCategory}
                onDelete={handleDeleteCategory}
                getAnswerForQuestion={getAnswerForQuestion}
                formatAnswer={formatAnswer}
                togglingResponseId={togglingResponseId}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| CATEGORY CARD
|--------------------------------------------------------------------------
*/

function CategoryCard({
  category,
  assignedResponses,
  allResponses,
  form,
  selectedQuestionId,
  onToggleResponse,
  onRename,
  onDelete,
  getAnswerForQuestion,
  formatAnswer,
  togglingResponseId,
}) {
  const [expanded, setExpanded] = useState(true);

  const [conclusion, setConclusion] = useState(category?.conclusion || "");
  const [action, setAction] = useState(category?.action || "");
  const [responsibleDepartment, setResponsibleDepartment] = useState(
    category?.responsibleDepartment || ""
  );
  const [expectedCompletion, setExpectedCompletion] = useState(
    category?.expectedCompletion || ""
  );
  const [actionStatus, setActionStatus] = useState(
    category?.actionStatus || "planned"
  );
  const [savingCategory, setSavingCategory] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Rename (new)
  const [renaming, setRenaming] = useState(false);
  const [renameName, setRenameName] = useState(category?.name || "");
  const [renameDescription, setRenameDescription] = useState(
    category?.description || ""
  );
  const [renameSaving, setRenameSaving] = useState(false);
  const [renameError, setRenameError] = useState("");

  // Delete (new)
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Assign-list filters (new)
  const [searchTerm, setSearchTerm] = useState("");
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  useEffect(() => {
    setConclusion(category?.conclusion || "");
    setAction(category?.action || "");
    setResponsibleDepartment(category?.responsibleDepartment || "");
    setExpectedCompletion(category?.expectedCompletion || "");
    setActionStatus(category?.actionStatus || "planned");
    setRenameName(category?.name || "");
    setRenameDescription(category?.description || "");
  }, [category]);

  const assignedIds = new Set(
    (category?.responseRefs || []).map((ref) => String(ref?.responseId))
  );

  const handleSave = async () => {
    try {
      setSavingCategory(true);
      setSaveError("");
      setSaved(false);

      await updateFeedbackCategory(form._id, category._id, {
        conclusion: conclusion.trim(),
        action: action.trim(),
        responsibleDepartment: responsibleDepartment.trim(),
        expectedCompletion: expectedCompletion.trim(),
        actionStatus,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Failed to save category action:", error);
      setSaveError(
        error?.response?.data?.error || "Unable to save conclusion/action."
      );
    } finally {
      setSavingCategory(false);
    }
  };

  const handleRenameSave = async () => {
    setRenameSaving(true);
    setRenameError("");
    const result = await onRename(category, {
      name: renameName,
      description: renameDescription,
    });
    setRenameSaving(false);

    if (result?.ok) {
      setRenaming(false);
    } else {
      setRenameError(result?.error || "Unable to rename category.");
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const result = await onDelete(category);
    setDeleting(false);
    if (!result?.ok) setConfirmingDelete(false);
  };

  const toggleExpanded = () => {
    if (renaming || confirmingDelete) return;
    setExpanded((current) => !current);
  };

  // Search + "unassigned only" filter applied to the assign-list (new).
  const visibleAllResponses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return allResponses.filter((response) => {
      const responseId = getResponseId(response);
      const isAssigned = assignedIds.has(responseId);

      if (unassignedOnly && isAssigned) return false;
      if (!term) return true;

      const answerText = formatAnswer(
        getAnswerForQuestion(response, selectedQuestionId)
      ).toLowerCase();

      return answerText.includes(term);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allResponses, searchTerm, unassignedOnly, category]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgb(var(--cv-border))]">
      {/* HEADER ROW */}
      <div className="flex items-center gap-3 bg-[rgb(var(--cv-surface-soft))] px-5 py-4">
        <div
          role="button"
          tabIndex={0}
          onClick={toggleExpanded}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggleExpanded();
            }
          }}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
          aria-expanded={expanded}
        >
          <ChevronDown
            size={16}
            className={`shrink-0 text-[rgb(var(--cv-text-subtle))] transition-transform duration-200 ${
              expanded ? "rotate-0" : "-rotate-90"
            }`}
          />

          <div className="min-w-0 flex-1">
            {renaming ? (
              <div
                className="space-y-2"
                onClick={(event) => event.stopPropagation()}
              >
                <input
                  autoFocus
                  value={renameName}
                  onChange={(event) => setRenameName(event.target.value)}
                  className="w-full rounded-lg border border-[rgb(var(--cv-border))] bg-cv-surface px-3 py-1.5 text-sm font-semibold text-[rgb(var(--cv-text))] outline-none focus:border-[rgb(var(--cv-success))]"
                />
                <input
                  value={renameDescription}
                  onChange={(event) => setRenameDescription(event.target.value)}
                  placeholder="Optional description"
                  className="w-full rounded-lg border border-[rgb(var(--cv-border))] bg-cv-surface px-3 py-1.5 text-xs text-[rgb(var(--cv-text-muted))] outline-none focus:border-[rgb(var(--cv-success))]"
                />
                {renameError && (
                  <p className="text-xs text-[rgb(var(--cv-danger))]">{renameError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={renameSaving || !renameName.trim()}
                    onClick={handleRenameSave}
                    className="inline-flex items-center gap-1 rounded-lg bg-[rgb(var(--cv-success))] px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
                  >
                    {renameSaving ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRenaming(false);
                      setRenameName(category?.name || "");
                      setRenameDescription(category?.description || "");
                      setRenameError("");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-[rgb(var(--cv-border))] bg-cv-surface px-2.5 py-1 text-xs font-medium text-[rgb(var(--cv-text-muted))]"
                  >
                    <X size={12} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Tag size={16} className="shrink-0 text-[rgb(var(--cv-text-subtle))]" />
                  <h3 className="truncate text-sm font-semibold text-[rgb(var(--cv-text))]">
                    {category.name}
                  </h3>
                  <StatusPill status={actionStatus} />
                </div>
                {category.description && (
                  <p className="mt-1 truncate text-xs text-[rgb(var(--cv-text-subtle))]">
                    {category.description}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {!renaming && (
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-cv-surface px-3 py-1 text-xs font-medium text-[rgb(var(--cv-text-muted))]">
              {assignedResponses.length} response
              {assignedResponses.length === 1 ? "" : "s"}
            </span>

            <button
              type="button"
              onClick={() => setRenaming(true)}
              aria-label="Rename category"
              className="rounded-lg p-1.5 text-[rgb(var(--cv-text-subtle))] transition hover:bg-cv-surface hover:text-[rgb(var(--cv-text))]"
            >
              <Pencil size={15} />
            </button>

            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              aria-label="Delete category"
              className="rounded-lg p-1.5 text-[rgb(var(--cv-text-subtle))] transition hover:bg-[rgb(var(--cv-danger-soft))] hover:text-[rgb(var(--cv-danger))]"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION */}
      {confirmingDelete && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgb(var(--cv-danger-border))] bg-[rgb(var(--cv-danger-soft))] px-5 py-3 text-sm text-[rgb(var(--cv-danger))]">
          <span>
            Delete "{category.name}"? This unassigns {assignedResponses.length}{" "}
            response{assignedResponses.length === 1 ? "" : "s"} and can't be
            undone.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteConfirm}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[rgb(var(--cv-danger))] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {deleting && <Loader2 size={12} className="animate-spin" />}
              Delete
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => setConfirmingDelete(false)}
              className="rounded-lg border border-[rgb(var(--cv-danger-border))] bg-cv-surface px-3 py-1.5 text-xs font-medium text-[rgb(var(--cv-danger))]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* EXPANDABLE BODY */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-5">
            <div className="mb-6 rounded-xl border border-[rgb(var(--cv-border))] bg-[rgb(var(--cv-surface-soft))] p-5">
              <h4 className="text-sm font-semibold text-[rgb(var(--cv-text))]">
                Administration Analysis & Action
              </h4>
              <p className="mt-1 text-xs leading-5 text-[rgb(var(--cv-text-subtle))]">
                Record the administration's conclusion and the corrective
                action for this theme.
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[rgb(var(--cv-text-muted))]">
                    Conclusion
                  </label>
                  <textarea
                    value={conclusion}
                    onChange={(event) => setConclusion(event.target.value)}
                    rows={3}
                    placeholder="What does this group of responses indicate?"
                    className="w-full resize-y rounded-xl border border-[rgb(var(--cv-border))] bg-cv-surface px-4 py-3 text-sm leading-6 text-[rgb(var(--cv-text))] outline-none transition focus:border-[rgb(var(--cv-success))]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-[rgb(var(--cv-text-muted))]">
                    Action Taken / Action Plan
                  </label>
                  <textarea
                    value={action}
                    onChange={(event) => setAction(event.target.value)}
                    rows={3}
                    placeholder="What action will the administration take?"
                    className="w-full resize-y rounded-xl border border-[rgb(var(--cv-border))] bg-cv-surface px-4 py-3 text-sm leading-6 text-[rgb(var(--cv-text))] outline-none transition focus:border-[rgb(var(--cv-success))]"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[rgb(var(--cv-text-muted))]">
                      Responsible Department
                    </label>
                    <input
                      value={responsibleDepartment}
                      onChange={(event) =>
                        setResponsibleDepartment(event.target.value)
                      }
                      placeholder="e.g. IT Cell"
                      className="w-full rounded-xl border border-[rgb(var(--cv-border))] bg-cv-surface px-4 py-3 text-sm text-[rgb(var(--cv-text))] outline-none transition focus:border-[rgb(var(--cv-success))]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[rgb(var(--cv-text-muted))]">
                      Expected Completion
                    </label>
                    <input
                      type="date"
                      value={expectedCompletion}
                      onChange={(event) =>
                        setExpectedCompletion(event.target.value)
                      }
                      className="w-full rounded-xl border border-[rgb(var(--cv-border))] bg-cv-surface px-4 py-3 text-sm text-[rgb(var(--cv-text))] outline-none transition focus:border-[rgb(var(--cv-success))]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[rgb(var(--cv-text-muted))]">
                      Status
                    </label>
                    <select
                      value={actionStatus}
                      onChange={(event) => setActionStatus(event.target.value)}
                      className="w-full rounded-xl border border-[rgb(var(--cv-border))] bg-cv-surface px-4 py-3 text-sm text-[rgb(var(--cv-text))] outline-none transition focus:border-[rgb(var(--cv-success))]"
                    >
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {saveError && (
                  <div className="rounded-xl border border-[rgb(var(--cv-danger-border))] bg-[rgb(var(--cv-danger-soft))] px-4 py-3 text-xs text-[rgb(var(--cv-danger))]">
                    {saveError}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={savingCategory}
                    onClick={handleSave}
                    className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--cv-success))] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[rgb(var(--cv-success))] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingCategory ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save Analysis & Action
                  </button>
                  {saved && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--cv-success))]">
                      <Check size={14} /> Saved
                    </span>
                  )}
                </div>
              </div>
            </div>

            {assignedResponses.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--cv-text-subtle))]">
                  Categorized Responses
                </p>

                {assignedResponses.map((response, index) => {
                  const responseId = getResponseId(response);
                  const answer = getAnswerForQuestion(
                    response,
                    selectedQuestionId
                  );
                  const anonymous = Boolean(
                    form?.anonymous || response?.anonymous
                  );
                  const respondent = anonymous
                    ? `Anonymous Response #${index + 1}`
                    : response?.studentId || "Identified Student";
                  const isToggling = togglingResponseId === responseId;

                  return (
                    <div
                      key={responseId || `idx-${index}`}
                      className="rounded-xl border border-[rgb(var(--cv-border))] bg-cv-surface p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-xs font-medium text-[rgb(var(--cv-text-subtle))]">
                          <MessageSquareText size={14} />
                          {respondent}
                        </span>
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => onToggleResponse(category, response)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[rgb(var(--cv-danger))] transition hover:text-[rgb(var(--cv-danger))] disabled:opacity-50"
                        >
                          {isToggling && (
                            <Loader2 size={12} className="animate-spin" />
                          )}
                          Remove
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-[rgb(var(--cv-text-secondary))]">
                        {formatAnswer(answer)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[rgb(var(--cv-border-strong))] bg-[rgb(var(--cv-surface-soft))] p-5 text-center">
                <p className="text-sm text-[rgb(var(--cv-text-subtle))]">
                  No responses assigned to this category yet.
                </p>
              </div>
            )}

            {allResponses.length > 0 && (
              <div className="mt-6 border-t border-[rgb(var(--cv-success-soft))] pt-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--cv-text-subtle))]">
                    Assign Responses
                  </p>

                  <label className="flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--cv-text-muted))]">
                    <input
                      type="checkbox"
                      checked={unassignedOnly}
                      onChange={(event) =>
                        setUnassignedOnly(event.target.checked)
                      }
                      className="h-3.5 w-3.5 rounded border-[rgb(var(--cv-border-strong))] text-[rgb(var(--cv-success))] focus:ring-[rgb(var(--cv-success))]"
                    />
                    Unassigned only
                  </label>
                </div>

                <div className="relative mb-3">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--cv-text-subtle))]"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search response text..."
                    className="w-full rounded-xl border border-[rgb(var(--cv-border))] bg-cv-surface py-2 pl-9 pr-3 text-sm text-[rgb(var(--cv-text))] outline-none transition focus:border-[rgb(var(--cv-success))]"
                  />
                </div>

                {visibleAllResponses.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[rgb(var(--cv-border-strong))] bg-[rgb(var(--cv-surface-soft))] p-4 text-center text-sm text-[rgb(var(--cv-text-subtle))]">
                    No responses match this filter.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {visibleAllResponses.map((response) => {
                      const responseId = getResponseId(response);
                      const assigned = assignedIds.has(responseId);
                      const answer = getAnswerForQuestion(
                        response,
                        selectedQuestionId
                      );
                      const isToggling = togglingResponseId === responseId;

                      return (
                        <button
                          key={responseId}
                          type="button"
                          disabled={isToggling}
                          onClick={() => onToggleResponse(category, response)}
                          className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                            assigned
                              ? "border-[rgb(var(--cv-success-border))] bg-[rgb(var(--cv-success-soft))]"
                              : "border-[rgb(var(--cv-border))] bg-cv-surface hover:bg-[rgb(var(--cv-surface-soft))]"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              assigned
                                ? "border-[rgb(var(--cv-success))] bg-[rgb(var(--cv-success))] text-white"
                                : "border-[rgb(var(--cv-border-strong))] bg-cv-surface"
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              assigned && <Check size={13} />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-medium text-[rgb(var(--cv-text-subtle))]">
                              {assigned ? "Categorized" : "Available response"}
                            </span>
                            <span className="mt-1 block whitespace-pre-wrap text-sm leading-5 text-[rgb(var(--cv-text-secondary))]">
                              {formatAnswer(answer)}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}