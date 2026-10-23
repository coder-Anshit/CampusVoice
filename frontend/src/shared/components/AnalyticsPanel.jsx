import { FileText, ThumbsUp, CheckCircle, Clock3 } from "lucide-react";

const CATEGORY_ACCENTS = [
  "bg-cv-category-purple",
  "bg-cv-category-amber",
  "bg-cv-category-blue",
  "bg-cv-category-pink",
];

function MiniMetric({ label, value, icon, tone = "purple" }) {
  const tones = {
    purple: "bg-cv-primary-soft cv-primary",
    amber: "bg-cv-warning-soft text-cv-warning",
    green: "bg-cv-success-soft text-cv-success",
    blue: "bg-cv-info-soft text-cv-info",
  };
  return (
    <div className="cv-surface-soft cv-border rounded-cv-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs cv-text-muted">{label}</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tones[tone] || tones.purple}`}>{icon}</span>
      </div>
      <p className="mt-2 text-lg font-semibold cv-text">{value}</p>
    </div>
  );
}

export default function AnalyticsPanel({ issues = [] }) {
  const total = issues.length;
  const resolved = issues.filter((i) => ["resolved", "verified", "closed"].includes(i.status)).length;
  const pending = issues.filter((i) => ["created", "viewed", "assigned", "accepted", "investigating", "escalated"].includes(i.status)).length;
  const votes = issues.reduce((sum, i) => sum + (i.votes ?? 0), 0);
  const resolvedPct = total ? Math.round((resolved / total) * 100) : 0;
  const categories = Object.entries(issues.reduce((acc, i) => { const cat = i.category || "General"; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})).sort((a,b) => b[1]-a[1]);

  return (
    <section className="mt-5 pt-5 border-t cv-border">
      <div className="mb-3">
        <p className="text-xs font-medium cv-text">Analytics</p>
        <p className="mt-0.5 text-xs cv-text-muted">A quick view of campus issues</p>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <MiniMetric label="Issues" value={total} icon={<FileText className="w-4 h-4" />} tone="purple" />
        <MiniMetric label="Votes" value={votes} icon={<ThumbsUp className="w-4 h-4" />} tone="amber" />
        <MiniMetric label="Resolved" value={resolved} icon={<CheckCircle className="w-4 h-4" />} tone="green" />
        <MiniMetric label="Open" value={pending} icon={<Clock3 className="w-4 h-4" />} tone="amber" />
      </div>
      {total > 0 && (
        <div className="mb-5 rounded-cv-md border cv-border cv-surface p-3">
          <div className="mb-2 flex items-center justify-between"><span className="text-xs font-medium cv-text-secondary">Resolution rate</span><span className="text-xs font-medium cv-success">{resolvedPct}%</span></div>
          <div className="h-1.5 rounded-full overflow-hidden bg-cv-surface-muted"><div className="h-full rounded-full transition-all duration-700 bg-cv-success" style={{width:`${resolvedPct}%`}} /></div>
        </div>
      )}
      <div>
        <p className="mb-2.5 text-xs font-medium cv-text">By category</p>
        {!total ? <p className="text-xs cv-text-muted">No issues yet.</p> : <div className="space-y-3">
          {categories.map(([cat,count],index)=>{ const pct=Math.round((count/total)*100); const accent=CATEGORY_ACCENTS[index%CATEGORY_ACCENTS.length]; return <div key={cat}>
            <div className="mb-1.5 flex items-center justify-between"><span className="text-xs font-medium cv-text-secondary">{cat}</span><span className="text-xs cv-text-muted">{count} · {pct}%</span></div>
            <div className="h-1.5 rounded-full overflow-hidden bg-cv-surface-muted"><div className={`h-full rounded-full transition-all duration-500 ${accent}`} style={{width:`${pct}%`}} /></div>
          </div>})}
        </div>}
      </div>
    </section>
  );
}
