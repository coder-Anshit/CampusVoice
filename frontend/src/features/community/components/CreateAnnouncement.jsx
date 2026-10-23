import { useState } from "react";
import { createAnnouncement } from "../../../shared/services/announcements.service.js";
import { Megaphone, Info, AlertTriangle, Siren } from "lucide-react";
import { cv, SANS } from "../../../shared/design-system/inline.js";

const PRIORITIES = [
  { value: "normal", label: "Normal", icon: Info, accent: cv.info, tint: cv.infoSoft },
  { value: "important", label: "Important", icon: AlertTriangle, accent: cv.warning, tint: cv.warningSoft },
  { value: "urgent", label: "Urgent", icon: Siren, accent: cv.danger, tint: cv.dangerSoft },
];

export default function CreateAnnouncement({ user, onCreate }) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState("normal");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const canPost = title.trim().length > 0 && details.trim().length > 0;
  const selected = PRIORITIES.find((p) => p.value === priority);

  const handleCreate = async () => {
    if (!canPost || posting) return;
    setError("");
    setPosting(true);
    try {
      await createAnnouncement({
        title: title.trim(),
        details: details.trim(),
        priority,
        author: user?.name ?? "Admin",
      });
      setTitle("");
      setDetails("");
      setPriority("normal");
      if (onCreate) await onCreate();
    } catch {
      setError("Failed to post announcement. Please try again.");
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
          <Megaphone className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-medium" style={{ ...SANS, color: cv.text }}>
            New announcement
          </h2>
          <p className="text-xs" style={{ color: cv.textMuted }}>
            Broadcast to all students
          </p>
        </div>
      </div>

      <input
        placeholder="Announcement title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
        className="w-full border rounded-md px-4 py-3 text-sm mb-3 outline-none transition-shadow"
        style={{ borderColor: cv.border, color: cv.text }}
        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${cv.primarySoft}`)}
        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
      />

      <textarea
        placeholder="Write the details here…"
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        rows={3}
        className="w-full border rounded-md px-4 py-3 text-sm mb-4 outline-none resize-none transition-shadow"
        style={{ borderColor: cv.border, color: cv.text }}
        onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${cv.primarySoft}`)}
        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
      />

      <p className="text-xs font-medium mb-2.5" style={{ color: cv.textMuted }}>
        Priority
      </p>
      <div className="flex gap-2 mb-5">
        {PRIORITIES.map(({ value, label, icon: Icon, accent, tint }) => {
          const active = priority === value;
          return (
            <button
              key={value}
              onClick={() => setPriority(value)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-md border transition-colors"
              style={
                active
                  ? { background: accent, color: cv.textInverse, borderColor: accent }
                  : { background: tint, color: accent, borderColor: "transparent" }
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="rounded-md px-4 py-2.5 mb-4" style={{ background: cv.dangerSoft, border: `1px solid ${cv.dangerSoft}` }}>
          <p className="text-xs" style={{ color: cv.danger }}>
            {error}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md"
          style={{ background: selected.tint, color: selected.accent }}
        >
          <selected.icon className="w-3.5 h-3.5" />
          {selected.label}
        </span>

        <button
          onClick={handleCreate}
          disabled={!canPost || posting}
          className="text-sm font-medium px-5 py-2 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: cv.primary, color: cv.textInverse }}
          onMouseEnter={(e) => !(!canPost || posting) && (e.currentTarget.style.background = cv.primaryHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = cv.primary)}
        >
          {posting ? "Posting…" : "Post announcement"}
        </button>
      </div>
    </div>
  );
}