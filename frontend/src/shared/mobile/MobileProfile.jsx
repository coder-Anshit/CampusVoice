import { useMemo, useState } from "react";
import { Bell, ChevronRight, LogOut, Moon, Palette, Shield, SlidersHorizontal, Sun, UserCircle2 } from "lucide-react";
import MobileCard from "./primitives/MobileCard.jsx";
import MobileSection from "./primitives/MobileSection.jsx";
import MobileBadge from "./primitives/MobileBadge.jsx";
import {
  CV_THEME_REGISTRY,
  getAppearance,
  getTheme,
  setAppearance,
  setTheme,
} from "../design-system/index.js";

const ROLE_LABELS = {
  student: "Student",
  faculty: "Faculty",
  employee: "Faculty / Staff",
  hod: "Department Head",
  admin: "Administrator",
  superadmin: "Super Admin",
};

const PREF_KEY = "cv-mobile-preferences";

function readPrefs() {
  try {
    return {
      notifications: true,
      issueUpdates: true,
      discussionReplies: true,
      pollReminders: true,
      ...JSON.parse(localStorage.getItem(PREF_KEY) || "{}"),
    };
  } catch {
    return { notifications: true, issueUpdates: true, discussionReplies: true, pollReminders: true };
  }
}

export default function MobileProfile({
  username,
  role = "student",
  issues = [],
  polls = [],
  discussions = [],
  onOpenIssues,
  onOpenPolls,
  onOpenDiscussions,
  onSignOut,
}) {
  const [theme, setCurrentTheme] = useState(() => getTheme());
  const [appearance, setCurrentAppearance] = useState(() => getAppearance());
  const [prefs, setPrefs] = useState(readPrefs);
  const [section, setSection] = useState(null);

  const roleLabel = ROLE_LABELS[String(role || "student").toLowerCase()] || "CampusVoice Member";
  const initial = String(username || "U").trim().charAt(0).toUpperCase() || "U";

  const stats = useMemo(() => [
    { label: "Issues", value: Array.isArray(issues) ? issues.filter((item) => String(item?.createdBy || item?.username || item?.reportedBy || "").toLowerCase() === String(username || "").toLowerCase()).length : 0 },
    { label: "Polls", value: Array.isArray(polls) ? polls.filter((item) => item?.voted || item?.hasVoted || item?.voterId === username).length : 0 },
    { label: "Discussions", value: Array.isArray(discussions) ? discussions.filter((item) => String(item?.author || item?.createdBy || item?.username || "").toLowerCase() === String(username || "").toLowerCase()).length : 0 },
  ], [issues, polls, discussions, username]);

  const changeTheme = (id) => {
    setTheme(id);
    setCurrentTheme(id);
  };

  const changeAppearance = (key, value) => {
    const next = setAppearance({ [key]: value });
    setCurrentAppearance(next);
  };

  const togglePref = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    localStorage.setItem(PREF_KEY, JSON.stringify(next));
  };

  const signOut = () => {
    if (onSignOut) return onSignOut();
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.reload();
  };

  return (
    <div className="space-y-5 pb-4">
      <MobileCard className="overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cv-primary-soft text-xl font-black text-cv-primary">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-cv-text">{username || "CampusVoice User"}</p>
            <p className="mt-0.5 text-sm text-cv-text-secondary">{roleLabel}</p>
            <div className="mt-2"><MobileBadge>{"CampusVoice Member"}</MobileBadge></div>
          </div>
          <UserCircle2 size={22} className="text-cv-text-muted" aria-hidden="true" />
        </div>
      </MobileCard>

      <MobileSection title="Your activity" subtitle="A quick view of your campus participation">
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => {
            const action = stat.label === "Issues" ? onOpenIssues : stat.label === "Polls" ? onOpenPolls : onOpenDiscussions;
            return <button key={stat.label} type="button" onClick={action} className="rounded-cv-md border border-cv-border bg-cv-surface p-3 text-center shadow-cv-xs transition active:scale-[0.98]"><p className="text-lg font-black text-cv-text">{stat.value}</p><p className="mt-1 text-[11px] font-semibold text-cv-text-muted">{stat.label}</p></button>;
          })}
        </div>
      </MobileSection>

      <MobileSection title="Preferences">
        <MobileCard className="divide-y divide-cv-divider p-0 overflow-hidden">
          <button type="button" onClick={() => setSection(section === "notifications" ? null : "notifications")} className="flex min-h-14 w-full items-center gap-3 px-4 text-left">
            <Bell size={18} className="text-cv-primary" />
            <span className="flex-1 text-sm font-semibold text-cv-text">Notification preferences</span>
            <ChevronRight size={18} className={`text-cv-text-muted transition-transform ${section === "notifications" ? "rotate-90" : ""}`} />
          </button>
          {section === "notifications" && (
            <div className="space-y-1 bg-cv-surface-soft p-3">
              {["notifications", "issueUpdates", "discussionReplies", "pollReminders"].map((key) => {
                const labels = { notifications: "Campus alerts", issueUpdates: "Issue updates", discussionReplies: "Discussion replies", pollReminders: "Poll reminders" };
                return (
                  <button key={key} type="button" onClick={() => togglePref(key)} className="flex min-h-12 w-full items-center gap-3 rounded-cv-sm px-2 text-left">
                    <span className="flex-1 text-sm text-cv-text">{labels[key]}</span>
                    <span className={`relative h-6 w-11 rounded-full transition-colors ${prefs[key] ? "bg-cv-primary" : "bg-cv-border-strong"}`} aria-hidden="true">
                      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${prefs[key] ? "translate-x-6" : "translate-x-1"}`} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <button type="button" onClick={() => setSection(section === "appearance" ? null : "appearance")} className="flex min-h-14 w-full items-center gap-3 px-4 text-left">
            <Palette size={18} className="text-cv-primary" />
            <span className="flex-1 text-sm font-semibold text-cv-text">Appearance</span>
            <span className="mr-1 text-xs text-cv-text-muted capitalize">{theme}</span>
            <ChevronRight size={18} className={`text-cv-text-muted transition-transform ${section === "appearance" ? "rotate-90" : ""}`} />
          </button>
          {section === "appearance" && (
            <div className="space-y-4 bg-cv-surface-soft p-4">
              <div>
                <div className="mb-2 flex items-center gap-2"><Sun size={15} /><p className="text-xs font-bold uppercase tracking-[0.1em] text-cv-text-muted">Theme</p></div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CV_THEME_REGISTRY).map(([id, meta]) => (
                    <button key={id} type="button" onClick={() => changeTheme(id)} className={`rounded-cv-md border p-3 text-left ${theme === id ? "border-cv-primary bg-cv-primary-soft" : "border-cv-border bg-cv-surface"}`}>
                      <span className="text-sm font-bold text-cv-text">{meta.icon} {meta.label}</span>
                      <span className="mt-1 block text-[10px] text-cv-text-muted">{meta.description}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2"><SlidersHorizontal size={15} /><p className="text-xs font-bold uppercase tracking-[0.1em] text-cv-text-muted">Style</p></div>
                <div className="space-y-2">
                  {[
                    ["shape", "Corner shape", ["sharp", "compact", "soft", "rounded", "friendly"]],
                    ["depth", "Depth", ["flat", "subtle", "elevated", "floating"]],
                    ["density", "Density", ["compact", "comfortable", "spacious"]],
                    ["border", "Borders", ["none", "subtle", "standard", "strong"]],
                  ].map(([key, label, values]) => (
                    <div key={key}>
                      <p className="mb-1 text-[11px] font-semibold text-cv-text-secondary">{label}</p>
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {values.map((value) => <button key={value} type="button" onClick={() => changeAppearance(key, value)} className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[10px] font-bold capitalize ${appearance[key] === value ? "border-cv-primary bg-cv-primary-soft text-cv-primary" : "border-cv-border bg-cv-surface text-cv-text-secondary"}`}>{value}</button>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </MobileCard>
      </MobileSection>

      <MobileSection title="Account & security">
        <MobileCard className="divide-y divide-cv-divider p-0 overflow-hidden">
          <div className="flex min-h-14 items-center gap-3 px-4">
            <Shield size={18} className="text-cv-primary" />
            <div className="flex-1"><p className="text-sm font-semibold text-cv-text">Role & access</p><p className="text-xs text-cv-text-muted">{roleLabel}</p></div>
          </div>
          <button type="button" onClick={signOut} className="flex min-h-14 w-full items-center gap-3 px-4 text-left text-cv-danger">
            <LogOut size={18} /><span className="text-sm font-bold">Sign out</span>
          </button>
        </MobileCard>
      </MobileSection>
    </div>
  );
}
