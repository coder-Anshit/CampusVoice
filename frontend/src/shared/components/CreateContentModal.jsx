import { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, Flag, MessageCircle, Plus, X, ClipboardList, Megaphone, Info, AlertTriangle, Siren } from "lucide-react";
import { toast } from "sonner";
import { createDiscussion } from "../services/discussions.service.js";
import { createPoll } from "../services/polls.service.js";
import { createAnnouncement } from "../services/announcements.service.js";
import FeedbackFormBuilder from "../../features/feedback/components/FeedbackFormBuilder.jsx";

const COMMUNITY_ACTIONS = [
  { id: "issue", label: "Create Issue", description: "Report something that needs attention.", icon: Flag, tone: "danger" },
  { id: "discussion", label: "Create Discussion", description: "Start a campus conversation.", icon: MessageCircle, tone: "primary" },
  { id: "poll", label: "Create Poll", description: "Ask a quick question and collect votes.", icon: BarChart3, tone: "primary" },
];

const PRIVILEGED_ACTIONS = [
  ...COMMUNITY_ACTIONS,
  { id: "feedback", label: "Create Feedback", description: "Build a structured student feedback cycle.", icon: ClipboardList, tone: "neutral" },
  { id: "announcement", label: "Create Announcement", description: "Publish an official campus update.", icon: Megaphone, tone: "primary" },
];

const TONES = {
  primary: "bg-cv-primary-soft text-cv-primary",
  danger: "bg-cv-danger-soft text-cv-danger",
  neutral: "bg-cv-surface-soft text-cv-text-secondary",
};

export default function CreateContentModal({ open, mode = "menu", onClose, onSelect, onCreated, privileged = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
      <button aria-label="Close create" onClick={onClose} className="absolute inset-0 bg-black/35 backdrop-blur-[5px]" />
      <section role="dialog" aria-modal="true" className="relative z-10 w-full max-w-md overflow-hidden rounded-[24px] border border-cv-border bg-cv-surface shadow-[0_24px_80px_rgb(30_25_32/0.18)]">
        {mode === "menu" && <CreateMenu onSelect={onSelect} onClose={onClose} privileged={privileged} />}
        {mode === "discussion" && <DiscussionForm onBack={() => onSelect("menu")} onClose={onClose} onCreated={onCreated} />}
        {mode === "poll" && <PollForm onBack={() => onSelect("menu")} onClose={onClose} onCreated={onCreated} />}
        {mode === "announcement" && <AnnouncementForm onBack={() => onSelect("menu")} onClose={onClose} onCreated={onCreated} />}
        {mode === "feedback" && <div className="max-h-[min(86vh,760px)] overflow-y-auto p-4 sm:p-5"><FeedbackFormBuilder onClose={onClose} onCreated={(form) => { onCreated?.("feedback", form); onClose?.(); }} /></div>}
      </section>
    </div>
  );
}

function ModalHeader({ eyebrow, title, subtitle, onBack, onClose }) {
  return (
    <div className="flex items-start gap-3 border-b border-cv-divider px-5 py-4">
      {onBack && (
        <button type="button" onClick={onBack} aria-label="Back" className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cv-border bg-cv-surface-soft text-cv-text-secondary transition hover:bg-cv-primary-soft hover:text-cv-primary">
          <ArrowLeft className="h-4 w-4" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-cv-primary">{eyebrow}</p>
        <h2 className="mt-1 text-[17px] font-bold tracking-[-0.025em] text-cv-text">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[11px] leading-relaxed text-cv-text-secondary">{subtitle}</p>}
      </div>
      <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cv-border bg-cv-surface-soft text-cv-text-muted transition hover:bg-cv-danger-soft hover:text-cv-danger">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function CreateMenu({ onSelect, onClose, privileged }) {
  return (
    <>
      <ModalHeader eyebrow="Quick create" title="Create something" subtitle="Choose what you want to share with your campus." onClose={onClose} />
      <div className="space-y-2.5 p-4 sm:p-5">
        {(privileged ? PRIVILEGED_ACTIONS : COMMUNITY_ACTIONS).map(({ id, label, description, icon: Icon, tone }) => (
          <button key={id} type="button" onClick={() => onSelect(id)} className="group flex w-full items-center gap-3 rounded-[17px] border border-cv-border bg-cv-surface px-3.5 py-3 text-left shadow-cv-xs transition-all hover:-translate-y-px hover:border-cv-primary-border hover:bg-cv-surface-soft active:scale-[0.99]">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${TONES[tone]}`}>
              <Icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-cv-text">{label}</span>
              <span className="mt-0.5 block text-[10.5px] leading-relaxed text-cv-text-secondary">{description}</span>
            </span>
            <span className="text-xs font-bold text-cv-text-muted transition group-hover:text-cv-primary">→</span>
          </button>
        ))}
      </div>
      <p className="px-5 pb-4 text-center text-[9px] font-medium text-cv-text-muted">Your campus. Your voice.</p>
    </>
  );
}

function DiscussionForm({ onBack, onClose, onCreated }) {
  const username = localStorage.getItem("username") || "Anonymous";
  const [anonymous, setAnonymous] = useState(true);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);
  const valid = title.trim() && details.trim();

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await createDiscussion({ title: title.trim(), details: details.trim(), author: username, anonymous });
      toast.success("Discussion created.");
      await onCreated?.("discussion");
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Unable to create discussion.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ModalHeader eyebrow="Discussion" title="Start a discussion" subtitle="Open a topic for students to join." onBack={onBack} onClose={onClose} />
      <div className="space-y-3 p-5">
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="What would you like to discuss?" className="cv-create-input" />
        </Field>
        <Field label="Details">
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="Give some context so others can respond." className="cv-create-input resize-none" />
        </Field>
        <div className="rounded-xl border border-cv-border bg-cv-surface-soft px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-cv-text-muted">Posting as</p>
          <p className="mt-1 text-xs font-semibold text-cv-text-secondary">{anonymous ? "Anonymous" : username}</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-cv-text-secondary">
          <input type="checkbox" checked={anonymous} onChange={() => setAnonymous((value) => !value)} disabled={saving} className="accent-[rgb(var(--cv-primary))]" />
          Post anonymously
        </label>
        <div className="flex justify-end pt-1">
          <button type="button" disabled={!valid || saving} onClick={submit} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-cv-primary px-4 text-xs font-bold text-white shadow-cv-sm transition hover:bg-cv-primary-hover disabled:cursor-not-allowed disabled:opacity-45">
            {saving ? "Creating…" : "Create discussion"}
          </button>
        </div>
      </div>
    </>
  );
}

function PollForm({ onBack, onClose, onCreated }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [saving, setSaving] = useState(false);
  const [anonymous, setAnonymous] = useState(true);
  const validOptions = options.map((v) => v.trim()).filter(Boolean);
  const valid = question.trim() && validOptions.length >= 2;

  const update = (index, value) => setOptions((items) => items.map((item, i) => i === index ? value : item));
  const remove = (index) => setOptions((items) => items.length <= 2 ? items : items.filter((_, i) => i !== index));

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      await createPoll({ question: question.trim(), options: validOptions, author: localStorage.getItem("username") || "Anonymous", anonymous });
      toast.success("Poll created.");
      setQuestion("");
      setOptions(["", ""]);
      await onCreated?.("poll");
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Unable to create poll.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ModalHeader eyebrow="Poll" title="Create a poll" subtitle="Ask one clear question and collect votes." onBack={onBack} onClose={onClose} />
      <div className="space-y-3 p-5">
        <Field label="Question">
          <input value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={180} placeholder="What do you want to ask?" className="cv-create-input" />
        </Field>
        <Field label="Options">
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex h-9 w-8 shrink-0 items-center justify-center rounded-lg bg-cv-surface-soft text-[10px] font-bold text-cv-text-muted">{String.fromCharCode(65 + index)}</span>
                <input value={option} onChange={(e) => update(index, e.target.value)} placeholder={`Option ${index + 1}`} className="cv-create-input min-w-0 flex-1" />
                {options.length > 2 && <button type="button" onClick={() => remove(index)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cv-border text-cv-text-muted hover:bg-cv-danger-soft hover:text-cv-danger">×</button>}
              </div>
            ))}
          </div>
        </Field>
        <div className="rounded-xl border border-cv-border bg-cv-surface-soft px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-cv-text-muted">Posting as</p>
          <p className="mt-1 text-xs font-semibold text-cv-text-secondary">{anonymous ? "Anonymous" : (localStorage.getItem("username") || "Authenticated User")}</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-cv-text-secondary">
          <input type="checkbox" checked={anonymous} onChange={() => setAnonymous((value) => !value)} disabled={saving} className="accent-[rgb(var(--cv-primary))]" />
          Post anonymously
        </label>
        <div className="flex items-center justify-between gap-3 pt-1">
          <button type="button" onClick={() => setOptions((items) => [...items, ""])} className="inline-flex items-center gap-1 text-[10px] font-bold text-cv-primary hover:text-cv-primary-hover"><Plus className="h-3 w-3" /> Add option</button>
          <button type="button" disabled={!valid || saving} onClick={submit} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-cv-primary px-4 text-xs font-bold text-white shadow-cv-sm transition hover:bg-cv-primary-hover disabled:cursor-not-allowed disabled:opacity-45">
            {saving ? "Creating…" : "Create poll"}
          </button>
        </div>
      </div>
    </>
  );
}

function AnnouncementForm({ onBack, onClose, onCreated }) {
  const username = localStorage.getItem("username") || "Admin";
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState("normal");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const priorities = [
    ["normal", "Normal", Info],
    ["important", "Important", AlertTriangle],
    ["urgent", "Urgent", Siren],
  ];
  const valid = title.trim() && details.trim();

  const submit = async () => {
    if (!valid || saving) return;
    try {
      setSaving(true);
      setError("");
      await createAnnouncement({ title: title.trim(), details: details.trim(), priority, author: username });
      toast.success("Announcement published.");
      await onCreated?.("announcement");
      onClose();
    } catch (e) {
      setError(e?.response?.data?.error || "Unable to publish announcement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ModalHeader eyebrow="Announcement" title="Create an announcement" subtitle="Publish an official campus update." onBack={onBack} onClose={onClose} />
      <div className="space-y-3 p-5">
        <Field label="Title"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Announcement title" className="cv-create-input" /></Field>
        <Field label="Details"><textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="Write the announcement details…" className="cv-create-input resize-none" /></Field>
        <Field label="Priority">
          <div className="flex gap-2">
            {priorities.map(([value, label, Icon]) => <button key={value} type="button" onClick={() => setPriority(value)} className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold ${priority === value ? "border-cv-primary bg-cv-primary text-white" : "border-cv-border bg-cv-surface-soft text-cv-text-secondary"}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}
          </div>
        </Field>
        {error && <p className="rounded-xl bg-cv-danger-soft px-3 py-2.5 text-xs font-semibold text-cv-danger">{error}</p>}
        <div className="flex justify-end pt-1"><button type="button" disabled={!valid || saving} onClick={submit} className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-cv-primary px-4 text-xs font-bold text-white shadow-cv-sm disabled:cursor-not-allowed disabled:opacity-45">{saving ? "Publishing…" : "Publish announcement"}</button></div>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-cv-text-muted">{label}</span>{children}</label>;
}
