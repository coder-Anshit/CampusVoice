import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, SearchX } from "lucide-react";
import IssueCard from "./IssueCard.jsx";

export default function IssueFeed({ issues, onUpvote, voterId, onComment, onReply, onDelete, onReport, isAdmin, onVerify }) {
  if (!issues || issues.length === 0) {
    return <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.3,ease:"easeOut"}} className="flex min-h-[360px] flex-col items-center justify-center rounded-cv-xl border border-cv-border bg-cv-surface px-6 py-12 text-center shadow-cv-card">
      <div className="flex h-14 w-14 items-center justify-center rounded-cv-md border border-cv-primary-border bg-cv-primary-soft text-cv-primary"><SearchX className="h-6 w-6" strokeWidth={1.6}/></div>
      <h3 className="mt-5 text-[15px] font-semibold text-cv-text">No campus issues yet</h3>
      <p className="mt-1 max-w-[280px] text-[12px] leading-relaxed text-cv-text-muted">No issues match your current view. Try another category or check back later.</p>
      <div className="mt-5 flex items-center gap-2 text-[9px] uppercase tracking-[.1em] text-cv-text-subtle"><span className="h-px w-8 bg-cv-divider"/><span>CampusVoice</span><span className="h-px w-8 bg-cv-divider"/></div>
    </motion.div>;
  }
  return <div className="w-full">
    <div className="mb-3 flex items-center justify-between px-1"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cv-primary-soft text-cv-primary"><MessageSquare className="h-3.5 w-3.5" strokeWidth={1.8}/></div><div><p className="text-[11px] font-semibold text-cv-text-secondary">Campus issues</p><p className="text-[9px] text-cv-text-subtle">{issues.length} {issues.length===1?"issue":"issues"}</p></div></div><div className="hidden items-center gap-1.5 text-[9px] font-medium text-cv-text-subtle sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-cv-success"/>Live feed</div></div>
    <div className="space-y-3"><AnimatePresence mode="popLayout">{issues.map((issue,index)=><motion.div key={issue.id??issue._id??`issue-${index}`} layout initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8,scale:.985}} transition={{duration:.22,delay:Math.min(index*.025,.15),ease:[.22,1,.36,1]}}><IssueCard issue={issue} onUpvote={onUpvote} voterId={voterId} onComment={onComment} onReply={onReply} onDelete={onDelete} isAdmin={isAdmin} onReport={onReport} onVerify={onVerify}/></motion.div>)}</AnimatePresence></div>
    <div className="flex items-center justify-center gap-2 py-6 text-[9px] font-medium uppercase tracking-[.1em] text-cv-text-subtle"><span className="h-px w-10 bg-cv-divider"/><Plus className="h-3 w-3" strokeWidth={1.8}/><span>More campus voices</span><span className="h-px w-10 bg-cv-divider"/></div>
  </div>;
}
