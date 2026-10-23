import { useState } from "react";
import client from "../../../shared/services/client.js";

export default function PollCard({ poll, voterId, refresh }) {
  const [selected, setSelected] = useState(null);
  const hasVoted = poll.voters?.includes(voterId);
  const totalVotes = poll.options.reduce((sum,o)=>sum+o.votes,0);
  const vote = async()=>{ if(selected===null)return; try{await client.post(`/polls/${poll._id}/vote`,{voterId,option:selected});refresh();}catch{alert("Already voted");} };
  return <div className="overflow-hidden rounded-cv-md border border-cv-border bg-cv-surface shadow-cv-sm transition-all duration-200 hover:border-cv-border-strong hover:shadow-cv-md">
    <div className="h-0.5 w-full bg-cv-primary"/>
    <div className="p-4 sm:p-[18px]">
      <div className="mb-2.5 flex items-center gap-1.5"><span className="inline-flex items-center gap-1 rounded-full border border-cv-primary/15 bg-cv-primary-soft px-2 py-0.5 text-[10px] font-semibold text-cv-primary">📊 Poll</span><span className="text-[10px] text-cv-text-muted">{totalVotes} vote{totalVotes!==1?"s":""}</span></div>
      <h3 className="mb-3 text-[14px] font-semibold leading-snug text-cv-text">{poll.question}</h3>
      <div className="mb-3 space-y-2">{poll.options.map((opt,i)=>{const percent=totalVotes?Math.round(opt.votes/totalVotes*100):0;const isSelected=selected===i;return <div key={i} className="relative">{!hasVoted?<label className={`group flex cursor-pointer items-center gap-2.5 rounded-cv-sm border p-2.5 transition-all duration-150 ${isSelected?"border-cv-primary/50 bg-cv-primary-soft":"border-cv-border hover:border-cv-border-strong hover:bg-cv-surface-soft"}`}><div className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isSelected?"border-cv-primary bg-cv-primary":"border-cv-border-strong"}`}>{isSelected&&<div className="h-1.5 w-1.5 rounded-full bg-cv-surface"/>}</div><input type="radio" name={`poll-${poll._id}`} onChange={()=>setSelected(i)} className="sr-only"/><span className="flex-1 text-[11px] font-medium text-cv-text-secondary">{opt.text}</span></label>:<div className="relative overflow-hidden rounded-cv-sm border border-cv-border p-2.5"><div className="absolute inset-0 rounded-cv-sm bg-cv-primary/5" style={{width:`${percent}%`}}/><div className="relative flex items-center justify-between gap-3"><span className="text-[11px] font-medium text-cv-text-secondary">{opt.text}</span><span className="shrink-0 text-[11px] font-bold text-cv-primary">{percent}%</span></div><div className="relative mt-1.5 h-1 overflow-hidden rounded-full bg-cv-surface-muted"><div className="h-full rounded-full bg-cv-primary transition-all duration-700" style={{width:`${percent}%`}}/></div></div>}</div>})}</div>
      {!hasVoted?<button onClick={vote} disabled={selected===null} className="w-full rounded-cv-sm bg-cv-primary py-2.5 text-[11px] font-semibold text-cv-text-inverse shadow-cv-xs transition-all duration-200 hover:bg-cv-primary-hover hover:shadow-cv-sm disabled:cursor-not-allowed disabled:opacity-40">Cast Vote</button>:<div className="flex items-center gap-2 text-[11px] font-medium text-cv-success"><span className="text-sm">✓</span>You&apos;ve voted · {totalVotes} total vote{totalVotes!==1?"s":""}</div>}
    </div>
  </div>;
}
