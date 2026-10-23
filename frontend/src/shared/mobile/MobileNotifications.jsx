import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, ChevronRight, Circle, RefreshCw } from "lucide-react";
import { fetchNotifications, markNotificationRead } from "../services/notifications.service.js";
import MobileCard from "./primitives/MobileCard.jsx";
import MobileSection from "./primitives/MobileSection.jsx";
import MobileEmptyState from "./primitives/MobileEmptyState.jsx";
import MobileSkeleton from "./primitives/MobileSkeleton.jsx";
import MobileBadge from "./primitives/MobileBadge.jsx";

const FILTERS = ["All", "Unread", "Issues", "Polls", "Discussions", "Announcements", "Tasks"];

const CATEGORY_LABELS = {
  issue: "Issues",
  issues: "Issues",
  poll: "Polls",
  polls: "Polls",
  discussion: "Discussions",
  discussions: "Discussions",
  announcement: "Announcements",
  announcements: "Announcements",
  task: "Tasks",
  tasks: "Tasks",
  feedback: "Feedback",
};

const PRIORITY_STYLES = {
  urgent: "border-cv-danger/30 bg-cv-danger/5",
  important: "border-cv-warning/30 bg-cv-warning/5",
};

function normalizeCategory(notification) {
  const raw = String(notification?.category || notification?.type || "system").toLowerCase();
  return CATEGORY_LABELS[raw] || "System";
}

function notificationDate(notification) {
  return notification?.createdAt || notification?.timestamp || notification?.date || null;
}

function relativeTime(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function isRead(notification) {
  return Boolean(notification?.read || notification?.readAt);
}

function entityTab(notification) {
  const type = String(notification?.entityType || notification?.category || notification?.type || "").toLowerCase();
  if (type.includes("issue")) return "issues";
  if (type.includes("poll")) return "polls";
  if (type.includes("discussion")) return "discussions";
  if (type.includes("announcement")) return "announcements";
  if (type.includes("feedback")) return "feedback";
  if (type.includes("task")) return "tasks";
  return null;
}

export default function MobileNotifications({ username, onNavigate, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = async ({ quiet = false } = {}) => {
    if (!username) return;
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const data = await fetchNotifications(username);
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      onUnreadCountChange?.(list.filter((item) => !isRead(item)).length);
    } catch (err) {
      console.error("Failed to load mobile notifications:", err);
      setError("Unable to load alerts right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [username]);

  const filtered = useMemo(() => notifications.filter((item) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !isRead(item);
    return normalizeCategory(item) === filter;
  }), [notifications, filter]);

  const grouped = useMemo(() => {
    const groups = new Map();
    filtered.forEach((item) => {
      const value = notificationDate(item);
      const date = value ? new Date(value) : new Date();
      const key = date.toDateString() === new Date().toDateString()
        ? "Today"
        : date.toDateString() === new Date(Date.now() - 86400000).toDateString()
          ? "Yesterday"
          : date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });
    return Array.from(groups.entries());
  }, [filtered]);

  const markRead = async (notification) => {
    const id = notification?._id || notification?.id;
    if (!id || isRead(notification)) return;
    setNotifications((current) => current.map((item) =>
      String(item?._id || item?.id) === String(id) ? { ...item, read: true, readAt: new Date().toISOString() } : item
    ));
    onUnreadCountChange?.(notifications.filter((item) => !isRead(item) && String(item?._id || item?.id) !== String(id)).length);
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error("Failed to mark notification read:", err);
      load({ quiet: true });
    }
  };

  const openNotification = async (notification) => {
    await markRead(notification);
    const target = entityTab(notification);
    if (target) onNavigate?.(target, notification);
  };

  const markAllRead = async () => {
    const unread = notifications.filter((item) => !isRead(item));
    if (!unread.length) return;
    // The current backend exposes per-notification read only, so mark each known unread item.
    await Promise.all(unread.map(async (item) => {
      const id = item?._id || item?.id;
      if (!id) return;
      try { await markNotificationRead(id); } catch (err) { console.error("Failed to mark notification read:", err); }
    }));
    setNotifications((current) => current.map((item) => ({ ...item, read: true, readAt: item.readAt || new Date().toISOString() })));
    onUnreadCountChange?.(0);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cv-text-muted">Stay updated</p>
          <h2 className="mt-1 text-lg font-bold text-cv-text">Your alerts</h2>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => load({ quiet: true })} className="cv-touch-target flex items-center justify-center rounded-cv-sm text-cv-text-secondary" aria-label="Refresh alerts">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={markAllRead} className="cv-touch-target flex items-center justify-center rounded-cv-sm text-cv-primary" aria-label="Mark all alerts as read" title="Mark all as read">
            <CheckCheck className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="cv-horizontal-rail !mx-0 !px-0" aria-label="Notification filters">
        {FILTERS.map((item) => (
          <button key={item} type="button" onClick={() => setFilter(item)} aria-pressed={filter === item} className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold ${filter === item ? "bg-cv-primary text-white" : "bg-cv-surface-soft text-cv-text-secondary"}`}>
            {item}
          </button>
        ))}
      </div>

      {error && (
        <MobileCard className="border-cv-danger/30 bg-cv-danger/5">
          <p className="text-sm font-semibold text-cv-danger">{error}</p>
          <button type="button" onClick={() => load()} className="mt-3 text-xs font-bold text-cv-primary">Try again</button>
        </MobileCard>
      )}

      {loading ? (
        <div className="space-y-3"><MobileSkeleton /><MobileSkeleton /><MobileSkeleton /></div>
      ) : grouped.length === 0 ? (
        <MobileEmptyState icon={<Bell className="h-5 w-5" />} title={filter === "Unread" ? "You're all caught up" : "No alerts yet"} message={filter === "Unread" ? "New campus activity will appear here." : "Issue updates, polls, discussions and announcements will appear here."} />
      ) : (
        grouped.map(([group, items]) => (
          <MobileSection key={group} title={group}>
            <div className="space-y-2">
              {items.map((notification) => {
                const read = isRead(notification);
                const priority = String(notification?.priority || "").toLowerCase();
                const priorityClass = PRIORITY_STYLES[priority] || "";
                const category = normalizeCategory(notification);
                return (
                  <button key={notification?._id || notification?.id || `${group}-${notification?.title}`} type="button" onClick={() => openNotification(notification)} className={`w-full text-left ${!read ? "" : "opacity-80"}`}>
                    <MobileCard className={`relative flex gap-3 p-3.5 transition ${priorityClass}`}>
                      {!read && <span className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cv-primary" aria-label="Unread" />}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-cv-md bg-cv-primary-soft text-cv-primary">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <p className={`min-w-0 text-sm ${read ? "font-semibold" : "font-extrabold"} text-cv-text`}>{notification?.title || "CampusVoice update"}</p>
                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-cv-text-muted" />
                        </div>
                        <p className="line-clamp-2 text-xs leading-5 text-cv-text-secondary">{notification?.message || notification?.body || "You have a new CampusVoice update."}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <MobileBadge>{category}</MobileBadge>
                          {priority && priority !== "normal" && <MobileBadge>{priority}</MobileBadge>}
                          <span className="text-[10px] font-semibold text-cv-text-muted">{relativeTime(notificationDate(notification))}</span>
                        </div>
                      </div>
                    </MobileCard>
                  </button>
                );
              })}
            </div>
          </MobileSection>
        ))
      )}
    </div>
  );
}
