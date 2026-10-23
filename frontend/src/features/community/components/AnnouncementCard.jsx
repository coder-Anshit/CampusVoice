import { Info, AlertTriangle, Siren } from "lucide-react";

const CONFIG = {
  normal: { accent:"info", icon:Info, label:"Notice" },
  important: { accent:"warning", icon:AlertTriangle, label:"Important" },
  urgent: { accent:"danger", icon:Siren, label:"Urgent" },
};

const accentMap = {
  info:{bar:"bg-cv-info",soft:"bg-cv-info-soft",text:"text-cv-info",border:"border-cv-info/20"},
  warning:{bar:"bg-cv-warning",soft:"bg-cv-warning-soft",text:"text-cv-warning",border:"border-cv-warning/20"},
  danger:{bar:"bg-cv-danger",soft:"bg-cv-danger-soft",text:"text-cv-danger",border:"border-cv-danger/20"},
};

export default function AnnouncementCard({announcement}){
  const cfg=CONFIG[announcement.priority]??CONFIG.normal;const Icon=cfg.icon;const a=accentMap[cfg.accent];
  const formattedDate=announcement.timestamp?new Date(announcement.timestamp).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):null;
  return <div className="overflow-hidden rounded-cv-md border border-cv-border bg-cv-surface p-5 shadow-cv-xs transition-all hover:border-cv-border-strong hover:shadow-cv-sm">
    <div className={`mb-4 h-0.5 w-10 rounded-full ${a.bar}`}/>
    <div className="mb-2.5 flex items-start justify-between gap-3"><h2 className="line-clamp-2 text-sm font-medium leading-snug text-cv-text">{announcement.title}</h2><span className={`inline-flex shrink-0 items-center gap-1.5 rounded-cv-sm border px-2.5 py-1 text-xs font-medium ${a.soft} ${a.text} ${a.border}`}><Icon className="h-3.5 w-3.5"/>{cfg.label}</span></div>
    <p className="text-sm leading-relaxed text-cv-text-secondary">{announcement.details}</p>
    <div className="mt-4 flex items-center justify-between border-t border-cv-divider pt-3"><span className="text-xs text-cv-text-subtle">By <span className="font-medium text-cv-text-muted">{announcement.author}</span></span>{formattedDate&&<span className="text-xs text-cv-text-subtle">{formattedDate}</span>}</div>
  </div>;
}
