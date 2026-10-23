import { Shield, LogOut, RefreshCw, Plus } from "lucide-react";
import { cv, SANS } from "../../../shared/design-system/inline.js";
import ThemePicker from "../../../shared/components/ThemePicker.jsx";

/* =========================================================
   TOP BAR
========================================================= */

export function TopBar({ lastUpdated, loading, onRefresh, onLogout, onCreate, role = "admin" }) {
  return (
    <header
      className="sticky top-0 z-50 bg-cv-surface border-b"
      style={{ borderColor: cv.border }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
            style={{ background: cv.primary }}
          >
            <Shield className="w-4 h-4 text-white" />
          </div>

          <div>
            <h1 className="text-sm font-medium" style={{ ...SANS, color: cv.text }}>
              {role === "admin" ? "Admin Dashboard" : role === "hod" ? "Department Workspace" : "Employee Workspace"}
            </h1>
            <p className="text-xs" style={{ color: cv.textMuted }}>
              {role === "admin" ? "CampusVoice control center" : "CampusVoice staff workspace"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div
              className="hidden sm:flex items-center gap-1.5 text-[11px]"
              style={{ color: cv.textMuted }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: cv.primary }} />
              Updated{" "}
              {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          )}

          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
            style={{ background: cv.primary }}
            onMouseEnter={(e) => (e.currentTarget.style.background = cv.primaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = cv.primary)}
          >
            <Plus className="h-3.5 w-3.5" />
            Create
          </button>

          <ThemePicker compact />

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh grievances"
            className="w-9 h-9 rounded-md flex items-center justify-center border transition-colors"
            style={{ borderColor: cv.border, color: cv.textSecondary, background: cv.surfaceSoft }}
            onMouseEnter={(e) => (e.currentTarget.style.background = cv.border)}
            onMouseLeave={(e) => (e.currentTarget.style.background = cv.surfaceSoft)}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-medium py-2 px-3 rounded-md border transition-colors"
            style={{ color: cv.danger, borderColor: cv.dangerSoft, background: "transparent" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = cv.dangerSoft)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   TAB NAVIGATION
========================================================= */

export function TabNav({ tabs, activeTab, onChange }) {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 pt-5">
      <div
        className="flex gap-1 bg-cv-surface border p-1.5 rounded-lg w-fit max-w-full overflow-x-auto"
        style={{ borderColor: cv.border }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-md font-medium whitespace-nowrap transition-colors"
              style={
                active
                  ? { background: cv.primary, color: cv.textInverse }
                  : { background: "transparent", color: cv.textSecondary }
              }
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = cv.surfaceSoft;
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span
                  className="text-[11px] min-w-[20px] text-center px-1.5 py-0.5 rounded font-semibold"
                  style={
                    active
                      ? { background: "rgb(var(--cv-surface) / 0.22)", color: cv.textInverse }
                      : { background: cv.surfaceSoft, color: cv.textSecondary }
                  }
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}