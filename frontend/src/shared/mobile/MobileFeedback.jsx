import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, ClipboardList, Clock3, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import FeedbackFormView from "../../features/feedback/components/FeedbackFormView.jsx";
import FeedbackResults from "../../features/feedback/components/FeedbackResults.jsx";
import {
  fetchStudentFeedbackForms,
  fetchActiveFeedbackForm,
  fetchMyFeedbackResponse,
} from "../services/feedback.service.js";
import { MobileBadge, MobileCard, MobileEmptyState, MobileSection, MobileSkeleton } from "./primitives/index.js";

function dateValue(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(value) {
  const d = dateValue(value);
  return d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
}

function isActive(form) {
  const status = String(form?.status || "").toLowerCase();
  if (["published", "active"].includes(status)) return true;
  const end = dateValue(form?.endDate);
  return !["closed", "completed", "action_taken"].includes(status) && (!end || end.getTime() >= Date.now());
}

function isPast(form) {
  return ["closed", "completed", "action_taken"].includes(String(form?.status || "").toLowerCase());
}

function estimateMinutes(form) {
  const seconds = (form?.questions || []).reduce((total, q) => {
    const type = String(q?.type || "long_text").toLowerCase();
    return total + ({ rating: 8, yes_no: 6, mcq: 10, short_text: 30, long_text: 75 }[type] || 45);
  }, 0);
  return Math.max(1, Math.ceil(seconds / 60));
}

function FeedbackCard({ form, submitted, actionLabel, onOpen }) {
  const active = isActive(form);
  return (
    <button type="button" onClick={() => onOpen(form)} className="block w-full text-left">
      <MobileCard padding="sm" className="transition-all active:scale-[0.99] hover:border-cv-primary-border">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cv-primary-border bg-cv-primary-soft text-cv-primary">
            <ClipboardList className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <MobileBadge tone={active ? "info" : "neutral"}>{active ? "Open" : "Past"}</MobileBadge>
              {form?.anonymous && <MobileBadge tone="success"><ShieldCheck className="mr-1 h-3 w-3" />Anonymous</MobileBadge>}
              {submitted && <MobileBadge tone="success">Submitted</MobileBadge>}
            </div>
            <h3 className="mt-1.5 line-clamp-2 text-[13px] font-bold leading-snug text-cv-text">{form?.title || "Feedback form"}</h3>
            {form?.description && <p className="mt-1 line-clamp-1 text-[11px] leading-4 text-cv-text-secondary">{form.description}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-cv-text-subtle">
              <span>{form?.questions?.length || 0} questions</span>
              <span><Clock3 className="mr-1 inline h-3 w-3" />About {estimateMinutes(form)} min</span>
              {form?.endDate && <span>Ends {formatDate(form.endDate)}</span>}
            </div>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-cv-text-muted"><ChevronRight className="h-4 w-4" /></span>
        </div>
        {actionLabel && <div className="mt-2.5 flex items-center justify-between border-t border-cv-divider pt-2.5 text-[10px] font-bold text-cv-primary"><span>{actionLabel}</span><span>→</span></div>}
      </MobileCard>
    </button>
  );
}

function ResponseDetail({ item, onBack }) {
  const form = item?.form || {};
  const response = item?.response || {};
  const answers = Array.isArray(response?.answers) ? response.answers : [];
  const questionMap = new Map((form?.questions || []).map((q) => [String(q.id ?? q._id ?? q.questionId), q]));

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="inline-flex min-h-9 items-center gap-2 text-xs font-bold text-cv-text-secondary"><ArrowLeft className="h-4 w-4" /> Back to My Responses</button>
      <MobileCard padding="md">
        <div className="flex flex-wrap items-center gap-1.5">
          <MobileBadge tone="success"><CheckCircle2 className="mr-1 h-3 w-3" />Response submitted</MobileBadge>
          {form?.anonymous && <MobileBadge tone="neutral">Anonymous</MobileBadge>}
        </div>
        <h2 className="mt-2.5 text-lg font-bold tracking-tight text-cv-text">{form?.title || "Feedback"}</h2>
        <p className="mt-1 text-[10px] text-cv-text-muted">Submitted {formatDate(response?.createdAt || response?.submittedAt)}</p>
      </MobileCard>
      {answers.length ? answers.map((answer, index) => {
        const question = questionMap.get(String(answer?.questionId ?? answer?.question_id ?? ""));
        const value = Array.isArray(answer?.answer) ? answer.answer.join(", ") : answer?.answer;
        return (
          <MobileCard key={answer?.questionId || index} padding="sm">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-cv-text-subtle">Question {index + 1}</p>
            <p className="mt-1.5 text-[13px] font-semibold leading-5 text-cv-text">{question?.question || question?.text || "Question"}</p>
            <div className="mt-2.5 rounded-xl border border-cv-border bg-cv-surface-soft px-3 py-2.5"><p className="whitespace-pre-wrap text-xs leading-5 text-cv-text-secondary">{String(value ?? "—")}</p></div>
          </MobileCard>
        );
      }) : <MobileEmptyState icon="✓" title="No answers available" description="There are no answer details available for this response." />}
    </div>
  );
}

export default function MobileFeedback() {
  const [forms, setForms] = useState([]);
  const [responses, setResponses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedResults, setSelectedResults] = useState(null);
  const [view, setView] = useState("active");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchStudentFeedbackForms();
      const next = Array.isArray(data) ? data : data?.forms || [];
      setForms(next);
      const checks = await Promise.all(next.map(async (form) => {
        const id = form?._id || form?.id;
        if (!id) return null;
        try {
          const result = await fetchMyFeedbackResponse(id);
          if (result?.submitted && result?.response) return { form, response: result.response };
          if (result?._id || result?.answers) return { form, response: result };
        } catch { /* response may not exist yet */ }
        return null;
      }));
      setResponses(checks.filter(Boolean));
    } catch (error) {
      console.error("Failed to load mobile feedback forms:", error);
      toast.error(error?.response?.data?.error || "Unable to load feedback forms");
      setForms([]);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const responseIds = useMemo(() => new Set(responses.map((item) => String(item?.form?._id || item?.form?.id))), [responses]);
  const activeForms = useMemo(() => forms.filter(isActive), [forms]);
  const pastForms = useMemo(() => forms.filter(isPast), [forms]);
  const allForms = useMemo(() => forms, [forms]);

  async function openForm(form) {
    const id = form?._id || form?.id;
    if (!id) return;
    try {
      const full = await fetchActiveFeedbackForm(id);
      setSelected(full?.form || full || form);
      setView("form");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Unable to open feedback form");
    }
  }

  function openResponse(item) {
    setSelected(item?.form || null);
    setSelectedResults(null);
    setView("response");
    setSelected(item);
  }

  function openResults(form) {
    setSelected(form);
    setSelectedResults(form);
    setView("results");
  }

  if (view === "form" && selected && selected.questions) {
    return <FeedbackFormView form={selected} onBack={() => { setSelected(null); setView("active"); }} onSubmitted={async () => { setSelected(null); setView("active"); await load(); }} />;
  }

  if (view === "response" && selected?.response) {
    return <ResponseDetail item={selected} onBack={() => { setSelected(null); setView("responses"); }} />;
  }

  if (view === "results" && selectedResults) {
    return <FeedbackResults form={selectedResults} onBack={() => { setSelectedResults(null); setSelected(null); setView("results-list"); }} />;
  }

  const renderForms = (items, emptyTitle, emptyDescription, actionLabel, handler) => items.length ? (
    <div className="space-y-2.5">{items.map((form) => <FeedbackCard key={form._id || form.id} form={form} submitted={responseIds.has(String(form._id || form.id))} actionLabel={actionLabel} onOpen={handler} />)}</div>
  ) : <MobileEmptyState icon={<ClipboardList className="h-6 w-6" />} title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="space-y-4">
      <MobileSection title="Student feedback" subtitle="Share your experience and help improve campus life." />
      <div className="grid grid-cols-3 gap-1 rounded-2xl border border-cv-border bg-cv-surface-soft p-1">
        {[['active','Active'],['responses','My responses'],['results-list','Results']].map(([value,label]) => <button key={value} type="button" onClick={() => setView(value)} className={`min-h-10 rounded-xl px-2 text-[10px] font-bold ${view === value || (value === 'results-list' && view === 'results') ? 'bg-cv-surface text-cv-text shadow-cv-sm' : 'text-cv-text-muted'}`}>{label}</button>)}
      </div>

      {loading ? <div className="space-y-2.5"><MobileSkeleton /><MobileSkeleton /><MobileSkeleton /></div> : (
        <>
          {view === "active" && <section><div className="mb-2.5"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cv-primary">Your input matters</p><h2 className="mt-1 text-base font-bold text-cv-text">Active feedback</h2><p className="mt-0.5 text-[11px] text-cv-text-muted">Forms currently accepting your response.</p></div>{activeForms.length ? <div className="space-y-2.5">{activeForms.map((form) => { const submitted = responseIds.has(String(form._id || form.id)); const item = responses.find((entry) => String(entry?.form?._id || entry?.form?.id) === String(form._id || form.id)); return <FeedbackCard key={form._id || form.id} form={form} submitted={submitted} actionLabel={submitted ? "View response" : "Give feedback"} onOpen={() => submitted && item ? openResponse(item) : openForm(form)} />; })}</div> : <MobileEmptyState icon={<ClipboardList className="h-6 w-6" />} title="No active feedback" description="There are no active feedback forms for you right now." />}</section>}
          {view === "responses" && <section><div className="mb-2.5"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cv-primary">Your activity</p><h2 className="mt-1 text-base font-bold text-cv-text">My responses</h2><p className="mt-0.5 text-[11px] text-cv-text-muted">Your submitted feedback and answers.</p></div>{responses.length ? <div className="space-y-2.5">{responses.map((item) => <FeedbackCard key={item.response?._id || item.form?._id} form={item.form} submitted actionLabel="View response" onOpen={() => openResponse(item)} />)}</div> : <MobileEmptyState icon="✓" title="No responses yet" description="Submit an active feedback form and your response will appear here." />}</section>}
          {view === "results-list" && <section><div className="mb-2.5"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-cv-primary">Completed cycles</p><h2 className="mt-1 text-base font-bold text-cv-text">Past feedback & results</h2><p className="mt-0.5 text-[11px] text-cv-text-muted">See published findings from completed feedback cycles.</p></div>{renderForms(pastForms, "Nothing here yet", "No completed feedback cycles are available yet.", "View results", openResults)}</section>}
          {view === "all" && renderForms(allForms, "No feedback forms", "There are no feedback forms available right now.", null, openForm)}
        </>
      )}
    </div>
  );
}
