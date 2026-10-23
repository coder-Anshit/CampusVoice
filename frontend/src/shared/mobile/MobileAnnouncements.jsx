import { useEffect, useMemo, useState } from "react";
import { createAnnouncement } from "../services/announcements.service.js";
import { AlertTriangle, Archive, Bell, ChevronRight, Clock3, ExternalLink, FileText, Info, Megaphone, Paperclip, Siren } from "lucide-react";
import { MobileBadge, MobileButton, MobileCard, MobileEmptyState, MobileSection, MobileSkeleton, MobileStatus } from "./primitives/index.js";

const PRIORITY = {
  normal: { label: "Notice", icon: Info, tone: "info" },
  important: { label: "Important", icon: AlertTriangle, tone: "warning" },
  urgent: { label: "Urgent", icon: Siren, tone: "danger" },
  critical: { label: "Critical", icon: Siren, tone: "danger" },
};

function priorityConfig(priority) {
  return PRIORITY[String(priority || "normal").toLowerCase()] || PRIORITY.normal;
}

function dateValue(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(value) {
  const d = dateValue(value);
  return d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : null;
}

function isExpired(item) {
  const expiry = item.expiresAt || item.expiryDate || item.expiry;
  const d = dateValue(expiry);
  return Boolean(d && d.getTime() < Date.now());
}

function attachmentsFor(item) {
  const raw = item.attachments || item.files || item.documents || [];
  return Array.isArray(raw) ? raw : [];
}

function ctaFor(item) {
  if (item.cta && typeof item.cta === "object") return item.cta;
  if (item.action && typeof item.action === "object") return item.action;
  if (item.ctaLabel || item.ctaUrl) return { label: item.ctaLabel || "Open", url: item.ctaUrl };
  return null;
}

function AnnouncementDetail({ announcement, acknowledged, onAcknowledge, onBack }) {
  const cfg = priorityConfig(announcement.priority);
  const Icon = cfg.icon;
  const attachments = attachmentsFor(announcement);
  const cta = ctaFor(announcement);
  const expired = isExpired(announcement);
  const published = formatDate(announcement.timestamp || announcement.publishedAt || announcement.createdAt);
  const expiry = formatDate(announcement.expiresAt || announcement.expiryDate || announcement.expiry);

  return (
    <div className="space-y-4">
      <MobileButton variant="ghost" size="sm" onClick={onBack}>← Back to announcements</MobileButton>
      <MobileCard className="overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-cv-md ${cfg.tone === "danger" ? "bg-cv-danger-soft text-cv-danger" : cfg.tone === "warning" ? "bg-cv-warning-soft text-cv-warning" : "bg-cv-info-soft text-cv-info"}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <MobileBadge tone={cfg.tone === "danger" ? "danger" : cfg.tone === "warning" ? "warning" : "info"}>{cfg.label}</MobileBadge>
              <h2 className="mt-2 text-xl font-bold leading-tight text-cv-text">{announcement.title}</h2>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-cv-text-muted">
          {announcement.author && <span>By <strong className="text-cv-text">{announcement.author}</strong></span>}
          {published && <span>{published}</span>}
          {expiry && <span className={expired ? "font-bold text-cv-danger" : ""}>{expired ? "Expired" : `Until ${expiry}`}</span>}
        </div>

        <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-cv-text-secondary">{announcement.details || announcement.description || "No additional details provided."}</div>

        {attachments.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-cv-text-muted">Attachments</p>
            {attachments.map((file, index) => {
              const label = typeof file === "string" ? file : file.name || file.title || `Attachment ${index + 1}`;
              const href = typeof file === "string" ? file : file.url || file.href;
              return href ? (
                <a key={`${label}-${index}`} href={href} target="_blank" rel="noreferrer" className="flex min-h-12 items-center gap-3 rounded-cv-md border border-cv-border bg-cv-bg px-3 text-sm font-semibold text-cv-text">
                  <Paperclip className="h-4 w-4 text-cv-primary" />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  <ExternalLink className="h-4 w-4 text-cv-text-muted" />
                </a>
              ) : (
                <div key={`${label}-${index}`} className="flex min-h-12 items-center gap-3 rounded-cv-md border border-cv-border bg-cv-bg px-3 text-sm text-cv-text">
                  <FileText className="h-4 w-4 text-cv-text-muted" /><span className="truncate">{label}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {cta?.url && !expired && (
            <a href={cta.url} target="_blank" rel="noreferrer" className="cv-touch-target flex items-center justify-center rounded-cv-md bg-cv-primary px-4 text-sm font-bold text-white">
              {cta.label || "Open"}<ExternalLink className="ml-2 h-4 w-4" />
            </a>
          )}
          {cta && !cta.url && cta.label && !expired && <MobileButton className="w-full" onClick={() => cta.onClick?.()}>{cta.label}</MobileButton>}
          {!expired && (
            <MobileButton variant={acknowledged ? "secondary" : "primary"} className="w-full" onClick={onAcknowledge} disabled={acknowledged}>
              <Bell className="mr-2 h-4 w-4" />{acknowledged ? "Acknowledged" : "Acknowledge announcement"}
            </MobileButton>
          )}
        </div>
      </MobileCard>
    </div>
  );
}

function AnnouncementCard({ announcement, acknowledged, onOpen }) {
  const cfg = priorityConfig(announcement.priority);
  const Icon = cfg.icon;
  const expired = isExpired(announcement);
  const published = formatDate(announcement.timestamp || announcement.publishedAt || announcement.createdAt);
  return (
    <button type="button" onClick={() => onOpen(announcement)} className="block w-full text-left">
      <MobileCard className="transition-transform active:scale-[0.99]">
        <div className="flex items-start gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-cv-md ${cfg.tone === "danger" ? "bg-cv-danger-soft text-cv-danger" : cfg.tone === "warning" ? "bg-cv-warning-soft text-cv-warning" : "bg-cv-info-soft text-cv-info"}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <MobileBadge tone={cfg.tone === "danger" ? "danger" : cfg.tone === "warning" ? "warning" : "info"}>{cfg.label}</MobileBadge>
                <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-cv-text">{announcement.title}</h3>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-cv-text-muted" />
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-cv-text-secondary">{announcement.details || announcement.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-cv-text-subtle">
              {published && <span>{published}</span>}
              {announcement.author && <span>By {announcement.author}</span>}
              {expired && <span className="font-bold text-cv-danger">Expired</span>}
              {acknowledged && <span className="font-bold text-cv-success">Acknowledged</span>}
            </div>
          </div>
        </div>
      </MobileCard>
    </button>
  );
}

export default function MobileAnnouncements({ announcements = [], loading = false, onRefresh, adminMode = false, initialCreateOpen = false, onCreateConsumed }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("active");
  const [acknowledged, setAcknowledged] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cv_acknowledged_announcements") || "[]"); } catch { return []; }
  });
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState("normal");
  const [posting, setPosting] = useState(false);
  const [createError, setCreateError] = useState("");
  const [creatorOpen, setCreatorOpen] = useState(Boolean(initialCreateOpen));

  const submitAnnouncement = async () => {
    if (!title.trim() || !details.trim() || posting) return;
    try {
      setPosting(true);
      setCreateError("");
      await createAnnouncement({ title: title.trim(), details: details.trim(), priority, author: localStorage.getItem("username") || "Admin" });
      setTitle("");
      setDetails("");
      setPriority("normal");
      await onRefresh?.();
    } catch (error) {
      console.error("Failed to create announcement:", error);
      setCreateError("Unable to publish announcement. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("cv_acknowledged_announcements", JSON.stringify(acknowledged));
  }, [acknowledged]);

  useEffect(() => {
    if (initialCreateOpen) {
      setCreatorOpen(true);
      onCreateConsumed?.();
    }
  }, [initialCreateOpen, onCreateConsumed]);

  const filtered = useMemo(() => announcements.filter((item) => {
    const expired = isExpired(item);
    if (filter === "active") return !expired;
    if (filter === "important") return ["important", "urgent", "critical"].includes(String(item.priority || "normal").toLowerCase());
    if (filter === "acknowledged") return acknowledged.includes(String(item._id || item.id));
    if (filter === "archived") return expired;
    return true;
  }), [announcements, filter, acknowledged]);

  const adminCreator = adminMode && creatorOpen ? (
    <MobileCard padding="md" className="overflow-hidden">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-cv-md bg-cv-primary-soft text-cv-primary"><Megaphone className="h-5 w-5" /></span>
        <div>
          <p className="text-sm font-bold text-cv-text">New announcement</p>
          <p className="text-[11px] text-cv-text-secondary">Broadcast an official campus update.</p>
        </div>
      </div>
      <div className="space-y-2.5">
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Announcement title" className="min-h-11 w-full rounded-cv-md border border-cv-border bg-cv-surface px-3 text-sm text-cv-text outline-none focus:border-cv-primary/50 focus:ring-2 focus:ring-cv-primary/20" />
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder="Write the details here…" className="w-full resize-none rounded-cv-md border border-cv-border bg-cv-surface px-3 py-2.5 text-sm leading-relaxed text-cv-text outline-none focus:border-cv-primary/50 focus:ring-2 focus:ring-cv-primary/20" />
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[['normal','Normal'],['important','Important'],['urgent','Urgent']].map(([value,label]) => <button key={value} type="button" onClick={() => setPriority(value)} className={`min-h-9 shrink-0 rounded-full border px-3 text-[11px] font-bold ${priority === value ? 'border-cv-primary bg-cv-primary text-white' : 'border-cv-border bg-cv-surface-soft text-cv-text-secondary'}`}>{label}</button>)}
        </div>
        {createError && <p className="rounded-cv-sm bg-cv-danger-soft px-3 py-2 text-xs font-semibold text-cv-danger">{createError}</p>}
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => setCreatorOpen(false)} className="text-xs font-bold text-cv-text-muted">Cancel</button>
          <MobileButton disabled={!title.trim() || !details.trim() || posting} onClick={submitAnnouncement}>{posting ? "Publishing…" : "Publish announcement"}</MobileButton>
        </div>
      </div>
    </MobileCard>
  ) : null;

  const acknowledge = (item) => {
    const id = String(item._id || item.id);
    if (!id) return;
    setAcknowledged((prev) => prev.includes(id) ? prev : [...prev, id]);
  };

  if (selected) {
    const id = String(selected._id || selected.id);
    return <AnnouncementDetail announcement={selected} acknowledged={acknowledged.includes(id)} onAcknowledge={() => acknowledge(selected)} onBack={() => setSelected(null)} />;
  }

  if (loading) return <div className="space-y-3">{[1,2,3,4].map((item) => <MobileSkeleton key={item} />)}</div>;

  return (
    <div className="space-y-5">
      {adminCreator}
      {!adminMode && <MobileSection title="Campus announcements" subtitle="Official updates from your institution" />}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Announcement filters">
        {[['active', 'Active'], ['important', 'Important'], ['acknowledged', 'Acknowledged'], ['archived', 'Archived'], ['all', 'All']].map(([value, label]) => (
          <button key={value} type="button" onClick={() => setFilter(value)} className={`cv-touch-target shrink-0 rounded-full border px-4 text-xs font-bold ${filter === value ? "border-cv-primary bg-cv-primary text-white" : "border-cv-border bg-cv-surface text-cv-text-muted"}`} aria-selected={filter === value}>{label}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <MobileEmptyState icon={<Archive className="h-6 w-6" />} title={filter === "archived" ? "No archived announcements" : "No announcements"} message="There are no announcements matching this view right now." />
      ) : (
        <div className="space-y-3">
          {filtered.map((announcement) => {
            const id = String(announcement._id || announcement.id);
            return <AnnouncementCard key={id} announcement={announcement} acknowledged={acknowledged.includes(id)} onOpen={setSelected} />;
          })}
        </div>
      )}

    </div>
  );
}
