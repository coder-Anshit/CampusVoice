import React, { useMemo, useState } from "react";
import { AlignLeft, BarChart3, Check, ChevronDown, ChevronUp, ClipboardList, GripVertical, Plus, Send, Settings2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { createFeedbackForm, publishFeedbackForm } from "../../../shared/services/feedback.service.js";
import { MobileBadge, MobileButton, MobileCard, MobileSection } from "../../../shared/mobile/primitives/index.js";

const QUESTION_TYPES = [
  { value: "long_text", label: "Long answer", icon: AlignLeft },
  { value: "short_text", label: "Short answer", icon: AlignLeft },
  { value: "mcq", label: "Single choice", icon: Check },
  { value: "multi_select", label: "Checkboxes (select multiple)", icon: Check },
  { value: "rating", label: "Rating", icon: BarChart3 },
  { value: "yes_no", label: "Yes / No", icon: Check },
];

const createQuestion = () => ({
  id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  question: "",
  type: "long_text",
  required: false,
  options: ["", ""],
  maxSelections: null,
});

function QuestionEditor({ question, index, total, onChange, onDelete, onMove }) {
  const meta = QUESTION_TYPES.find((item) => item.value === question.type) || QUESTION_TYPES[0];
  const Icon = meta.icon;
  const set = (field, value) => onChange({ ...question, [field]: value });
  const setOption = (i, value) => {
    const options = [...(question.options || [])];
    options[i] = value;
    set("options", options);
  };
  const addOption = () => set("options", [...(question.options || []), ""]);
  const removeOption = (i) => {
    const options = [...(question.options || [])];
    if (options.length <= 2) return;
    options.splice(i, 1);
    set("options", options);
  };

  return (
    <MobileCard padding="sm" className="!rounded-2xl">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cv-primary-soft text-[11px] font-bold text-cv-primary">{index + 1}</span>
        <div className="min-w-0 flex-1"><p className="text-xs font-bold text-cv-text">Question {index + 1}</p><p className="text-[10px] text-cv-text-muted">{meta.label}</p></div>
        <button type="button" onClick={() => onMove("up")} disabled={index === 0} className="rounded-lg p-1.5 text-cv-text-muted disabled:opacity-25"><ChevronUp size={14}/></button>
        <button type="button" onClick={() => onMove("down")} disabled={index === total - 1} className="rounded-lg p-1.5 text-cv-text-muted disabled:opacity-25"><ChevronDown size={14}/></button>
        <button type="button" onClick={onDelete} disabled={total <= 1} className="rounded-lg p-1.5 text-cv-danger disabled:opacity-25"><Trash2 size={14}/></button>
      </div>
      <div className="mt-3 space-y-3">
        <label className="block text-[11px] font-bold uppercase tracking-wide text-cv-text-muted">Question
          <textarea value={question.question} onChange={(e) => set("question", e.target.value)} rows={2} placeholder="e.g. How would you rate the library experience?" className="mt-1.5 w-full resize-none rounded-xl border border-cv-border bg-cv-bg px-3 py-2.5 text-sm text-cv-text outline-none focus:border-cv-primary" />
        </label>
        <label className="block text-[11px] font-bold uppercase tracking-wide text-cv-text-muted">Answer type
          <select value={question.type} onChange={(e) => set("type", e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-cv-border bg-cv-bg px-3 text-sm text-cv-text outline-none">
            {QUESTION_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        {(question.type === "mcq" || question.type === "multi_select") && <div className="space-y-2">
          {(question.options || []).map((option, optionIndex) => <div key={optionIndex} className="flex items-center gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cv-border text-[10px] font-bold text-cv-text-muted">{String.fromCharCode(65 + optionIndex)}</span><input value={option} onChange={(e) => setOption(optionIndex, e.target.value)} placeholder={`Option ${optionIndex + 1}`} className="h-10 min-w-0 flex-1 rounded-xl border border-cv-border bg-cv-bg px-3 text-sm text-cv-text outline-none focus:border-cv-primary"/><button type="button" onClick={() => removeOption(optionIndex)} disabled={(question.options || []).length <= 2} className="p-2 text-cv-text-subtle disabled:opacity-25"><X size={14}/></button></div>)}
          <button type="button" onClick={addOption} className="flex h-9 items-center gap-1 rounded-lg bg-cv-primary-soft px-3 text-xs font-bold text-cv-primary"><Plus size={14}/> Add option</button>
          {question.type === "multi_select" && <label className="block text-[11px] font-bold uppercase tracking-wide text-cv-text-muted">Maximum selections (optional)<input type="number" min="1" max={(question.options || []).filter((x) => String(x).trim()).length || 1} value={question.maxSelections ?? ""} onChange={(e) => set("maxSelections", e.target.value === "" ? null : Math.max(1, Number(e.target.value)))} placeholder="No limit" className="mt-1.5 h-10 w-full rounded-xl border border-cv-border bg-cv-bg px-3 text-sm text-cv-text outline-none focus:border-cv-primary"/></label>}
        </div>}
        <label className="flex items-center gap-2 text-xs font-semibold text-cv-text"><input type="checkbox" checked={Boolean(question.required)} onChange={(e) => set("required", e.target.checked)} className="accent-cv-primary"/> Required question</label>
      </div>
    </MobileCard>
  );
}

export default function FeedbackFormBuilder({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [anonymous, setAnonymous] = useState(true);
  const [targetType, setTargetType] = useState("all_students");
  const [targetValue, setTargetValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [questions, setQuestions] = useState([createQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const progress = useMemo(() => {
    const titleDone = Boolean(title.trim());
    const descDone = Boolean(description.trim());
    const questionDone = questions.filter((q) => q.question.trim() && (!["mcq", "multi_select"].includes(q.type) || (q.options || []).filter((x) => String(x).trim()).length >= 2)).length;
    return Math.round(((Number(titleDone) + Number(descDone) + questionDone) / Math.max(questions.length + 2, 1)) * 100);
  }, [title, description, questions]);

  const updateQuestion = (index, next) => setQuestions((current) => current.map((q, i) => i === index ? next : q));
  const deleteQuestion = (index) => setQuestions((current) => current.length <= 1 ? current : current.filter((_, i) => i !== index));
  const moveQuestion = (index, direction) => setQuestions((current) => { const target = direction === "up" ? index - 1 : index + 1; if (target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; });

  const buildPayload = () => ({
    title: title.trim(), description: description.trim(), category: category.trim() || "General",
    targetAudience: { type: targetType, value: targetValue.trim() }, anonymous,
    startDate: startDate ? new Date(startDate).toISOString() : null,
    endDate: endDate ? new Date(endDate).toISOString() : null,
    questions: questions.map((q) => ({ id: q.id, question: q.question.trim(), type: q.type, required: Boolean(q.required), options: ["mcq", "multi_select"].includes(q.type) ? (q.options || []).map((x) => String(x).trim()).filter(Boolean) : [], maxSelections: q.type === "multi_select" && q.maxSelections ? Number(q.maxSelections) : null })),
  });

  const save = async (publish) => {
    if (!title.trim()) return setError("Add a feedback form title.");
    if (!description.trim()) return setError("Add a short description for students.");
    for (let i = 0; i < questions.length; i += 1) {
      if (!questions[i].question.trim()) return setError(`Question ${i + 1} cannot be empty.`);
      if (["mcq", "multi_select"].includes(questions[i].type) && (questions[i].options || []).filter((x) => String(x).trim()).length < 2) return setError(`Question ${i + 1} needs at least 2 options.`);
      if (questions[i].type === "multi_select" && questions[i].maxSelections && questions[i].maxSelections > (questions[i].options || []).filter((x) => String(x).trim()).length) return setError(`Question ${i + 1} maximum selections cannot exceed its number of options.`);
    }
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) return setError("End date must be after start date.");
    if (targetType !== "all_students" && !targetValue.trim()) return setError("Specify the target audience.");
    try {
      setSaving(true); setError("");
      const created = await createFeedbackForm(buildPayload());
      let result = created;
      if (publish && created?.form?._id) result = await publishFeedbackForm(created.form._id);
      toast.success(publish ? "Feedback published" : "Feedback saved as draft");
      onCreated?.(result?.form || created?.form || result);
      onClose?.();
    } catch (e) { setError(e?.response?.data?.error || e?.response?.data?.message || e?.message || "Unable to create feedback form."); }
    finally { setSaving(false); }
  };

  return (
    <div className="w-full space-y-4 pb-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cv-primary-soft text-cv-primary"><ClipboardList size={18}/></div>
        <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cv-primary">Feedback workspace</p><h1 className="mt-0.5 text-xl font-bold tracking-tight text-cv-text">Create feedback</h1><p className="mt-0.5 text-xs text-cv-text-muted">Build a clean student feedback cycle.</p></div>
        <button type="button" onClick={onClose} className="rounded-xl border border-cv-border p-2 text-cv-text-muted hover:bg-cv-surface-soft"><X size={18}/></button>
      </div>

      <MobileCard padding="sm" className="!rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between"><div><p className="text-xs font-bold text-cv-text">Setup progress</p><p className="text-[11px] text-cv-text-muted">{progress}% ready</p></div><span className="text-xs font-bold text-cv-primary">{progress}%</span></div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-cv-surface-soft"><div className="h-full rounded-full bg-cv-primary transition-all" style={{width:`${progress}%`}}/></div>
      </MobileCard>

      {error && <div className="rounded-xl border border-cv-danger-border bg-cv-danger-soft px-3 py-2.5 text-xs font-semibold text-cv-danger">{error}</div>}

      <MobileCard padding="sm">
        <div className="mb-3 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cv-primary-soft text-cv-primary"><ClipboardList size={15}/></div><div><h2 className="text-sm font-bold text-cv-text">Form details</h2><p className="text-[11px] text-cv-text-muted">Give students enough context before they respond.</p></div></div>
        <div className="space-y-3">
          <label className="block text-[11px] font-bold uppercase tracking-wide text-cv-text-muted">Title<input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="e.g. Library services feedback" className="mt-1.5 h-11 w-full rounded-xl border border-cv-border bg-cv-bg px-3 text-sm text-cv-text outline-none focus:border-cv-primary"/></label>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-cv-text-muted">Description<textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Tell students what this feedback is about." rows={3} className="mt-1.5 w-full resize-none rounded-xl border border-cv-border bg-cv-bg px-3 py-2.5 text-sm text-cv-text outline-none focus:border-cv-primary"/></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-cv-text-muted">Category<select value={category} onChange={(e)=>setCategory(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-cv-border bg-cv-bg px-3 text-sm text-cv-text outline-none"><option>General</option><option>Academics</option><option>Hostel</option><option>Library</option><option>Campus</option><option>Faculty</option></select></label>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-cv-text-muted">Audience<select value={targetType} onChange={(e)=>setTargetType(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-cv-border bg-cv-bg px-3 text-sm text-cv-text outline-none"><option value="all_students">All students</option><option value="department">Department</option><option value="year">Year</option><option value="section">Section</option></select></label>
          </div>
          {targetType !== "all_students" && <label className="block text-[11px] font-bold uppercase tracking-wide text-cv-text-muted">Audience value<input value={targetValue} onChange={(e)=>setTargetValue(e.target.value)} placeholder="e.g. CSE / 4th year" className="mt-1.5 h-11 w-full rounded-xl border border-cv-border bg-cv-bg px-3 text-sm text-cv-text outline-none focus:border-cv-primary"/></label>}
        </div>
      </MobileCard>

      <MobileCard padding="sm">
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Settings2 size={16} className="text-cv-primary"/><div><h2 className="text-sm font-bold text-cv-text">Response settings</h2><p className="text-[11px] text-cv-text-muted">Control privacy and collection window.</p></div></div><label className="flex items-center gap-2 text-xs font-semibold text-cv-text"><input type="checkbox" checked={anonymous} onChange={(e)=>setAnonymous(e.target.checked)} className="accent-cv-primary"/> Anonymous</label></div>
        <div className="mt-3 grid grid-cols-2 gap-2"><label className="text-[11px] font-bold uppercase tracking-wide text-cv-text-muted">Starts<input type="datetime-local" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-cv-border bg-cv-bg px-2 text-xs text-cv-text outline-none"/></label><label className="text-[11px] font-bold uppercase tracking-wide text-cv-text-muted">Ends<input type="datetime-local" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-cv-border bg-cv-bg px-2 text-xs text-cv-text outline-none"/></label></div>
      </MobileCard>

      <MobileSection title="Questions" description="Keep each question focused and easy to answer." action={<span className="text-xs font-bold text-cv-text-muted">{questions.length} total</span>}>
        <div className="space-y-2.5">{questions.map((question,index)=><QuestionEditor key={question.id} question={question} index={index} total={questions.length} onChange={(next)=>updateQuestion(index,next)} onDelete={()=>deleteQuestion(index)} onMove={(direction)=>moveQuestion(index,direction)}/>)}<button type="button" onClick={()=>setQuestions((current)=>[...current,createQuestion()])} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-cv-primary-border bg-cv-primary-soft/40 text-xs font-bold text-cv-primary"><Plus size={15}/> Add question</button></div>
      </MobileSection>

      <div className="sticky bottom-2 z-10 rounded-2xl border border-cv-border bg-cv-surface/95 p-2 shadow-cv-lg backdrop-blur-xl"><div className="grid grid-cols-2 gap-2"><MobileButton variant="secondary" disabled={saving} onClick={()=>save(false)}>{saving?"Saving…":"Save draft"}</MobileButton><MobileButton disabled={saving} icon={Send} onClick={()=>save(true)}>{saving?"Publishing…":"Publish"}</MobileButton></div></div>
    </div>
  );
}
