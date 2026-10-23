import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, Check, Clock3, Vote } from "lucide-react";
import { createPoll, votePoll } from "../services/polls.service.js";
import { MobileBadge, MobileButton, MobileCard, MobileEmptyState, MobileSection, MobileSkeleton } from "./primitives/index.js";

function totalVotes(poll) {
  return (poll?.options || []).reduce((sum, option) => sum + Number(option?.votes || 0), 0);
}

function dateLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function hasVoted(poll, voterId) {
  return Array.isArray(poll?.voters) && poll.voters.includes(voterId);
}

export default function MobilePolls({ polls = [], voterId, loading = false, onRefresh, canCreate = false, initialCreateOpen = false, onCreateConsumed, showCreateTrigger = true }) {
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [filter, setFilter] = useState("active");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [createOpen, setCreateOpen] = useState(Boolean(initialCreateOpen));

  useEffect(() => { if (initialCreateOpen) setCreateOpen(true); }, [initialCreateOpen]);
  const [createQuestion, setCreateQuestion] = useState("");
  const [createOptions, setCreateOptions] = useState(["", ""]);
  const [creating, setCreating] = useState(false);
  const [anonymous, setAnonymous] = useState(true);

  const filtered = useMemo(() => {
    return polls.filter((poll) => {
      const voted = hasVoted(poll, voterId);
      if (filter === "voted") return voted;
      if (filter === "unvoted") return !voted;
      return true;
    });
  }, [polls, filter, voterId]);

  const openPoll = (poll) => {
    setSelectedPoll(poll);
    setSelectedOption(null);
    setMessage("");
  };

  const closePoll = () => {
    setSelectedPoll(null);
    setSelectedOption(null);
    setMessage("");
  };

  const submitVote = async () => {
    if (!selectedPoll || selectedOption === null || submitting) return;
    try {
      setSubmitting(true);
      await votePoll(selectedPoll._id || selectedPoll.id, selectedOption, voterId);
      setMessage("Your vote has been recorded.");
      await onRefresh?.();
    } catch (error) {
      setMessage(error?.response?.data?.error || "Unable to cast your vote. You may have already voted.");
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedPoll) {
    const voted = hasVoted(selectedPoll, voterId);
    const total = totalVotes(selectedPoll);
    return (
      <div className="space-y-5">
        <button type="button" onClick={closePoll} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-cv-text-secondary">
          <ArrowLeft className="h-4 w-4" /> Back to polls
        </button>

        <MobileCard padding="md">
          <div className="flex items-center gap-2">
            <MobileBadge tone="primary">Campus poll</MobileBadge>
            <span className="text-[10px] text-cv-text-muted">{total} vote{total === 1 ? "" : "s"}</span>
          </div>
          <h2 className="mt-3 text-lg font-extrabold leading-snug text-cv-text">{selectedPoll.question || selectedPoll.title || "Campus poll"}</h2>
          {(selectedPoll.endDate || selectedPoll.endsAt) && (
            <p className="mt-2 flex items-center gap-1 text-xs text-cv-text-muted"><Clock3 className="h-3.5 w-3.5" /> Ends {dateLabel(selectedPoll.endDate || selectedPoll.endsAt)}</p>
          )}
        </MobileCard>

        <MobileSection title={voted ? "Results" : "Choose one option"} subtitle={voted ? "Current response distribution" : "Your vote cannot be changed here."}>
          <div className="space-y-2">
            {(selectedPoll.options || []).map((option, index) => {
              const percent = total ? Math.round((Number(option?.votes || 0) / total) * 100) : 0;
              const selected = selectedOption === index;
              return (
                <button
                  key={`${selectedPoll._id || selectedPoll.id}-${index}`}
                  type="button"
                  disabled={voted}
                  onClick={() => setSelectedOption(index)}
                  className={`relative w-full overflow-hidden rounded-cv-md border p-3 text-left transition ${selected ? "border-cv-primary bg-cv-primary-soft" : "border-cv-border bg-cv-surface"} ${voted ? "cursor-default" : "cv-touch-target"}`}
                >
                  {voted && <span className="absolute inset-y-0 left-0 bg-cv-primary-soft" style={{ width: `${percent}%` }} aria-hidden="true" />}
                  <span className="relative flex items-center gap-3">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${selected ? "border-cv-primary bg-cv-primary text-cv-text-inverse" : "border-cv-border-strong"}`}>
                      {selected && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-semibold text-cv-text">{option?.text || `Option ${index + 1}`}</span>
                    {voted && <span className="text-xs font-bold text-cv-primary">{percent}%</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </MobileSection>

        {message && <div className="rounded-cv-md border border-cv-border bg-cv-surface-soft p-3 text-sm font-semibold text-cv-text">{message}</div>}

        {!voted && !message && (
          <MobileButton fullWidth onClick={submitVote} disabled={selectedOption === null || submitting}>
            {submitting ? "Submitting…" : "Confirm vote"}
          </MobileButton>
        )}

        {(voted || message === "Your vote has been recorded.") && (
          <MobileCard padding="sm" className="border-cv-success/20 bg-cv-success-soft">
            <div className="flex items-center gap-2 text-sm font-bold text-cv-success"><Check className="h-4 w-4" /> Vote recorded</div>
            <p className="mt-1 text-xs text-cv-text-secondary">Thank you for participating in this campus poll.</p>
          </MobileCard>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <MobileSection title="Polls" subtitle="Participate in decisions and campus feedback">
        {canCreate && showCreateTrigger && (
          <button type="button" onClick={() => setCreateOpen((v) => !v)} className="mb-3 flex w-full items-center justify-between rounded-2xl border border-cv-primary-border bg-cv-primary-soft px-3.5 py-3 text-left">
            <span><span className="block text-xs font-extrabold text-cv-primary">Create a poll</span><span className="mt-0.5 block text-[10px] text-cv-text-secondary">Ask your classmates a quick question.</span></span><span className="text-lg font-bold text-cv-primary">{createOpen ? "×" : "+"}</span>
          </button>
        )}
        {canCreate && createOpen && (
          <div className="mb-3 rounded-2xl border border-cv-border bg-cv-surface p-3 shadow-cv-xs">
            <input value={createQuestion} onChange={(e) => setCreateQuestion(e.target.value)} placeholder="What do you want to ask?" className="h-11 w-full rounded-xl border border-cv-border bg-cv-bg px-3 text-sm text-cv-text outline-none"/>
            <div className="mt-2 space-y-2">{createOptions.map((option,index)=><div key={index} className="flex gap-2"><span className="flex h-10 w-8 items-center justify-center rounded-lg bg-cv-surface-soft text-xs font-bold text-cv-text-muted">{String.fromCharCode(65+index)}</span><input value={option} onChange={(e)=>setCreateOptions((items)=>items.map((v,i)=>i===index?e.target.value:v))} placeholder={`Option ${index+1}`} className="h-10 min-w-0 flex-1 rounded-xl border border-cv-border bg-cv-bg px-3 text-sm text-cv-text outline-none"/>{createOptions.length>2&&<button type="button" onClick={()=>setCreateOptions((items)=>items.filter((_,i)=>i!==index))} className="px-2 text-cv-text-muted">×</button>}</div>)}</div>
            <div className="mt-2 rounded-xl border border-cv-border bg-cv-surface-soft px-3 py-2"><p className="text-[10px] font-bold uppercase tracking-wide text-cv-text-muted">Posting as</p><p className="mt-1 text-xs font-semibold text-cv-text-secondary">{anonymous ? "Anonymous" : (localStorage.getItem("username") || "Authenticated User")}</p></div>
            <label className="mt-2 flex items-center gap-2 text-xs font-medium text-cv-text-secondary"><input type="checkbox" checked={anonymous} onChange={() => setAnonymous((v)=>!v)} className="accent-[rgb(var(--cv-primary))]"/> Post anonymously</label>
            <div className="mt-2 flex items-center justify-between gap-2"><button type="button" onClick={()=>setCreateOptions((items)=>[...items,""])} className="text-xs font-bold text-cv-primary">+ Add option</button><MobileButton size="sm" disabled={creating} onClick={async()=>{const valid=createOptions.map(x=>x.trim()).filter(Boolean);if(!createQuestion.trim()||valid.length<2){setMessage("Add a question and at least 2 options.");return;}try{setCreating(true);await createPoll({question:createQuestion.trim(),options:valid,author:localStorage.getItem("username")||"Anonymous",anonymous});setCreateQuestion("");setCreateOptions(["",""]);setAnonymous(true);setCreateOpen(false);setMessage("Poll created successfully.");await onRefresh?.();onCreateConsumed?.();}catch(e){setMessage(e?.response?.data?.error||"Unable to create poll.");}finally{setCreating(false);}}}>{creating?"Creating…":"Create poll"}</MobileButton></div>
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {[['active', 'All'], ['unvoted', 'Not voted'], ['voted', 'Voted']].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-bold ${filter === value ? "bg-cv-primary text-cv-text-inverse" : "bg-cv-surface-soft text-cv-text-secondary"}`}>{label}</button>
          ))}
        </div>
      </MobileSection>

      {loading ? (
        <div className="space-y-3"><MobileSkeleton variant="card" className="h-40" /><MobileSkeleton variant="card" className="h-40" /></div>
      ) : filtered.length ? (
        <div className="space-y-3">
          {filtered.map((poll) => {
            const voted = hasVoted(poll, voterId);
            const total = totalVotes(poll);
            return (
              <MobileCard key={poll._id || poll.id} interactive as="button" type="button" onClick={() => openPoll(poll)} className="w-full text-left" padding="md">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-cv-md bg-cv-primary-soft text-cv-primary"><Vote className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><MobileBadge tone={voted ? "success" : "primary"}>{voted ? "Voted" : "Open"}</MobileBadge><span className="text-[10px] text-cv-text-muted">{total} vote{total === 1 ? "" : "s"}</span></div>
                    <h3 className="mt-2 line-clamp-2 text-sm font-bold text-cv-text">{poll.question || poll.title || "Campus poll"}</h3>
                    <p className="mt-2 text-xs text-cv-text-secondary">{poll.options?.length || 0} options · Tap to participate</p>
                  </div>
                  <BarChart3 className="mt-1 h-4 w-4 shrink-0 text-cv-text-muted" />
                </div>
              </MobileCard>
            );
          })}
        </div>
      ) : (
        <MobileEmptyState icon="✓" title="No polls found" description="There are no polls matching this filter right now." />
      )}
    </div>
  );
}
