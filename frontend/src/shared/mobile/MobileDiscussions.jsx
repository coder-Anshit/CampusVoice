import { useMemo, useState } from "react";
import { ChevronUp, MessageCircle, Plus, Send, Flag, X } from "lucide-react";
import { commentOnDiscussion, createDiscussion, voteDiscussion } from "../services/discussions.service.js";
import MobileCard from "./primitives/MobileCard.jsx";
import MobileSection from "./primitives/MobileSection.jsx";
import MobileEmptyState from "./primitives/MobileEmptyState.jsx";
import MobileSkeleton from "./primitives/MobileSkeleton.jsx";
import MobileButton from "./primitives/MobileButton.jsx";

function timeAgo(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * Inline composer intentionally follows the Polls create pattern:
 * compact trigger card -> compact editor -> no bottom-sheet takeover.
 */
function DiscussionCreator({ username, open, onClose, onCreated, adminMode = false }) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [posting, setPosting] = useState(false);
  const [anonymous, setAnonymous] = useState(true);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!title.trim() || !details.trim() || posting) return;
    setPosting(true);
    setError("");
    try {
      await createDiscussion({
        title: title.trim(),
        details: details.trim(),
        author: username || (adminMode ? "Admin" : "Anonymous"),
        anonymous,
      });
      setTitle("");
      setDetails("");
      await onCreated?.();
      onClose?.();
    } catch (err) {
      console.error("Failed to create discussion:", err);
      setError(err?.response?.data?.error || (adminMode ? "Unable to publish discussion." : "Unable to post discussion."));
    } finally {
      setPosting(false);
    }
  };

  if (!open) return null;

  return (
    <MobileCard padding="sm" className="mb-3 overflow-hidden border-cv-primary-border/70 bg-cv-surface shadow-cv-xs">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cv-primary-soft text-cv-primary">
          <MessageCircle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-cv-primary">
            {adminMode ? "Publish discussion" : "New discussion"}
          </p>
          <p className="mt-0.5 text-[10px] text-cv-text-muted">
            {adminMode ? "Share an official campus topic." : "Ask a question or start a campus topic."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close discussion creator"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-cv-border bg-cv-surface-soft text-cv-text-muted transition-colors hover:text-cv-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Discussion title"
          className="min-h-10 w-full rounded-xl border border-cv-border bg-cv-bg px-3 text-sm text-cv-text outline-none focus:border-cv-primary/50 focus:ring-2 focus:ring-cv-primary/15"
        />
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="What would you like to discuss?"
          className="w-full resize-none rounded-xl border border-cv-border bg-cv-bg px-3 py-2.5 text-sm leading-relaxed text-cv-text outline-none focus:border-cv-primary/50 focus:ring-2 focus:ring-cv-primary/15"
        />
        {error && (
          <p className="rounded-xl bg-cv-danger-soft px-3 py-2 text-[11px] font-semibold text-cv-danger">
            {error}
          </p>
        )}
        <div className="rounded-xl border border-cv-border bg-cv-surface-soft px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-cv-text-muted">Posting as</p>
          <p className="mt-1 text-xs font-semibold text-cv-text-secondary">{anonymous ? "Anonymous" : (username || "Authenticated User")}</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-cv-text-secondary">
          <input type="checkbox" checked={anonymous} onChange={() => setAnonymous((value) => !value)} disabled={posting} className="accent-[rgb(var(--cv-primary))]" />
          Post anonymously
        </label>
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[10px] text-cv-text-muted">
            Posting as <span className="font-bold text-cv-text-secondary">{username || (adminMode ? "Admin" : "Anonymous")}</span>
          </p>
          <MobileButton
            size="sm"
            disabled={!title.trim() || !details.trim() || posting}
            onClick={submit}
            icon={Send}
          >
            {posting ? (adminMode ? "Publishing…" : "Posting…") : (adminMode ? "Publish" : "Post")}
          </MobileButton>
        </div>
      </div>
    </MobileCard>
  );
}

function DiscussionCard({ discussion, username, onRefresh }) {
  const [item, setItem] = useState(discussion);
  const [reply, setReply] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const id = item?._id || item?.id;
  const voter = username || localStorage.getItem("username") || "anonymous";
  const comments = Array.isArray(item?.comments) ? item.comments : [];
  const hasVoted = Array.isArray(item?.voters) && item.voters.map(String).includes(String(voter));

  const refresh = async () => {
    await onRefresh?.();
  };

  const handleVote = async () => {
    if (!id || busy) return;
    setBusy(true);
    try {
      const updated = await voteDiscussion(id, voter);
      if (updated) setItem(updated);
      await refresh();
    } catch (err) {
      console.error("Discussion vote failed:", err);
    } finally {
      setBusy(false);
    }
  };

  const handleReply = async () => {
    if (!id || !reply.trim() || busy) return;
    setBusy(true);
    try {
      const updated = await commentOnDiscussion(id, reply.trim(), username || "Anonymous");
      if (updated) setItem(updated);
      setReply("");
      setExpanded(true);
      await refresh();
    } catch (err) {
      console.error("Discussion reply failed:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <MobileCard padding="none" className="overflow-hidden">
      <div className="p-3">
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleVote}
            disabled={busy}
            aria-label={hasVoted ? "Remove like" : "Like discussion"}
            aria-pressed={hasVoted}
            className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl border transition-all active:scale-95 disabled:opacity-60 ${
              hasVoted
                ? "border-cv-primary/35 bg-cv-primary-soft text-cv-primary"
                : "border-cv-border bg-cv-surface text-cv-text-muted hover:border-cv-primary/30 hover:bg-cv-primary-soft hover:text-cv-primary"
            }`}
          >
            <ChevronUp className={`h-3.5 w-3.5 ${hasVoted ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px] font-extrabold tabular-nums">{item?.votes || 0}</span>
          </button>

          <div className="min-w-0 flex-1">
            <h3 className="break-words text-[13px] font-bold leading-snug text-cv-text">
              {item?.title || "Untitled discussion"}
            </h3>
            <p className="mt-1 line-clamp-2 break-words text-[11px] leading-5 text-cv-text-secondary">
              {item?.details}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[9px] text-cv-text-muted">
              <span className="font-semibold text-cv-text-secondary">{item?.author || "Anonymous"}</span>
              <span>·</span>
              <span>{timeAgo(item?.timestamp || item?.createdAt)}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {comments.length}
              </span>
            </div>
          </div>
        </div>

        {comments.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2.5 min-h-8 w-full rounded-lg bg-cv-surface-soft px-2.5 text-left text-[10px] font-bold text-cv-text-secondary"
          >
            {expanded ? "Hide replies" : `View ${comments.length} ${comments.length === 1 ? "reply" : "replies"}`}
          </button>
        )}

        {expanded && comments.length > 0 && (
          <div className="mt-2 space-y-1.5 border-l-2 border-cv-border pl-2.5">
            {comments.map((comment, index) => (
              <div key={`${comment?.user || "reply"}-${index}`} className="rounded-lg bg-cv-surface-soft p-2">
                <p className="text-[10px] font-bold text-cv-text-secondary">{comment?.user || "Anonymous"}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-cv-text">{comment?.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-cv-divider px-2.5 py-2">
        <div className="flex gap-1.5">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReply()}
            placeholder="Write a reply…"
            className="min-h-9 min-w-0 flex-1 rounded-lg border border-cv-border bg-cv-surface px-2.5 text-[11px] text-cv-text outline-none focus:border-cv-primary/50"
          />
          <button
            type="button"
            onClick={handleReply}
            disabled={!reply.trim() || busy}
            aria-label="Send reply"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cv-primary text-cv-text-inverse disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowReport((v) => !v)}
            aria-label="Report discussion"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cv-border text-cv-text-muted"
          >
            <Flag className="h-3.5 w-3.5" />
          </button>
        </div>
        {showReport && (
          <p className="mt-1.5 text-[9px] leading-3.5 text-cv-text-muted">
            Use the institution's reporting channel for content that violates campus rules.
          </p>
        )}
      </div>
    </MobileCard>
  );
}

export default function MobileDiscussions({
  discussions = [],
  username,
  loading = false,
  onRefresh,
  initialComposerOpen = false,
  onComposerClose,
  adminMode = false,
}) {
  const [composerOpen, setComposerOpen] = useState(initialComposerOpen);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = discussions.filter((d) =>
      !q || `${d?.title || ""} ${d?.details || ""} ${d?.author || ""}`.toLowerCase().includes(q)
    );
    return [...list].sort((a, b) => {
      if (sort === "popular") return (b?.votes || 0) - (a?.votes || 0);
      return new Date(b?.timestamp || b?.createdAt || 0) - new Date(a?.timestamp || a?.createdAt || 0);
    });
  }, [discussions, query, sort]);

  const closeComposer = () => {
    setComposerOpen(false);
    onComposerClose?.();
  };

  const openComposer = () => setComposerOpen(true);

  return (
    <div className="space-y-4">
      <MobileSection
        title="Campus discussions"
        subtitle={adminMode ? "Publish and moderate campus conversations." : "Ask, share, and join conversations across campus."}
      >
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[["newest", "Newest"], ["popular", "Popular"]].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSort(value)}
              className={`min-h-9 shrink-0 rounded-full border px-3.5 text-[11px] font-bold ${
                sort === value
                  ? "border-cv-primary bg-cv-primary text-white"
                  : "border-cv-border bg-cv-surface text-cv-text-secondary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </MobileSection>

      {loading ? (
        <div className="space-y-2.5"><MobileSkeleton /><MobileSkeleton /><MobileSkeleton /></div>
      ) : visible.length ? (
        <div className="space-y-2.5">
          {visible.map((discussion) => (
            <DiscussionCard
              key={discussion?._id || discussion?.id}
              discussion={discussion}
              username={username}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      ) : (
        <MobileEmptyState
          title={query ? "No matching discussions" : "No discussions yet"}
          message={query ? "Try another search." : "Start the first campus conversation."}

        />
      )}
    </div>
  );
}
