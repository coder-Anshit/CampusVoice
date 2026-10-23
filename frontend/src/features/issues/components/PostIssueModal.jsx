import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";

const categoryColors = {
  General: "bg-cv-category-purple-soft text-cv-category-purple",
  Hostel: "bg-cv-category-green-soft text-cv-category-green",
  Academics: "bg-cv-category-blue-soft text-cv-category-blue",
};

export default function PostIssueModal({
  open,
  onClose,
  onAdd,
  onBack,
}) {
  const username =
    localStorage.getItem("username") || "";

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [category, setCategory] = useState("General");
  const [anonymous, setAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    const cleanTitle = title.trim();
    const cleanText = text.trim();

    if (cleanTitle.length < 5) {
      toast.error(
        "Please enter a meaningful issue title. (min 5 chars)"
      );
      return;
    }

    if (cleanText.length < 10) {
      toast.error(
        "Please write a more meaningful issue! (min 10 chars)"
      );
      return;
    }

    try {
      setSubmitting(true);

      await onAdd({
        title: cleanTitle,
        text: cleanText,
        category,
        anonymous,
      });

      setTitle("");
      setText("");
      setCategory("General");
      setAnonymous(true);

      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.error ||
        "Unable to submit grievance."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-3">
      <div className="cv-surface cv-text w-[calc(100%-32px)] max-w-sm max-h-[calc(100dvh-24px)] overflow-y-auto p-4 rounded-cv-xl shadow-cv-lg border cv-border">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {onBack && (
              <button type="button" onClick={onBack} disabled={submitting} aria-label="Back to create menu" className="flex h-8 w-8 items-center justify-center rounded-full border cv-border bg-cv-surface-soft cv-text-secondary">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-base font-bold cv-text">Post an Issue</h2>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
          >
            <X className="w-5 h-5 cv-text-muted hover:cv-text transition" />
          </button>
        </div>

        <div className="space-y-3">

          {/* Category */}
          <div>
            <label className="text-xs font-semibold cv-text-secondary mb-1 block">
              Category
            </label>

            <div className="flex gap-2 flex-wrap">
              {["General", "Hostel", "Academics"].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      setCategory(cat)
                    }
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      category === cat
                        ? categoryColors[cat]
                        : "bg-cv-surface-muted cv-text-muted"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold cv-text-secondary mb-1 block">
              Issue Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              disabled={submitting}
              maxLength={120}
              placeholder="e.g. CSE Lab Computers Not Working"
              className="w-full min-h-11 border cv-border bg-cv-surface px-3 py-2.5 rounded-cv-md text-sm outline-none focus:border-cv-primary focus:ring-2 focus:ring-cv-primary/10"
            />

            <p
              className={`text-xs mt-1 text-right ${
                title.trim().length < 5
                  ? "text-cv-danger"
                  : "cv-text-muted"
              }`}
            >
              {title.length}/120
              {title.trim().length < 5
                ? " (min 5)"
                : " ✓"}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold cv-text-secondary mb-1 block">
              Describe the issue
            </label>

            <textarea
              value={text}
              onChange={(e) =>
                setText(e.target.value)
              }
              disabled={submitting}
              placeholder="What's the issue on campus?"
              rows={3}
              className="w-full border cv-border bg-cv-surface px-3 py-2.5 rounded-cv-md text-sm outline-none focus:border-cv-primary focus:ring-2 focus:ring-cv-primary/10 resize-none"
            />

            <p
              className={`text-xs mt-1 text-right ${
                text.trim().length < 10
                  ? "text-cv-danger"
                  : "cv-text-muted"
              }`}
            >
              {text.length} chars
              {text.trim().length < 10
                ? " (min 10)"
                : " ✓"}
            </p>
          </div>

          {/* Identity */}
          <div>
            <label className="text-xs font-semibold cv-text-secondary mb-1 block">
              Posting as
            </label>

            <div
              className="
                w-full
                border border-cv-border
                bg-cv-surface-soft
                px-3
                py-2.5
                rounded-xl
                text-sm
                cv-text-secondary
              "
            >
              {anonymous
                ? "Anonymous"
                : username || "Authenticated User"}
            </div>

            {!anonymous && (
              <p className="text-xs cv-text-muted mt-1">
                Your username is automatically taken
                from your account and cannot be changed.
              </p>
            )}
          </div>

          {/* Anonymous toggle */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={anonymous}
              disabled={submitting}
              onChange={() =>
                setAnonymous(!anonymous)
              }
              className="accent-[rgb(var(--cv-primary))]"
            />

            <span className="cv-text-secondary">
              Post as Anonymous
            </span>
          </label>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full cv-primary-bg hover:bg-cv-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition text-white min-h-11 rounded-xl font-semibold text-sm"
          >
            {submitting
              ? "Checking & submitting…"
              : "Post Issue 🚀"}
          </button>

        </div>
      </div>
    </div>
  );
}