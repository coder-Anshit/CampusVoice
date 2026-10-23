import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlignLeft,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Eye,
  GripVertical,
  Plus,
  Send,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createFeedbackForm,
  fetchFeedbackForms,
  fetchFeedbackForm,
  fetchFeedbackStatistics,
  fetchFeedbackResponses,
  publishFeedbackForm,
  closeFeedbackForm,
} from "../services/feedback.service.js";
import FeedbackAdminResults from "../../features/feedback/components/FeedbackAdminResults.jsx";
import FeedbackFormBuilder from "../../features/feedback/components/FeedbackFormBuilder.jsx";
import {
  MobileBadge,
  MobileButton,
  MobileCard,
  MobileEmptyState,
  MobileSection,
  MobileSkeleton,
} from "./primitives/index.js";

const QUESTION_TYPES = [
  { value: "long_text", label: "Long answer", icon: AlignLeft },
  { value: "short_text", label: "Short answer", icon: AlignLeft },
  { value: "mcq", label: "Multiple choice", icon: Check },
  { value: "rating", label: "Rating", icon: BarChart3 },
  { value: "yes_no", label: "Yes / No", icon: Check },
];

function formId(form) {
  return form?._id || form?.id;
}

function createQuestion() {
  return {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    question: "",
    type: "long_text",
    required: false,
    options: ["", ""],
  };
}

function AdminFeedbackCard({ form, onOpen }) {
  const questions = Array.isArray(form?.questions) ? form.questions.length : 0;
  const status = String(form?.status || "draft").toLowerCase();
  const published = ["published", "active"].includes(status);
  const audience = form?.targetAudience?.type || form?.targetType || "all_students";

  return (
    <button type="button" onClick={() => onOpen?.(form)} className="block w-full text-left">
      <MobileCard padding="sm" className="transition-transform active:scale-[0.99]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cv-primary-soft text-cv-primary">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-bold text-cv-text">{form?.title || "Untitled feedback form"}</h3>
              <MobileBadge tone={published ? "success" : "neutral"}>{published ? "Published" : "Draft"}</MobileBadge>
            </div>
            <p className="mt-1 truncate text-xs text-cv-text-muted">
              {questions} questions · {String(audience).replaceAll("_", " ")}
              {form?.anonymous ? " · Anonymous" : ""}
            </p>
          </div>
          <Eye className="h-4 w-4 shrink-0 text-cv-text-muted" />
        </div>
      </MobileCard>
    </button>
  );
}

function FeedbackDetailPage({ form, onBack }) {
  const [detail, setDetail] = useState(form);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const id = formId(form);
    if (!id) {
      setError("Feedback form not found.");
      setLoading(false);
      return undefined;
    }
    Promise.all([
      fetchFeedbackForm(id),
      fetchFeedbackStatistics(id),
      fetchFeedbackResponses(id),
    ]).then(([formData, stats, responseData]) => {
      if (!mounted) return;
      setDetail(formData || form);
      setStatistics(stats || null);
      setResponses(Array.isArray(responseData) ? responseData : []);
    }).catch((e) => {
      if (!mounted) return;
      setError(e?.response?.data?.error || e?.response?.data?.message || "Unable to load feedback details.");
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [form]);

  const responseCount = Number(statistics?.responseCount ?? responses.length ?? 0);
  const eligibleCount = Number(statistics?.eligibleCount ?? 0);
  const responseRate = statistics?.responseRate;
  const status = String(detail?.status || "draft").toLowerCase();
  const questions = Array.isArray(detail?.questions) ? detail.questions : [];

  if (loading) {
    return <div className="space-y-3"><MobileSkeleton /><MobileSkeleton /><MobileSkeleton /></div>;
  }

  if (error) {
    return <div className="space-y-4"><MobileEmptyState title="Unable to open feedback" message={error} action={<MobileButton onClick={onBack}>Back to feedback</MobileButton>} /></div>;
  }

  return (
    <div className="space-y-3 pb-5">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-xs font-bold text-cv-text-secondary">
        <ChevronDown className="h-4 w-4 rotate-90" /> Back to feedback
      </button>

      <MobileCard padding="sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cv-primary-soft text-cv-primary"><ClipboardList size={18} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h1 className="text-base font-bold text-cv-text">{detail?.title || "Feedback form"}</h1><MobileBadge tone={status === "published" || status === "active" ? "success" : "neutral"}>{status}</MobileBadge></div>
            {detail?.description && <p className="mt-1 text-xs leading-5 text-cv-text-muted">{detail.description}</p>}
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-cv-text-muted"><span>{detail?.category || "General"}</span><span>·</span><span>{questions.length} questions</span>{detail?.anonymous && <><span>·</span><span>Anonymous</span></>}</div>
          </div>
        </div>
      </MobileCard>

      <MobileCard padding="sm" className="!rounded-2xl">
        <div className="flex flex-wrap gap-2">
          {status === "draft" && <MobileButton size="sm" disabled={actionBusy} onClick={async () => { try { setActionBusy(true); const result = await publishFeedbackForm(formId(detail)); setDetail(result?.form || result || detail); toast.success("Feedback published"); } catch (e) { toast.error(e?.response?.data?.error || "Unable to publish feedback"); } finally { setActionBusy(false); } }}>Publish</MobileButton>}
          {(status === "published" || status === "active") && <MobileButton size="sm" variant="secondary" disabled={actionBusy} onClick={async () => { try { setActionBusy(true); const result = await closeFeedbackForm(formId(detail)); setDetail(result?.form || result || detail); toast.success("Feedback closed"); } catch (e) { toast.error(e?.response?.data?.error || "Unable to close feedback"); } finally { setActionBusy(false); } }}>Close form</MobileButton>}
          {status !== "draft" && <MobileButton size="sm" icon={BarChart3} onClick={() => setAnalysisOpen(true)}>Open analysis</MobileButton>}
        </div>
      </MobileCard>

      {analysisOpen && <div className="space-y-3"><MobileButton variant="ghost" size="sm" onClick={() => setAnalysisOpen(false)}>← Back to form</MobileButton><div className="rounded-2xl border border-cv-border bg-cv-surface p-2"><FeedbackAdminResults form={detail} onBack={() => setAnalysisOpen(false)} /></div></div>}

      <div className="grid grid-cols-3 gap-2">
        <MobileCard padding="sm"><p className="text-[10px] font-bold uppercase text-cv-text-muted">Responses</p><p className="mt-1 text-lg font-bold text-cv-text">{responseCount}</p></MobileCard>
        <MobileCard padding="sm"><p className="text-[10px] font-bold uppercase text-cv-text-muted">Eligible</p><p className="mt-1 text-lg font-bold text-cv-text">{eligibleCount || "—"}</p></MobileCard>
        <MobileCard padding="sm"><p className="text-[10px] font-bold uppercase text-cv-text-muted">Rate</p><p className="mt-1 text-lg font-bold text-cv-text">{responseRate == null ? "—" : `${Math.round(Number(responseRate))}%`}</p></MobileCard>
      </div>

      <MobileSection title="Questions" description="Questions included in this feedback cycle.">
        <div className="space-y-2">
          {questions.map((q, index) => (
            <MobileCard key={q?.id || q?._id || index} padding="sm" className="!rounded-2xl">
              <div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cv-surface-soft text-[11px] font-bold text-cv-text-muted">{index + 1}</span><div className="min-w-0"><p className="text-sm font-semibold text-cv-text">{q?.question || "Untitled question"}</p><p className="mt-1 text-[11px] capitalize text-cv-text-muted">{String(q?.type || "question").replaceAll("_", " ")}{q?.required ? " · Required" : ""}</p></div></div>
            </MobileCard>
          ))}
        </div>
      </MobileSection>

      <MobileSection title="Responses" description="Review collected responses from this cycle.">
        {responses.length ? <div className="space-y-2">{responses.slice(0, 5).map((response, index) => <MobileCard key={response?._id || response?.id || index} padding="sm"><p className="text-xs font-bold text-cv-text">Response {index + 1}</p><p className="mt-1 text-[11px] text-cv-text-muted">{detail?.anonymous ? "Anonymous response" : (response?.username || response?.user || "Identified response")}</p></MobileCard>)}</div> : <MobileEmptyState title="No responses yet" message="Responses will appear here once students submit this form." />}
      </MobileSection>
    </div>
  );
}

function QuestionEditor({ question, index, total, onChange, onDelete, onMove }) {
  const typeMeta = QUESTION_TYPES.find((item) => item.value === question.type) || QUESTION_TYPES[0];
  const Icon = typeMeta.icon;

  const set = (field, value) => onChange({ ...question, [field]: value });
  const setOption = (optionIndex, value) => {
    const options = [...(question.options || ["", ""])];
    options[optionIndex] = value;
    set("options", options);
  };
  const addOption = () => set("options", [...(question.options || []), ""]);
  const removeOption = (optionIndex) => {
    const options = [...(question.options || [])];
    if (options.length <= 2) return;
    options.splice(optionIndex, 1);
    set("options", options);
  };

  return (
    <MobileCard padding="sm" className="border-cv-border/80">
      <div className="flex items-center gap-2 border-b border-cv-divider pb-3">
        <GripVertical className="h-4 w-4 text-cv-text-subtle" />
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-cv-text-muted">Question {index + 1}</span>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" disabled={index === 0} onClick={() => onMove("up")} className="rounded-lg p-2 text-cv-text-muted disabled:opacity-30" aria-label="Move question up"><ChevronUp size={15} /></button>
          <button type="button" disabled={index === total - 1} onClick={() => onMove("down")} className="rounded-lg p-2 text-cv-text-muted disabled:opacity-30" aria-label="Move question down"><ChevronDown size={15} /></button>
          <button type="button" disabled={total <= 1} onClick={onDelete} className="rounded-lg p-2 text-cv-danger disabled:opacity-30" aria-label="Delete question"><Trash2 size={15} /></button>
        </div>
      </div>

      <label className="mt-3 block text-[11px] font-bold uppercase tracking-wide text-cv-text-muted">
        Question
        <input
          value={question.question}
          onChange={(e) => set("question", e.target.value)}
          placeholder="e.g. How can the library improve?"
          className="mt-1.5 h-11 w-full rounded-xl border border-cv-border bg-cv-bg px-3 text-sm font-medium text-cv-text outline-none placeholder:text-cv-text-subtle focus:border-cv-primary focus:ring-2 focus:ring-cv-primary/10"
        />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {QUESTION_TYPES.map((type) => {
          const TypeIcon = type.icon;
          const active = question.type === type.value;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => set("type", type.value)}
              className={`flex min-h-10 items-center gap-2 rounded-xl border px-3 text-left text-xs font-semibold transition ${active ? "border-cv-primary bg-cv-primary-soft text-cv-primary" : "border-cv-border bg-cv-surface text-cv-text-secondary"}`}
            >
              <TypeIcon size={14} /> {type.label}
            </button>
          );
        })}
      </div>

      {question.type === "mcq" && (
        <div className="mt-3 rounded-xl bg-cv-surface-soft p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-cv-text">Options</p>
            <button type="button" onClick={addOption} className="text-xs font-bold text-cv-primary">+ Add option</button>
          </div>
          <div className="space-y-2">
            {(question.options || []).map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cv-border bg-cv-surface text-[10px] font-bold text-cv-text-muted">{String.fromCharCode(65 + optionIndex)}</span>
                <input value={option} onChange={(e) => setOption(optionIndex, e.target.value)} placeholder={`Option ${optionIndex + 1}`} className="h-10 min-w-0 flex-1 rounded-xl border border-cv-border bg-cv-surface px-3 text-sm outline-none focus:border-cv-primary" />
                <button type="button" disabled={(question.options || []).length <= 2} onClick={() => removeOption(optionIndex)} className="p-2 text-cv-text-subtle disabled:opacity-30" aria-label="Remove option"><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {question.type === "rating" && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-cv-surface-soft p-3">
          {[1, 2, 3, 4, 5].map((value) => <span key={value} className="flex h-8 w-8 items-center justify-center rounded-full border border-cv-border bg-cv-surface text-xs font-bold text-cv-text-muted">{value}</span>)}
          <span className="ml-1 text-[11px] text-cv-text-muted">1–5 rating</span>
        </div>
      )}

      {question.type === "yes_no" && (
        <div className="mt-3 flex gap-2 rounded-xl bg-cv-surface-soft p-3">
          <span className="rounded-lg border border-cv-border bg-cv-surface px-4 py-2 text-xs font-semibold">Yes</span>
          <span className="rounded-lg border border-cv-border bg-cv-surface px-4 py-2 text-xs font-semibold">No</span>
        </div>
      )}

      <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-cv-text-secondary">
        <input type="checkbox" checked={Boolean(question.required)} onChange={(e) => set("required", e.target.checked)} className="accent-cv-primary" />
        Required question
      </label>
    </MobileCard>
  );
}

function FeedbackBuilderPage({ onBack, onCreated }) {
  // Use the same production feedback builder as desktop so mobile and
  // desktop share one creation experience, validation model and payload.
  return (
    <FeedbackFormBuilder
      onClose={onBack}
      onCreated={async (created) => {
        await onCreated?.(created);
      }}
    />
  );
}

export default function MobileAdminFeedback({ autoCreate = false, onCreateConsumed, onBackToWorkspace, showCreateControls = true }) {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(Boolean(autoCreate));
  const [selectedForm, setSelectedForm] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchFeedbackForms();
      setForms(Array.isArray(data) ? data : data?.forms || []);
    } catch (error) {
      console.error("Failed to load admin feedback forms:", error);
      toast.error(error?.response?.data?.error || "Unable to load feedback forms");
      setForms([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (autoCreate) {
      setCreating(true);
      onCreateConsumed?.();
    }
  }, [autoCreate, onCreateConsumed]);

  if (selectedForm) {
    return <FeedbackDetailPage form={selectedForm} onBack={() => setSelectedForm(null)} />;
  }

  if (creating) {
    return <FeedbackBuilderPage onBack={() => { setCreating(false); onBackToWorkspace?.(); }} onCreated={async () => { await load(); }} />;
  }

  return (
    <div className="space-y-4 pb-5">
      <div className="flex items-end justify-between gap-3">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cv-primary">Workspace</p><h1 className="mt-1 text-xl font-bold tracking-tight text-cv-text">Feedback</h1><p className="mt-1 text-xs text-cv-text-muted">Create forms, publish them and review response cycles.</p></div>
        {showCreateControls && <MobileButton size="sm" icon={Plus} onClick={() => setCreating(true)}>Create</MobileButton>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MobileCard padding="sm"><p className="text-[10px] font-bold uppercase text-cv-text-muted">Forms</p><p className="mt-1 text-lg font-bold text-cv-text">{forms.length}</p></MobileCard>
        <MobileCard padding="sm"><p className="text-[10px] font-bold uppercase text-cv-text-muted">Live</p><p className="mt-1 text-lg font-bold text-cv-text">{forms.filter((f) => ["published", "active"].includes(String(f?.status).toLowerCase())).length}</p></MobileCard>
        <MobileCard padding="sm"><p className="text-[10px] font-bold uppercase text-cv-text-muted">Drafts</p><p className="mt-1 text-lg font-bold text-cv-text">{forms.filter((f) => String(f?.status || "draft").toLowerCase() === "draft").length}</p></MobileCard>
      </div>

      {loading ? <div className="space-y-2"><MobileSkeleton /><MobileSkeleton /><MobileSkeleton /></div> : forms.length ? <div className="space-y-2">{forms.map((form) => <AdminFeedbackCard key={formId(form)} form={form} onOpen={(nextForm) => setSelectedForm(nextForm)} />)}</div> : <MobileEmptyState icon={<ClipboardList className="h-6 w-6" />} title="No feedback forms" message="Create the first feedback form for students." action={showCreateControls ? <MobileButton icon={Plus} onClick={() => setCreating(true)}>Create feedback</MobileButton> : undefined} />}
    </div>
  );
}
