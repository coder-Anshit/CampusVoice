import { Bell, Plus, ArrowLeft } from "lucide-react";
import { useMemo } from "react";

export default function MobileHeader({
  username,
  role = "student",
  activeTab = "dashboard",
  unreadCount = 0,
  onNotifications,
  onProfile,
  onCreate,
  showNotifications = true,
  backMode = false,
  onBack,
}) {
  const contextLabel = useMemo(() => {
    const labels = {
      student: "Student",
      faculty: "Faculty",
      employee: "Faculty / Staff",
      hod: "Department Head",
      admin: "Administrator",
      superadmin: "Super Admin",
    };
    return labels[String(role || "student").toLowerCase()] || "Campus member";
  }, [role]);

  return (
    <header className="sticky top-0 z-40 cv-mobile-safe-top border-b border-cv-border bg-cv-surface/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[64px] max-w-xl items-center gap-2.5 px-4">
        {backMode ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="cv-touch-target flex shrink-0 items-center justify-center rounded-full text-cv-text-secondary transition-colors active:bg-cv-surface-soft"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onProfile}
            aria-label="Open profile"
            className="cv-touch-target flex shrink-0 items-center justify-center rounded-full"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cv-primary text-[11px] font-extrabold text-white shadow-cv-sm ring-4 ring-cv-primary-soft">
              {(username || "C").slice(0, 1).toUpperCase()}
            </span>
          </button>
        )}

        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[15px] font-bold tracking-[-0.025em] text-cv-text">
            Campus<span className="text-cv-primary">Voice</span>
          </p>
          <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-[0.13em] text-cv-text-muted">
            {contextLabel}
          </p>
        </div>

        {!backMode && (
          <button
            type="button"
            onClick={onCreate}
            aria-label="Create"
            className="cv-touch-target inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cv-primary-border bg-cv-primary-soft px-3.5 text-xs font-extrabold text-cv-primary shadow-cv-xs transition-all active:scale-[0.98] active:bg-cv-primary active:text-white"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span>Create</span>
          </button>
        )}

        {showNotifications && (
          <button
            type="button"
            onClick={onNotifications}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            className="cv-touch-target relative flex shrink-0 items-center justify-center rounded-full text-cv-text-secondary transition-colors active:bg-cv-surface-soft"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cv-danger px-1 text-[9px] font-bold text-white ring-2 ring-cv-surface">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
