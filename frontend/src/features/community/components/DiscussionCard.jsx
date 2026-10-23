import { useState, useEffect } from "react";
import { ChevronUp, MessageCircle } from "lucide-react";
import { voteDiscussion, commentOnDiscussion } from "../../../shared/services/discussions.service.js";

function timeAgo(ts){const diff=Math.floor((Date.now()-new Date(ts).getTime())/1000);if(diff<60)return "just now";if(diff<3600)return `${Math.floor(diff/60)}m ago`;if(diff<86400)return `${Math.floor(diff/3600)}h ago`;return `${Math.floor(diff/86400)}d ago`;}

export default function DiscussionCard({discussion,user,voterId,refresh}){
  const [localDiscussion,setLocalDiscussion]=useState(discussion);const [text,setText]=useState("");const [expanded,setExpanded]=useState(false);const [replying,setReplying]=useState(false);
  useEffect(()=>{setLocalDiscussion(discussion)},[discussion]);
  const id=localDiscussion._id??localDiscussion.id;const currentVoter=voterId||localStorage.getItem("username");const hasVoted=localDiscussion.voters?.includes(currentVoter);const comments=localDiscussion.comments??[];
  const handleVote=async()=>{const updated=await voteDiscussion(id,currentVoter);setLocalDiscussion(updated)};
  const handleComment=async()=>{if(!text.trim()||replying)return;setReplying(true);try{const updated=await commentOnDiscussion(id,text,user||"Anonymous");setLocalDiscussion(updated);setText("");setExpanded(true);refresh?.();}finally{setReplying(false)}};
  return <div className="overflow-hidden rounded-cv-xl border border-cv-border bg-cv-surface shadow-cv-xs transition-all duration-200 hover:border-cv-border-strong hover:shadow-cv-sm">
    <div className="flex items-start gap-4 p-5">
      <button onClick={handleVote} className={`flex h-16 w-12 shrink-0 flex-col items-center justify-center self-start rounded-cv-sm border transition-all duration-200 ${hasVoted?"border-cv-primary bg-cv-primary text-cv-text-inverse shadow-cv-xs":"border-cv-border bg-cv-surface-soft text-cv-text-muted hover:border-cv-primary/40 hover:bg-cv-primary-soft hover:text-cv-primary"}`}><ChevronUp className="mb-1 h-4 w-4"/><span className="text-sm font-bold leading-none">{localDiscussion.votes??0}</span></button>
      <div className="min-w-0 flex-1"><h2 className="break-words font-semibold leading-snug text-cv-text">{localDiscussion.title}</h2><p className="mt-2 break-words text-sm leading-relaxed text-cv-text-secondary">{localDiscussion.details}</p><div className="mt-2.5 flex items-center gap-2 text-xs text-cv-text-muted"><span className="font-medium text-cv-text-secondary">{localDiscussion.author}</span><span className="text-cv-text-subtle">·</span><span>{timeAgo(localDiscussion.timestamp)}</span>{comments.length>0&&<><span className="text-cv-text-subtle">·</span><span className="flex items-center gap-1"><MessageCircle className="h-3 w-3"/>{comments.length}</span></>}</div></div>
    </div>
    {comments.length>0&&<div className="border-t border-cv-divider px-5 py-2.5"><button onClick={()=>setExpanded(v=>!v)} className="text-xs font-medium text-cv-text-muted transition-colors duration-150 hover:text-cv-primary">{expanded?"▲ Hide":"▼ Show"} {comments.length} comment{comments.length!==1?"s":""}</button></div>}
    {expanded&&comments.length>0&&<div className="space-y-2 px-5 pb-4">{comments.map((c,i)=><div key={i} className="rounded-cv-md border border-cv-border bg-cv-surface-soft p-3"><p className="mb-1 text-xs font-medium text-cv-text-muted">{c.user}</p><p className="break-words text-sm leading-relaxed text-cv-text-secondary">{c.text}</p></div>)}</div>}
    <div className="flex gap-2 px-5 pb-5 pt-1"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleComment()} placeholder="Share your thoughts…" className="flex-1 rounded-cv-sm border border-cv-border-strong bg-cv-surface px-3 py-2.5 text-sm text-cv-text outline-none transition-all placeholder:text-cv-text-muted focus:border-cv-primary/40 focus:ring-2 focus:ring-cv-primary/20"/><button onClick={handleComment} disabled={!text.trim()||replying} className="rounded-cv-sm bg-cv-accent px-5 py-2.5 text-sm font-semibold text-cv-text-inverse shadow-cv-xs transition-all duration-200 hover:opacity-90 hover:shadow-cv-sm disabled:cursor-not-allowed disabled:opacity-40">{replying?"…":"Reply"}</button></div>
  </div>;
}
