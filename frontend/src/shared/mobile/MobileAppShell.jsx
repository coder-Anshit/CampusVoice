import { useEffect, useMemo, useState } from "react";
import MobileHeader from "./MobileHeader.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import MobileCreateHub from "./MobileCreateHub.jsx";
import MainScrollArea from "./MainScrollArea.jsx";
import MobileSafeArea from "./MobileSafeArea.jsx";
import MobileAccessibility from "./MobileAccessibility.jsx";
import MobileConnectivityBanner from "./MobileConnectivityBanner.jsx";
import { MobileOverlayProvider } from "./overlays/index.js";
import MobilePullToRefresh from "./gestures/MobilePullToRefresh.jsx";
import { useMobileBackNavigation } from "./gestures/useMobileBackNavigation.js";

const TITLES = {
  dashboard: "Home",
  "my-dashboard": "My Dashboard",
  issues: "Issues",
  polls: "Polls",
  discussions: "Discussions",
  announcements: "Announcements",
  feedback: "Feedback",
  notifications: "Alerts",
  profile: "Profile",
  tasks: "Tasks",
  queue: "Queue",
  overview: "Overview",
  operations: "Operations",
  users: "Users",
};

export default function MobileAppShell({
  username,
  role = "student",
  activeTab,
  setActiveTab,
  unreadCount = 0,
  children,
  onPostClick,
  onCreateDiscussion,
  onCreateFeedback,
  onCreatePoll,
  onCreateAnnouncement,
  focusedWorkflow = false,
  backMode = false,
  hideHeader = false,
  title,
  onRefresh,
  showNotifications = true,
  onBack,
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const normalizedRole = String(role || "student").toLowerCase();

  useEffect(() => {
    if (activeTab === "create") {
      setCreateOpen(true);
      setActiveTab("dashboard");
    }
  }, [activeTab, setActiveTab]);

  useEffect(() => {
    if (focusedWorkflow) setCreateOpen(false);
  }, [focusedWorkflow]);

  useEffect(() => {
    const reopenCreate = () => setCreateOpen(true);
    window.addEventListener("cv-mobile-open-create", reopenCreate);
    return () => window.removeEventListener("cv-mobile-open-create", reopenCreate);
  }, []);



  useMobileBackNavigation({
    enabled: !focusedWorkflow,
    canGoBack: true,
    onBack: () => setActiveTab("dashboard"),
  });

  const pageTitle = useMemo(() => {
    if (!title && normalizedRole === "admin" && activeTab === "dashboard") return "Workspace";
    return title || TITLES[activeTab] || "CampusVoice";
  }, [activeTab, normalizedRole, title]);

  const handleCreateIssue = () => {
    setCreateOpen(false);
    onPostClick?.();
  };

  const handleCreateDiscussion = () => {
    setCreateOpen(false);
    if (onCreateDiscussion) onCreateDiscussion();
    else setActiveTab("discussions");
  };

  const handleCreateFeedback = () => {
    setCreateOpen(false);
    if (onCreateFeedback) onCreateFeedback();
    else setActiveTab("feedback");
  };

  const handleCreatePoll = () => {
    setCreateOpen(false);
    onCreatePoll?.();
  };

  const handleCreateAnnouncement = () => {
    setCreateOpen(false);
    onCreateAnnouncement?.();
  };

  return (
    <MobileOverlayProvider>
      <div className="cv-mobile-only cv-mobile-page min-h-screen bg-cv-bg text-cv-text">
        <MobileAccessibility />
        <MobileConnectivityBanner />

        {!hideHeader && (
          <MobileHeader
            username={username}
            role={normalizedRole}
            activeTab={activeTab}
            unreadCount={unreadCount}
            showNotifications={showNotifications}
            onNotifications={() => setActiveTab("notifications")}
            onProfile={() => setActiveTab("profile")}
            onCreate={() => setCreateOpen(true)}
            backMode={backMode || focusedWorkflow}
            onBack={onBack || (() => setActiveTab("dashboard"))}
          />
        )}

        <MobilePullToRefresh
          onRefresh={async () => {
            if (onRefresh) await onRefresh();
            else window.dispatchEvent(new CustomEvent("cv-mobile-refresh"));
          }}
          disabled={focusedWorkflow}
        >
          <MainScrollArea className={focusedWorkflow ? "pb-6" : ""}>
            {children}
          </MainScrollArea>
        </MobilePullToRefresh>

        {!focusedWorkflow && (
          <MobileSafeArea bottom>
            <MobileBottomNav
              role={normalizedRole}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              unreadCount={unreadCount}
            />
          </MobileSafeArea>
        )}

        {!focusedWorkflow && (
          <MobileCreateHub
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            role={normalizedRole}
            onCreateIssue={handleCreateIssue}
            onCreateDiscussion={handleCreateDiscussion}
            onCreateFeedback={handleCreateFeedback}
            onCreatePoll={handleCreatePoll}
            onCreateAnnouncement={handleCreateAnnouncement}
          />
        )}
      </div>
    </MobileOverlayProvider>
  );
}
