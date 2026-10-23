import { useState } from "react";
import { BarChart2, Plus, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { createPoll } from "../../../shared/services/polls.service.js";
import { cv, SANS } from "../../../shared/design-system/inline.js";
import { ActionButton } from "./AdminIssueRows.jsx";

export function PollCreator({ polls, onCreated, onDelete, showCreator = true }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!question.trim()) {
      toast.error("Add a question.");
      return;
    }

    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      toast.error("Add at least 2 options.");
      return;
    }

    setCreating(true);
    try {
      await createPoll({ question: question.trim(), options: validOptions });
      setQuestion("");
      setOptions(["", ""]);
      await onCreated();
      toast.success("Poll created.");
    } catch {
      toast.error("Failed to create poll.");
    } finally {
      setCreating(false);
    }
  };

  const updateOption = (index, value) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      {showCreator && <div className="bg-cv-surface border rounded-lg p-5 sm:p-6" style={{ borderColor: cv.border }}>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
            style={{ background: cv.primarySoft, color: cv.primary }}
          >
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-medium" style={{ ...SANS, color: cv.text }}>
              Create a poll
            </h3>
            <p className="text-xs" style={{ color: cv.textMuted }}>
              Gather student opinions on a quick question
            </p>
          </div>
        </div>

        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What do you want to ask students?"
          className="w-full border rounded-md px-4 py-3 text-sm outline-none mb-3 transition-shadow"
          style={{ borderColor: cv.border, color: cv.text }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${cv.primarySoft}`)}
          onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
        />

        <div className="space-y-2 mb-4">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="w-7 h-9 rounded-md flex items-center justify-center shrink-0 text-xs font-medium"
                style={{ background: cv.surfaceSoft, color: cv.textMuted }}
              >
                {String.fromCharCode(65 + index)}
              </span>

              <input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 border rounded-md px-3.5 py-2.5 text-sm outline-none transition-shadow"
                style={{ borderColor: cv.border, color: cv.text }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${cv.primarySoft}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />

              {options.length > 2 && (
                <button
                  onClick={() => removeOption(index)}
                  aria-label={`Remove option ${index + 1}`}
                  className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 border transition-colors"
                  style={{ borderColor: cv.border, color: cv.textMuted, background: "transparent" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = cv.dangerSoft;
                    e.currentTarget.style.color = cv.danger;
                    e.currentTarget.style.borderColor = cv.dangerSoft;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = cv.textMuted;
                    e.currentTarget.style.borderColor = cv.border;
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ActionButton
            icon={<Plus className="w-3.5 h-3.5" />}
            label="Add option"
            onClick={() => setOptions([...options, ""])}
          />

          <button
            onClick={handleCreate}
            disabled={creating}
            className="text-xs font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-60"
            style={{ background: cv.primary, color: cv.textInverse }}
            onMouseEnter={(e) => !creating && (e.currentTarget.style.background = cv.primaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = cv.primary)}
          >
            {creating ? "Creating…" : "Create poll"}
          </button>
        </div>
      </div>}

      {/* ACTIVE POLLS */}
      {polls.length > 0 && (
        <div>
          <h3 className="text-xs font-medium mb-3" style={{ color: cv.textMuted }}>
            Active polls ({polls.length})
          </h3>

          <div className="space-y-3">
            {polls.map((poll) => (
              <PollCard key={poll.id ?? poll._id} poll={poll} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PollCard({ poll, onDelete }) {
  const options = Array.isArray(poll.options) ? poll.options : [];
  const total = options.reduce((sum, option) => sum + (option.votes || 0), 0);
  const maxVotes = Math.max(0, ...options.map((o) => o.votes || 0));
  const voterCount = (poll.voters || []).length;

  return (
    <div className="bg-cv-surface border rounded-lg p-5" style={{ borderColor: cv.border }}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <p className="text-sm font-medium leading-snug" style={{ color: cv.text }}>
          {poll.question}
        </p>

        <div
          className="flex items-center gap-1.5 shrink-0 text-xs font-medium px-2.5 py-1 rounded-md"
          style={{ background: cv.surfaceSoft, color: cv.textSecondary }}
        >
          <Users className="w-3.5 h-3.5" />
          {voterCount} voter{voterCount !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="space-y-3">
        {options.map((option, index) => {
          const votes = option.votes || 0;
          const percentage = total > 0 ? Math.round((votes / total) * 100) : 0;
          const isLeading = total > 0 && votes === maxVotes && votes > 0;

          return (
            <div key={index}>
              <div className="flex items-center justify-between gap-3 mb-1">
                <span
                  className="text-sm truncate"
                  style={{ color: isLeading ? cv.text : cv.textSecondary, fontWeight: isLeading ? 500 : 400 }}
                >
                  {option.text}
                </span>
                <span
                  className="text-sm shrink-0 tabular-nums"
                  style={{ ...SANS, color: isLeading ? cv.primary : cv.textMuted }}
                >
                  {percentage}%
                </span>
              </div>

              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: cv.surfaceSoft }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${percentage}%`, background: isLeading ? cv.primary : cv.borderStrong }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="flex items-center justify-between mt-4 pt-3.5 border-t"
        style={{ borderColor: cv.border }}
      >
        <span className="text-xs" style={{ color: cv.textMuted }}>
          {total} vote{total !== 1 ? "s" : ""} total
        </span>

        <ActionButton
          icon={<Trash2 className="w-3.5 h-3.5" />}
          label="Delete"
          tone="gray"
          onClick={() => onDelete(poll.id ?? poll._id)}
        />
      </div>
    </div>
  );
}