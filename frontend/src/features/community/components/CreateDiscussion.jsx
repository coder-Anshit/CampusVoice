import { useState } from "react";
import { createDiscussion } from "../../../shared/services/discussions.service.js";
import { MessagesSquare } from "lucide-react";
import { cv, SANS } from "../../../shared/design-system/inline.js";

export default function CreateDiscussion({ user, onCreate }) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const canPost = title.trim().length > 0 && details.trim().length > 0;
  const authorName = user?.name ?? "Admin";

  const handleCreate = async () => {
    if (!canPost || posting) return;
    setError("");
    setPosting(true);
    try {
      await createDiscussion({
        title: title.trim(),
        details: details.trim(),
        author: authorName,
      });
      setTitle("");
      setDetails("");
      if (onCreate) await onCreate();
    } catch {
      setError("Failed to post discussion. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-cv-surface border rounded-lg p-5 sm:p-6 mb-4" style={{ borderColor: cv.border }}>
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
          style={{ background: cv.primarySoft, color: cv.primary }}
        >
          <MessagesSquare className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-medium" style={{ ...SANS, color: cv.text }}>
            Start a discussion
          </h2>
          <p className="text-xs" style={{ color: cv.textMuted }}>
            Open a topic for everyone to join
          </p>
        </div>
      </div>

      <input
        placeholder="Discussion title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
        className="w-full border rounded-md px-4 py-3 text-sm mb-3 outline-none transition-shadow"
        style={{ borderColor: cv.border, color: cv.text }}
        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${cv.primarySoft}`)}
        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
      />

      <textarea
        placeholder="What would you like to discuss? Give context to get better responses."
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={3}
        className="w-full border rounded-md px-4 py-3 text-sm mb-4 outline-none resize-none transition-shadow"
        style={{ borderColor: cv.border, color: cv.text }}
        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${cv.primarySoft}`)}
        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
      />

      {error && (
        <div
          className="rounded-md px-4 py-2.5 mb-4"
          style={{ background: cv.dangerSoft, border: `1px solid ${cv.dangerSoft}` }}
        >
          <p className="text-xs" style={{ color: cv.danger }}>
            {error}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ background: cv.primary }}
          >
            <span className="text-white text-[10px] font-medium uppercase">{authorName[0]}</span>
          </div>
          <span className="text-xs" style={{ color: cv.textMuted }}>
            as <span className="font-medium" style={{ color: cv.textSecondary }}>{authorName}</span>
          </span>
        </div>

        <button
          onClick={handleCreate}
          disabled={!canPost || posting}
          className="text-sm font-medium px-5 py-2 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: cv.primary, color: cv.textInverse }}
          onMouseEnter={(e) => !(!canPost || posting) && (e.currentTarget.style.background = cv.primaryHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = cv.primary)}
        >
          {posting ? "Posting…" : "Post discussion"}
        </button>
      </div>
    </div>
  );
}