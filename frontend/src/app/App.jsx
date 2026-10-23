import { lazy, Suspense, useState, useEffect, useCallback } from "react";

import { Toaster, toast } from "sonner";

import Header from "../shared/components/Header.jsx";
import CreateContentModal from "../shared/components/CreateContentModal.jsx";
import Navbar from "../shared/components/Navbar.jsx";
import Login from "../features/auth/pages/Login.jsx";
import AdminPanel from "../features/admin/pages/AdminPanel.jsx";
import IssueFeed from "../features/issues/components/IssueFeed.jsx";
import PostIssueModal from "../features/issues/components/PostIssueModal.jsx";
import CategoryFilter from "../shared/components/CategoryFilter.jsx";
import TrendingSection from "../shared/components/TrendingSection.jsx";
import AnalyticsPanel from "../shared/components/AnalyticsPanel.jsx";
import PollCard from "../features/community/components/PollCard.jsx";
import AnnouncementCard from "../features/community/components/AnnouncementCard.jsx";
import DiscussionCard from "../features/community/components/DiscussionCard.jsx";
import EmployeeDashboard from "../features/employee/pages/EmployeeDashboard.jsx";
import StudentDashboard from "../features/student/pages/StudentDashboard.jsx";
import StudentFeedbackDashboard from "../features/feedback/pages/StudentFeedbackDashboard.jsx";

import MobileAppShell from "../shared/mobile/MobileAppShell.jsx";
import MobilePerformanceFallback from "../shared/mobile/MobilePerformanceFallback.jsx";
import MobileFeatureErrorBoundary from "../shared/mobile/MobileFeatureErrorBoundary.jsx";

import { initializeTheme, initializeAppearance } from "../shared/design-system/index.js";

import {
  fetchIssues,
  addIssue,
  upvoteIssue,
  commentOnIssue,
  replyToComment,
  deleteIssue,
  reportIssue,
  verifyIssue,
  fetchMyIssues,
} from "../shared/services/issues.service.js";

import { fetchPolls } from "../shared/services/polls.service.js";
import { fetchAnnouncements } from "../shared/services/announcements.service.js";
import { fetchDiscussions } from "../shared/services/discussions.service.js";
import { fetchFeedbackForms } from "../shared/services/feedback.service.js";
import { fetchNotifications } from "../shared/services/notifications.service.js";

// Feature screens are lazy-loaded so the initial mobile shell
// does not download every feature bundle at once.
const MobileStudentHome = lazy(() =>
  import("../shared/mobile/MobileStudentHome.jsx")
);

const MobileStudentDashboard = lazy(() =>
  import("../shared/mobile/MobileStudentDashboard.jsx")
);

const MobileIssues = lazy(() =>
  import("../shared/mobile/MobileIssues.jsx")
);

const MobileIssueDetail = lazy(() =>
  import("../shared/mobile/MobileIssueDetail.jsx")
);

const MobilePolls = lazy(() =>
  import("../shared/mobile/MobilePolls.jsx")
);

const MobileDiscussions = lazy(() =>
  import("../shared/mobile/MobileDiscussions.jsx")
);

const MobileAnnouncements = lazy(() =>
  import("../shared/mobile/MobileAnnouncements.jsx")
);

const MobileFeedback = lazy(() =>
  import("../shared/mobile/MobileFeedback.jsx")
);

const MobileAdminFeedback = lazy(() =>
  import("../shared/mobile/MobileAdminFeedback.jsx")
);

const MobileNotifications = lazy(() =>
  import("../shared/mobile/MobileNotifications.jsx")
);

const MobileProfile = lazy(() =>
  import("../shared/mobile/MobileProfile.jsx")
);

const MobileAdminExperience = lazy(() =>
  import("../shared/mobile/MobileAdminExperience.jsx")
);

const MobileAdminUsers = lazy(() =>
  import("../shared/mobile/MobileAdminUsers.jsx")
);

const MobileEmployeeTasks = lazy(() =>
  import("../shared/mobile/MobileEmployeeTasks.jsx")
);

const POLL_INTERVAL = 10000;

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem("username"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [activeTab, setActiveTab] = useState(() => (localStorage.getItem("role") === "admin" ? "dashboard" : "dashboard"));
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [createModalMode, setCreateModalMode] = useState(null);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [issues, setIssues] = useState([]);
  const [polls, setPolls] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [feedbackForms, setFeedbackForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [myIssues, setMyIssues] = useState([]);
  const [myIssuesLoading, setMyIssuesLoading] = useState(false);
  const [mobileSelectedIssue, setMobileSelectedIssue] = useState(null);
  const [mobileDiscussionComposerOpen, setMobileDiscussionComposerOpen] = useState(false);
  const [mobileAdminFeedbackCreateOpen, setMobileAdminFeedbackCreateOpen] = useState(false);
  const [mobilePollCreateOpen, setMobilePollCreateOpen] = useState(false);
  const [mobileAnnouncementCreateOpen, setMobileAnnouncementCreateOpen] = useState(false);
  const [desktopDiscussionCreateOpen, setDesktopDiscussionCreateOpen] = useState(false);
  const [desktopPollCreateOpen, setDesktopPollCreateOpen] = useState(false);

  

  const isAdmin = role === "admin";
  const isEmployee = ["employee", "faculty", "hod"].includes(role);
  const voterId = user;

  useEffect(() => {
    initializeTheme();
    initializeAppearance();
  }, []);


  const loadMyIssues = useCallback(async () => {
    if (!user || role !== "student") {
      setMyIssues([]);
      return;
    }
    try {
      setMyIssuesLoading(true);
      const data = await fetchMyIssues();
      setMyIssues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load my issues:", error);
      setMyIssues([]);
    } finally {
      setMyIssuesLoading(false);
    }
  }, [user, role]);

  const loadIssues = useCallback(async () => {
    try {
      setIssues(await fetchIssues());
    } catch (error) {
      console.error("Failed to load issues:", error);
      toast.error("Unable to load issues");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPolls = useCallback(async () => {
    try {
      setPolls(await fetchPolls());
    } catch (error) {
      console.error("Failed to load polls:", error);
    }
  }, []);

  const loadAnnouncements = useCallback(async () => {
    try {
      setAnnouncements(await fetchAnnouncements());
    } catch (error) {
      console.error("Failed to load announcements:", error);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const data = await fetchNotifications(user);
      const list = Array.isArray(data) ? data : [];
      setUnreadNotifications(list.filter((notification) => !notification.read).length);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setUnreadNotifications(0);
    }
  }, [user]);

  const loadDiscussions = useCallback(async () => {
    try {
      setDiscussions(await fetchDiscussions());
    } catch (error) {
      console.error("Failed to load discussions:", error);
    }
  }, []);

  const loadFeedbackForms = useCallback(async () => {
    if (!isAdmin && !isEmployee) {
      setFeedbackForms([]);
      return;
    }
    try {
      const data = await fetchFeedbackForms();
      setFeedbackForms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load feedback forms:", error);
      setFeedbackForms([]);
    }
  }, [isAdmin, isEmployee]);
  const refreshMobileData = useCallback(async () => {
    const jobs = [loadIssues(), loadPolls(), loadAnnouncements(), loadDiscussions(), loadFeedbackForms()];
    if (user) jobs.push(loadMyIssues());
    await Promise.allSettled(jobs);
  }, [loadIssues, loadPolls, loadAnnouncements, loadDiscussions, loadFeedbackForms, loadMyIssues, user]);

  useEffect(() => {
    const openFeedback = () => setActiveTab("feedback");
    window.addEventListener("cv-mobile-open-feedback", openFeedback);
    return () => window.removeEventListener("cv-mobile-open-feedback", openFeedback);
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadIssues();
    if (role === "student") {
      loadMyIssues();
    } else {
      setMyIssues([]);
    }
    loadPolls();
    loadAnnouncements();
    loadDiscussions();
    loadFeedbackForms();
    loadNotifications();

    const interval = setInterval(loadIssues, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [
    user,
    role,
    loadIssues,
    loadMyIssues,
    loadPolls,
    loadAnnouncements,
    loadDiscussions,
    loadFeedbackForms,
    loadNotifications,
  ]);

  const handleAddIssue = async (issue) => {
    try {
      await addIssue(issue);
      await loadIssues();
      await loadMyIssues();
      toast.success("Grievance submitted successfully");
    } catch (error) {
      console.error("Failed to create issue:", error);
      throw error;
    }
  };

  const handleUpvote = async (id) => {
    try {
      await upvoteIssue(id, voterId);
      await loadIssues();
    } catch (error) {
      console.error("Upvote failed:", error);
    }
  };

  const handleComment = async (id, text) => {
    try {
      await commentOnIssue(id, text);
      await loadIssues();
    } catch (error) {
      console.error("Comment failed:", error);
      toast.error("Unable to add comment");
    }
  };

  const handleReply = async (id, commentId, text) => {
    try {
      await replyToComment(id, commentId, text);
      await loadIssues();
    } catch (error) {
      console.error("Reply failed:", error);
      toast.error("Unable to add reply");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteIssue(id);
      await loadIssues();
      toast.success("Issue deleted");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Unable to delete issue");
    }
  };

  const handleReport = async (id) => {
    try {
      await reportIssue(id);
      await loadIssues();
      toast.success("Issue reported");
    } catch (error) {
      console.error("Report failed:", error);
      toast.error("Unable to report issue");
    }
  };

  const refreshMobileSelectedIssue = async (id) => {
    try {
      const allData = await fetchIssues();
      const mineData = role === "student" ? await fetchMyIssues() : [];
      setIssues(Array.isArray(allData) ? allData : []);
      setMyIssues(Array.isArray(mineData) ? mineData : []);
      const all = [...(Array.isArray(allData) ? allData : []), ...(Array.isArray(mineData) ? mineData : [])];
      const fresh = all.find((item) => String(item?._id || item?.id) === String(id));
      if (fresh) setMobileSelectedIssue(fresh);
    } catch (error) {
      console.error("Failed to refresh selected mobile issue:", error);
    }
  };

  const handleVerify = async (id, action) => {
    try {
      await verifyIssue(id, action);
      await loadIssues();

      if (action === "close" || action === "verify" || action === "verified") {
        toast.success(action === "close" ? "Grievance closed successfully" : "Grievance verified successfully");
      } else {
        toast.warning("Grievance has been escalated");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error(
        error?.response?.data?.error || "Unable to update grievance"
      );
      throw error;
    }
  };

  const visibleIssues = issues
    .filter((issue) =>
      [
        "created",
        "viewed",
        "assigned",
        "accepted",
        "investigating",
        "resolved",
        "verified",
        "escalated",
        "closed",
      ].includes(String(issue.status || "").toLowerCase())
    )
    .filter((issue) => category === "All" || issue.category === category)
    .filter(
      (issue) =>
        !searchQuery ||
        (issue.text || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) =>
      sort === "most_voted"
        ? (b.votes || 0) - (a.votes || 0)
        : new Date(b.createdAt) - new Date(a.createdAt)
    );

  if (!user) {
    return (
      <Login
        onLogin={(username) => {
          setUser(username);
          setRole(localStorage.getItem("role"));
        }}
      />
    );
  }

  if (isAdmin) return (
    <>
      <div className="cv-mobile-only">
        <MobileAppShell
          username={user}
          role={role || "admin"}
          activeTab={activeTab}
          setActiveTab={(tab) => setActiveTab(tab)}
          unreadCount={0}
          showNotifications={false}
          backMode={activeTab !== "dashboard"}
          onPostClick={() => { setCreateModalMode(null); setPostModalOpen(true); }}
          onCreateDiscussion={() => setCreateModalMode("discussion")}
          onCreateFeedback={() => { setActiveTab("feedback"); setMobileAdminFeedbackCreateOpen(true); }}
          onCreatePoll={() => setCreateModalMode("poll")}
          onCreateAnnouncement={() => setCreateModalMode("announcement")}
          onRefresh={refreshMobileData}
        >
          {(activeTab === "dashboard" || activeTab === "queue" || activeTab === "polls" || activeTab === "stats" || activeTab === "community") && (
            <MobileAdminExperience
              issues={issues}
              polls={polls}
              announcements={announcements}
              discussions={discussions}
              feedbackForms={feedbackForms}
              loading={loading}
              role={role || "admin"}
              activeTab={activeTab}
              onRefresh={loadIssues}
              onPollsRefresh={loadPolls}
              mobilePollCreateOpen={mobilePollCreateOpen}
              onPollCreateConsumed={() => setMobilePollCreateOpen(false)}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === "announcements" && (
            <MobileAnnouncements
              announcements={announcements}
              loading={loading && announcements.length === 0}
              onRefresh={loadAnnouncements}
              adminMode
              initialCreateOpen={mobileAnnouncementCreateOpen}
              onCreateConsumed={() => setMobileAnnouncementCreateOpen(false)}
            />
          )}

          {activeTab === "discussions" && (
            <MobileDiscussions
              discussions={discussions}
              username={user}
              loading={loading && discussions.length === 0}
              onRefresh={loadDiscussions}
              initialComposerOpen={mobileDiscussionComposerOpen}
              onComposerClose={() => setMobileDiscussionComposerOpen(false)}
              adminMode
            />
          )}

          {activeTab === "feedback" && (
            <MobileAdminFeedback
              autoCreate={mobileAdminFeedbackCreateOpen}
              showCreateControls={false}
              onCreateConsumed={() => setMobileAdminFeedbackCreateOpen(false)}
              onBackToWorkspace={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "users" && (
            <MobileAdminUsers />
          )}

          {activeTab === "profile" && (
            <MobileProfile
              username={user}
              role={role || "admin"}
              issues={issues}
              polls={polls}
              discussions={discussions}
              onSignOut={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                localStorage.removeItem("role");
                window.location.reload();
              }}
            />
          )}
        </MobileAppShell>
      </div>
      <div className="cv-desktop-only">
        <AdminPanel onCreateClick={() => setCreateModalMode("menu")} />
      </div>
      <CreateContentModal
        privileged
        open={Boolean(createModalMode)}
        mode={createModalMode || "menu"}
        onClose={() => setCreateModalMode(null)}
        onSelect={(next) => {
          if (next === "issue") {
            setCreateModalMode(null);
            setPostModalOpen(true);
          } else if (next === "feedback") {
            setCreateModalMode("feedback");
          } else {
            setCreateModalMode(next);
          }
        }}
        onCreated={async (type) => {
          if (type === "poll") await loadPolls();
          if (type === "discussion") await loadDiscussions();
          if (type === "announcement") await loadAnnouncements();
        }}
      />
      <PostIssueModal open={postModalOpen} onClose={() => setPostModalOpen(false)} onAdd={handleAddIssue} onBack={() => { setPostModalOpen(false); setCreateModalMode("menu"); }} />
    </>
  );

  if (isEmployee) {
    return (
      <>
        <div className="cv-mobile-only">
          <MobileAppShell
            username={user}
            role={role || "employee"}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            unreadCount={unreadNotifications}
            showNotifications={false}
            backMode={activeTab !== "dashboard"}
            onPostClick={() => { setCreateModalMode(null); setPostModalOpen(true); }}
            onCreateDiscussion={() => setCreateModalMode("discussion")}
            onCreateFeedback={() => { setActiveTab("feedback"); setMobileAdminFeedbackCreateOpen(true); }}
            onCreatePoll={() => setCreateModalMode("poll")}
            onCreateAnnouncement={() => setCreateModalMode("announcement")}
            onRefresh={refreshMobileData}
          >
            {(activeTab === "dashboard" || activeTab === "queue" || activeTab === "polls" || activeTab === "stats" || activeTab === "community") && (
              <MobileAdminExperience
                issues={issues}
                polls={polls}
                announcements={announcements}
                discussions={discussions}
                feedbackForms={feedbackForms}
                loading={loading}
                role={role || "employee"}
                activeTab={activeTab}
                canManageUsers={false}
                onRefresh={loadIssues}
                onPollsRefresh={loadPolls}
                mobilePollCreateOpen={mobilePollCreateOpen}
                onPollCreateConsumed={() => setMobilePollCreateOpen(false)}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}
            {activeTab === "tasks" && <MobileEmployeeTasks />}
            {activeTab === "announcements" && <MobileAnnouncements announcements={announcements} loading={loading && announcements.length === 0} onRefresh={loadAnnouncements} adminMode initialCreateOpen={mobileAnnouncementCreateOpen} onCreateConsumed={() => setMobileAnnouncementCreateOpen(false)} />}
            {activeTab === "discussions" && <MobileDiscussions discussions={discussions} username={user} loading={loading && discussions.length === 0} onRefresh={loadDiscussions} initialComposerOpen={mobileDiscussionComposerOpen} onComposerClose={() => setMobileDiscussionComposerOpen(false)} adminMode />}
            {activeTab === "feedback" && <MobileAdminFeedback autoCreate={mobileAdminFeedbackCreateOpen} showCreateControls={false} onCreateConsumed={() => setMobileAdminFeedbackCreateOpen(false)} onBackToWorkspace={() => setActiveTab("dashboard")} />}
            {activeTab === "profile" && <MobileProfile username={user} role={role || "employee"} issues={issues} polls={polls} discussions={discussions} onSignOut={() => { localStorage.removeItem("token"); localStorage.removeItem("username"); localStorage.removeItem("role"); window.location.reload(); }} />}
          </MobileAppShell>
        </div>
        <div className="cv-desktop-only">
          <Toaster position="bottom-right" toastOptions={{ duration: 1800 }} />
          <EmployeeDashboard onCreateClick={() => setCreateModalMode("menu")} />
        </div>
        <CreateContentModal
          privileged
          open={Boolean(createModalMode)}
          mode={createModalMode || "menu"}
          onClose={() => setCreateModalMode(null)}
          onSelect={(next) => {
            if (next === "issue") {
              setCreateModalMode(null);
              setPostModalOpen(true);
            } else if (next === "feedback") {
              setCreateModalMode("feedback");
            } else {
              setCreateModalMode(next);
            }
          }}
          onCreated={async (type) => {
            if (type === "poll") await loadPolls();
            if (type === "discussion") await loadDiscussions();
          if (type === "announcement") await loadAnnouncements();
          }}
        />
        <PostIssueModal open={postModalOpen} onClose={() => setPostModalOpen(false)} onAdd={handleAddIssue} onBack={() => { setPostModalOpen(false); setCreateModalMode("menu"); }} />
      </>
    );
  }

  const isIssues = activeTab === "issues";

  const mobileContent = (
    <MobileFeatureErrorBoundary>
      <Suspense fallback={<MobilePerformanceFallback />}>
      <>
      {activeTab === "dashboard" && (
        <MobileStudentHome
          username={user}
          issues={visibleIssues}
          polls={polls}
          announcements={announcements}
          discussions={discussions}
          loading={loading}
          onOpenIssues={() => setActiveTab("issues")}
          onOpenPolls={() => setActiveTab("polls")}
          onOpenDiscussions={() => setActiveTab("discussions")}
          onOpenAnnouncements={() => setActiveTab("announcements")}
          onOpenFeedback={() => setActiveTab("feedback")}
          onOpenDashboard={() => setActiveTab("my-dashboard")}
        />
      )}

      {activeTab === "my-dashboard" && (
        <MobileStudentDashboard
          username={user}
          issues={myIssues}
          polls={polls}
          discussions={discussions}
          loading={myIssuesLoading}
          onOpenIssues={() => setActiveTab("issues")}
          onOpenPolls={() => setActiveTab("polls")}
          onOpenDiscussions={() => setActiveTab("discussions")}
        />
      )}

      {activeTab === "feedback" && (
        <>
          <div className="cv-mobile-only">
            <MobileFeedback />
          </div>
          <div className="cv-desktop-only">
            <StudentFeedbackDashboard />
          </div>
        </>
      )}

      {activeTab === "issues" && mobileSelectedIssue && (
        <MobileIssueDetail
          issue={mobileSelectedIssue}
          onBack={() => setMobileSelectedIssue(null)}
          voterId={voterId}
          onUpvote={async (id) => { await handleUpvote(id); await refreshMobileSelectedIssue(id); }}
          onComment={async (id, text) => { await handleComment(id, text); await refreshMobileSelectedIssue(id); }}
          onReport={async (id) => { await handleReport(id); await refreshMobileSelectedIssue(id); }}
          onVerify={async (id, action) => { await handleVerify(id, action); await refreshMobileSelectedIssue(id); }}
        />
      )}

      {activeTab === "issues" && !mobileSelectedIssue && (
        <MobileIssues
          issues={visibleIssues}
          myIssues={myIssues}
          loading={loading}
          myLoading={myIssuesLoading}
          onSelectIssue={setMobileSelectedIssue}
          voterId={voterId}
          onUpvote={handleUpvote}
          onReportIssue={() => setPostModalOpen(true)}
          onRefresh={async () => { await loadIssues(); await loadMyIssues(); }}
        />
      )}

      {activeTab === "issues" && (
        <div className="cv-desktop-only">
        {loading ? (
          <Spinner />
        ) : (
          <IssueFeed
            issues={visibleIssues}
            onUpvote={handleUpvote}
            voterId={voterId}
            onComment={handleComment}
            onReply={handleReply}
            onDelete={handleDelete}
            onReport={handleReport}
            onVerify={handleVerify}
            isAdmin={isAdmin}
          />
        )}
        </div>
      )}

      {activeTab === "polls" && (
        <>
          <div className="cv-mobile-only">
            <MobilePolls polls={polls} voterId={voterId} loading={loading && polls.length === 0} onRefresh={loadPolls} canCreate showCreateTrigger={false} initialCreateOpen={mobilePollCreateOpen} onCreateConsumed={() => setMobilePollCreateOpen(false)} />
          </div>
          <div className="cv-desktop-only space-y-3">
            {polls.length ? (
              polls.map((poll) => (
                <PollCard
                  key={poll._id}
                  poll={poll}
                  voterId={voterId}
                  refresh={loadPolls}
                />
              ))
            ) : (
              <WorkspaceEmptyState
                title="No polls yet"
                message="There are no active campus polls to participate in right now."
              />
            )}
          </div>
        </>
      )}

      {activeTab === "discussions" && (
        <>
          <div className="cv-mobile-only">
            <MobileDiscussions
              discussions={discussions}
              username={user}
              loading={loading && discussions.length === 0}
              onRefresh={loadDiscussions}
              initialComposerOpen={mobileDiscussionComposerOpen}
              onComposerClose={() => setMobileDiscussionComposerOpen(false)}
            />
          </div>
          <div className="cv-desktop-only space-y-3">
            {discussions.length ? (
              discussions.map((discussion) => (
                <DiscussionCard key={discussion._id} discussion={discussion} />
              ))
            ) : (
              <WorkspaceEmptyState
                title="No discussions yet"
                message="There are no campus discussions available right now."
              />
            )}
          </div>
        </>
      )}

      {activeTab === "announcements" && (
        <>
          <div className="cv-mobile-only">
            <MobileAnnouncements
              announcements={announcements}
              loading={loading && announcements.length === 0}
              onRefresh={loadAnnouncements}
            />
          </div>
          <div className="cv-desktop-only space-y-3">
            {announcements.length ? (
              announcements.map((announcement) => (
                <AnnouncementCard key={announcement._id} announcement={announcement} />
              ))
            ) : (
              <WorkspaceEmptyState
                title="No announcements"
                message="There are no institutional announcements available right now."
              />
            )}
          </div>
        </>
      )}

      {activeTab === "notifications" && (
        <MobileNotifications
          username={user}
          onNavigate={(tab) => setActiveTab(tab)}
          onUnreadCountChange={setUnreadNotifications}
        />
      )}

      {activeTab === "profile" && (
        <MobileProfile
          username={user}
          role={role || "student"}
          issues={issues}
          polls={polls}
          discussions={discussions}
          onOpenIssues={() => setActiveTab("issues")}
          onOpenPolls={() => setActiveTab("polls")}
          onOpenDiscussions={() => setActiveTab("discussions")}
          onSignOut={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("role");
            window.location.reload();
          }}
        />
      )}
      </>
      </Suspense>
    </MobileFeatureErrorBoundary>
  );

  return (
    <>
      <MobileAppShell
        username={user}
        role={role || "student"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={0}
        showNotifications={false}
        backMode={activeTab !== "dashboard" || Boolean(mobileSelectedIssue)}
        onBack={() => {
          if (mobileSelectedIssue) {
            setMobileSelectedIssue(null);
          } else {
            setActiveTab("dashboard");
          }
        }}
        onPostClick={() => setPostModalOpen(true)}
        onCreateDiscussion={() => setCreateModalMode("discussion")}
        onCreatePoll={() => setCreateModalMode("poll")}
        onRefresh={refreshMobileData}
      >
        {mobileContent}
      </MobileAppShell>

      <div className="cv-desktop-only min-h-screen bg-cv-bg text-cv-text">
      <Toaster
        position="bottom-right"
        toastOptions={{ duration: 1500 }}
      />

      <Header
        onPostClick={() => setCreateModalMode("menu")}
      />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-5 lg:px-6 py-4 sm:py-5 h-[calc(100vh-68px)] min-h-0">
        <div className="grid h-full min-h-0 gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">

          {/* CAMPUS PULSE */}
          <aside className="hidden lg:block min-h-0">
            <div className="sticky top-0 h-full overflow-hidden rounded-cv-lg border border-cv-border bg-cv-surface shadow-cv-md">
              <div className="px-4 py-4 border-b border-cv-divider">
                <RailHeading
                  eyebrow="Campus Pulse"
                  text="What's happening around campus"
                />
              </div>

              <div className="h-[calc(100%-73px)] overflow-y-auto scrollbar-hide px-3 py-3">
                <TrendingSection issues={visibleIssues} />

                <div className="my-4 border-t border-cv-divider" />

                <AnalyticsPanel issues={visibleIssues} />
              </div>
            </div>
          </aside>

          {/* MAIN WORKSPACE */}
          <section className="min-w-0 min-h-0 overflow-y-auto scrollbar-hide">

            {/* NAVIGATION */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <Navbar
                active={activeTab}
                setActive={setActiveTab}
              />

            </div>

            {/* MOBILE ISSUE FILTER */}
            {isIssues && (
              <div className="mb-4 lg:hidden">
                <div className="rounded-cv-md border border-cv-border bg-cv-surface p-3 shadow-cv-sm">
                  <RailHeading
                    eyebrow="Discover"
                    text="Filter campus issues"
                  />

                  <CategoryFilter
                    category={category}
                    setCategory={setCategory}
                    sort={sort}
                    setSort={setSort}
                  />
                </div>
              </div>
            )}

            {/* DASHBOARD */}
            {activeTab === "dashboard" && (
              <StudentDashboard username={user} />
            )}

            {/* FEEDBACK */}
            {activeTab === "feedback" && (
              <StudentFeedbackDashboard />
            )}

            {/* ISSUES */}
            {activeTab === "issues" &&
              (loading ? (
                <Spinner />
              ) : (
                <IssueFeed
                  issues={visibleIssues}
                  onUpvote={handleUpvote}
                  voterId={voterId}
                  onComment={handleComment}
                  onReply={handleReply}
                  onDelete={handleDelete}
                  onReport={handleReport}
                  onVerify={handleVerify}
                  isAdmin={isAdmin}
                />
              ))}

            {/* POLLS */}
            {activeTab === "polls" && (
              <div className="space-y-4">
                                {polls.length ? (
                  polls.map((poll) => (
                    <PollCard
                      key={poll._id}
                      poll={poll}
                      voterId={voterId}
                      refresh={loadPolls}
                    />
                  ))
                ) : (
                  <WorkspaceEmptyState
                    title="No polls yet"
                    message="There are no active campus polls to participate in right now."
                  />
                )}
              </div>
            )}

            {/* DISCUSSIONS */}
            {activeTab === "discussions" && (
              <div className="space-y-4">
                                {discussions.length ? (
                  discussions.map((discussion) => (
                    <DiscussionCard
                      key={discussion._id}
                      discussion={discussion}
                    />
                  ))
                ) : (
                  <WorkspaceEmptyState
                    title="No discussions yet"
                    message="There are no campus discussions available right now."
                  />
                )}
              </div>
            )}

            {/* ANNOUNCEMENTS */}
           {activeTab === "announcements" && (
              <div className="space-y-4">
                {announcements.length ? (
                  announcements.map((announcement) => (
                    <AnnouncementCard
                      key={announcement._id}
                      announcement={announcement}
                    />
                  ))
                ) : (
                  <WorkspaceEmptyState
                    title="No announcements"
                    message="There are no institutional announcements available right now."
                  />
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <PostIssueModal
        open={postModalOpen}
        onClose={() => setPostModalOpen(false)}
        onAdd={handleAddIssue}
        onBack={() => { setPostModalOpen(false); setCreateModalMode("menu"); }}
      />
      </div>

      <div className="cv-mobile-only">
        <PostIssueModal
          open={postModalOpen}
          onClose={() => setPostModalOpen(false)}
          onAdd={handleAddIssue}
          onBack={() => { setPostModalOpen(false); window.dispatchEvent(new CustomEvent("cv-mobile-open-create")); }}
        />
      </div>

      <CreateContentModal
        open={Boolean(createModalMode)}
        mode={createModalMode || "menu"}
        onClose={() => setCreateModalMode(null)}
        onSelect={(next) => {
          if (next === "issue") {
            setCreateModalMode(null);
            setPostModalOpen(true);
          } else {
            setCreateModalMode(next);
          }
        }}
        onCreated={async (type) => {
          if (type === "poll") await loadPolls();
          if (type === "discussion") await loadDiscussions();
        }}
      />
    </>
  );
}

function RailHeading({ eyebrow, text }) {
  return (
    <div className="px-2 pt-1 pb-2">
      <p className="text-[10px] uppercase tracking-[0.14em] font-bold text-cv-text-muted">
        {eyebrow}
      </p>
      <p className="text-[11px] text-cv-text-secondary mt-0.5">
        {text}
      </p>
    </div>
  );
}

function WorkspaceEmptyState({ title, message }) {
  return (
    <div className="min-h-[280px] rounded-cv-lg border border-cv-border bg-cv-surface flex items-center justify-center px-6 text-center shadow-cv-md">
      <div className="max-w-sm">
        <div className="mx-auto w-11 h-11 rounded-cv-md bg-cv-primary-soft text-cv-primary flex items-center justify-center text-lg font-bold">
          •
        </div>

        <h3 className="mt-3 text-sm font-bold text-cv-text">
          {title}
        </h3>

        <p className="mt-1.5 text-xs leading-relaxed text-cv-text-secondary">
          {message}
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="py-20 flex justify-center">
      <div className="w-8 h-8 border-4 border-cv-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}