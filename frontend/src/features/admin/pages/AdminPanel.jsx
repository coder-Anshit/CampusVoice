import { useState, useEffect, useCallback, useMemo } from "react";
import { toast, Toaster } from "sonner";
import client from "../../../shared/services/client.js";

import { fetchIssues, deleteIssue } from "../../../shared/services/issues.service.js";
import { fetchPolls, deletePoll } from "../../../shared/services/polls.service.js";
import { fetchAnnouncements, deleteAnnouncement } from "../../../shared/services/announcements.service.js";
import { fetchDiscussions, deleteDiscussion } from "../../../shared/services/discussions.service.js";
import { fetchFeedbackForms } from "../../../shared/services/feedback.service.js";

import WorkflowAssignmentModal from "../../workflow/components/WorkflowAssignmentModal.jsx";
import FeedbackFormBuilder from "../../feedback/components/FeedbackFormBuilder.jsx";

import { TopBar, TabNav } from "../components/AdminChrome.jsx";
import { QueueHeader, AttentionPanel } from "../components/AdminQueueHeader.jsx";
import { SearchFilterBar, ViewSummary } from "../components/AdminFilterBar.jsx";
import { ContentList } from "../components/AdminContentList.jsx";
import { IssueRow } from "../components/AdminIssueRows.jsx";
import WorkflowStageRail from "../components/WorkflowStageRail.jsx";
import { IssueDetailsModal } from "../components/AdminIssueDetails.jsx";
import { StatsPanel } from "../components/AdminAnalytics.jsx";
import { PollCreator } from "../components/AdminPollCreator.jsx";
import { EmptyState, EmptyContent, FeedbackAdminPanel } from "../components/AdminShared.jsx";
import UserManagement from "../components/AdminUserManagement.jsx";

import {
  getFilterLabel,
  getTimestamp,
  getDaysSince,
  priorityWeight,
  getDueTimestamp,
  isIssueOverdue,
  pendingCount,
} from "../lib/adminPanelUtils.js";

const WORKFLOW_STATUSES = [
  "created",
  "viewed",
  "assigned",
  "accepted",
  "investigating",
  "resolved",
  "verified",
  "closed",
  "escalated",
];



/* =========================================================
   ADMIN PANEL
========================================================= */

export default function AdminPanel({ role = "admin", onCreateClick } = {}) {
  const [issues, setIssues] = useState([]);
  const [polls, setPolls] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [discussions, setDiscussions] = useState([]);

  const [activeTab, setActiveTab] = useState("queue");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [issueFilter, setIssueFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const [loadingIssues, setLoadingIssues] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [attentionExpanded, setAttentionExpanded] = useState(false);
  const [expandedAttentionId, setExpandedAttentionId] = useState(null);

  const [feedbackForms, setFeedbackForms] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showFeedbackBuilder, setShowFeedbackBuilder] = useState(false);
  const [selectedFeedbackForm, setSelectedFeedbackForm] = useState(null);
  const [feedbackView, setFeedbackView] = useState("list");
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [employeeTasksLoading, setEmployeeTasksLoading] = useState(false);
  const [employeeTaskBusy, setEmployeeTaskBusy] = useState(null);
  const [employeeResolutionTask, setEmployeeResolutionTask] = useState(null);
  const [employeeResolutionNote, setEmployeeResolutionNote] = useState("");

  /* ---------------------------------------------------------
     DATA LOADING
  --------------------------------------------------------- */

  const loadEmployeeTasks = useCallback(async () => {
    if (role === "admin") return;
    try {
      setEmployeeTasksLoading(true);
      const response = await client.get("/tasks/my");
      setEmployeeTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load employee tasks:", error);
      toast.error(error?.response?.data?.error || "Unable to load assigned work.");
    } finally {
      setEmployeeTasksLoading(false);
    }
  }, [role]);

  const performEmployeeTaskAction = async (task, action) => {
    try {
      setEmployeeTaskBusy(`${task._id}-${action}`);
      await client.patch(`/tasks/${task._id}/${action === "investigate" ? "start" : action}`);
      await loadEmployeeTasks();
      toast.success("Workflow updated.");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Unable to update workflow.");
    } finally {
      setEmployeeTaskBusy(null);
    }
  };

  const resolveEmployeeTask = async () => {
    if (!employeeResolutionTask || !employeeResolutionNote.trim()) {
      toast.error("Add a resolution note first.");
      return;
    }
    try {
      setEmployeeTaskBusy(`${employeeResolutionTask._id}-resolve`);
      await client.patch(`/tasks/${employeeResolutionTask._id}/resolve`, { resolutionNote: employeeResolutionNote.trim() });
      setEmployeeResolutionTask(null);
      setEmployeeResolutionNote("");
      await loadEmployeeTasks();
      await loadIssues();
      toast.success("Issue resolved.");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Unable to resolve issue.");
    } finally {
      setEmployeeTaskBusy(null);
    }
  };

  const loadIssues = useCallback(async () => {
    try {
      setLoadingIssues(true);
      const data = await fetchIssues();
      setIssues(Array.isArray(data) ? [...data] : []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load issues:", error);
      toast.error(error?.response?.data?.error || "Failed to load grievances.");
    } finally {
      setLoadingIssues(false);
    }
  }, []);

  const loadPolls = useCallback(async () => {
    try {
      const data = await fetchPolls();
      setPolls(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load polls.");
    }
  }, []);

  const loadAnnouncements = useCallback(async () => {
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load announcements.");
    }
  }, []);

  const loadDiscussions = useCallback(async () => {
    try {
      const data = await fetchDiscussions();
      setDiscussions(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load discussions.");
    }
  }, []);

  const loadFeedbackForms = useCallback(async () => {
    try {
      setFeedbackLoading(true);
      const data = await fetchFeedbackForms();
      setFeedbackForms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load feedback forms:", error);
    } finally {
      setFeedbackLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIssues();
    loadPolls();
    loadAnnouncements();
    loadDiscussions();
    loadFeedbackForms();
    if (role !== "admin") loadEmployeeTasks();

    const interval = setInterval(loadIssues, 30000);
    return () => clearInterval(interval);
  }, [loadIssues, loadPolls, loadAnnouncements, loadDiscussions, loadFeedbackForms, role, loadEmployeeTasks]);

  useEffect(() => {
    const openFeedbackBuilder = () => {
      setSelectedFeedbackForm(null);
      setFeedbackView("list");
      setShowFeedbackBuilder(true);
    };
    window.addEventListener("cv-open-feedback-builder", openFeedbackBuilder);
    return () => window.removeEventListener("cv-open-feedback-builder", openFeedbackBuilder);
  }, []);

  /* ---------------------------------------------------------
     ISSUE ACTIONS
  --------------------------------------------------------- */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this grievance?\n\nThis action cannot be undone.")) return;
    try {
      await deleteIssue(id);
      await loadIssues();
      toast.success("Grievance deleted.");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Unable to delete grievance.");
    }
  };


  const handleDeleteAnnouncement = async (id) => {
    try {
      await deleteAnnouncement(id);
      await loadAnnouncements();
      toast.success("Announcement deleted.");
    } catch {
      toast.error("Unable to delete announcement.");
    }
  };

  const handleDeleteDiscussion = async (id) => {
    try {
      await deleteDiscussion(id);
      await loadDiscussions();
      toast.success("Discussion deleted.");
    } catch {
      toast.error("Unable to delete discussion.");
    }
  };

  const handleDeletePoll = async (id) => {
    try {
      await deletePoll(id);
      await loadPolls();
      toast.success("Poll deleted.");
    } catch {
      toast.error("Unable to delete poll.");
    }
  };

  const openDetails = (issue) => {
    setSelectedIssue(issue);
    setDetailsOpen(true);
  };

  const openWorkflow = (issue) => {
    setSelectedIssue(issue);
    setWorkflowOpen(true);
  };

  /* ---------------------------------------------------------
     STATUS GROUPS
  --------------------------------------------------------- */

  const statusGroups = useMemo(() => {
    const groups = { all: issues };
    for (const status of [
      "created",
      "viewed",
      "assigned",
      "accepted",
      "investigating",
      "resolved",
      "verified",
      "escalated",
      "closed",
    ]) {
      groups[status] = issues.filter((i) => i.status === status);
    }
    return groups;
  }, [issues]);

  /* ---------------------------------------------------------
     NEEDS ATTENTION
  --------------------------------------------------------- */

  const attentionIssues = useMemo(() => {
    return issues.filter((issue) => {
      const overdue = isIssueOverdue(issue);
      const highPriority = String(issue.priority || "").toLowerCase() === "high";
      const escalated = issue.status === "escalated";
      const assignedButWaiting = issue.status === "assigned" && getDaysSince(issue.assignedAt) >= 1;
      const unresolved = ["assigned", "accepted", "investigating"].includes(issue.status);
      const oldUnresolved = unresolved && getDaysSince(issue.updatedAt || issue.createdAt) >= 3;

      return overdue || escalated || highPriority || assignedButWaiting || oldUnresolved;
    });
  }, [issues]);

  /* ---------------------------------------------------------
     FILTER OPTIONS
  --------------------------------------------------------- */

  const departments = useMemo(() => {
    const values = issues.map((issue) => issue.department).filter(Boolean);
    return [...new Set(values)].sort();
  }, [issues]);

  /* ---------------------------------------------------------
     SEARCH + FILTER + SORT
  --------------------------------------------------------- */

  const visibleIssues = useMemo(() => {
    let result =
      issueFilter === "attention" ? [...attentionIssues] : [...(statusGroups[issueFilter] || [])];

    const query = searchTerm.trim().toLowerCase();
    if (query) {
      result = result.filter((issue) => {
        const user = issue.anonymous ? "anonymous" : issue.user || "";
        return [issue.title || "", issue.text || "", user, issue.department || "", issue.category || ""]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
    }

    if (priorityFilter !== "all") {
      result = result.filter((issue) => String(issue.priority || "medium").toLowerCase() === priorityFilter);
    }

    if (departmentFilter !== "all") {
      result = result.filter((issue) => issue.department === departmentFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "oldest") return getTimestamp(a.createdAt) - getTimestamp(b.createdAt);
      if (sortBy === "priority") return priorityWeight(b.priority) - priorityWeight(a.priority);
      if (sortBy === "due") return getDueTimestamp(a) - getDueTimestamp(b);
      return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
    });

    return result;
  }, [issues, issueFilter, attentionIssues, statusGroups, searchTerm, priorityFilter, departmentFilter, sortBy]);

  const hasActiveFilters = Boolean(searchTerm || priorityFilter !== "all" || departmentFilter !== "all");

  const clearFilters = () => {
    setSearchTerm("");
    setPriorityFilter("all");
    setDepartmentFilter("all");
  };

  /* ---------------------------------------------------------
     SUMMARY + TABS
  --------------------------------------------------------- */

  const overdueCount = issues.filter(isIssueOverdue).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.reload();
  };

  const TABS = [
    { key: "queue", label: "Issue Queue", count: pendingCount(issues) },
    { key: "polls", label: "Polls", count: polls.length },
    { key: "stats", label: "Analytics", count: null },
    { key: "announcements", label: "Announcements", count: announcements.length },
    { key: "discussions", label: "Discussions", count: discussions.length },
    { key: "feedback", label: "Feedback", count: null },
    ...(role !== "admin" ? [{ key: "tasks", label: "My Work", count: employeeTasks.filter((t) => !["completed"].includes(t.status)).length }] : []),
    ...(role === "admin" ? [{ key: "users", label: "Users", count: null }] : []),
  ];

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <div className="cv-admin-shell min-h-screen bg-cv-bg text-cv-text">
      <Toaster position="bottom-right" richColors />

      <TopBar
        role={role}
        lastUpdated={lastUpdated}
        loading={loadingIssues}
        onRefresh={loadIssues}
        onLogout={handleLogout}
        onCreate={onCreateClick}
      />

      <TabNav tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-5 sm:px-6 py-6">
        {/* ISSUE QUEUE */}
        {activeTab === "queue" && (
          <div className="space-y-5">
            <div
              className="cv-card bg-cv-surface border border-cv-border p-5 sm:p-6"
             
            >
              <QueueHeader totalIssues={issues.length} overdueCount={overdueCount} />
            </div>

            <AttentionPanel
              issues={attentionIssues}
              expanded={attentionExpanded}
              onToggle={() => setAttentionExpanded((v) => !v)}
              expandedIssueId={expandedAttentionId}
              onToggleIssue={(id) => setExpandedAttentionId((cur) => (cur === id ? null : id))}
              onView={openDetails}
              onManageWorkflow={openWorkflow}
            />

            <WorkflowStageRail
              activeKey={issueFilter}
              onChange={setIssueFilter}
              counts={{
                ...Object.fromEntries(
                  Object.entries(statusGroups).map(([key, value]) => [key, value.length])
                ),
                attention: attentionIssues.length,
              }}
            />

            <SearchFilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters((v) => !v)}
              sortBy={sortBy}
              onSortChange={setSortBy}
              priorityFilter={priorityFilter}
              onPriorityChange={setPriorityFilter}
              departmentFilter={departmentFilter}
              onDepartmentChange={setDepartmentFilter}
              departments={departments}
            />

            <ViewSummary
              filterLabel={getFilterLabel(issueFilter)}
              count={visibleIssues.length}
              hasActiveFilters={hasActiveFilters}
              onClear={clearFilters}
            />

            {visibleIssues.length === 0 ? (
              <EmptyState filter={issueFilter} />
            ) : (
              <div className="space-y-3">
                {visibleIssues.map((issue) => {
                  const id = issue._id ?? issue.id;
                  return (
                    <IssueRow
                      key={id}
                      issue={issue}
                      onDelete={issue.status !== "created" ? handleDelete : null}
                      onView={() => openDetails(issue)}
                      onWorkflow={role === "admin" && WORKFLOW_STATUSES.includes(issue.status) ? () => openWorkflow(issue) : null}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* POLLS */}
        {activeTab === "polls" && (
          <PollCreator polls={polls} onCreated={loadPolls} onDelete={role === "admin" ? handleDeletePoll : undefined} showCreator={false} />
        )}

        {/* ANALYTICS */}
        {activeTab === "stats" && <StatsPanel issues={issues} polls={polls} />}

        {/* ANNOUNCEMENTS */}
        {activeTab === "announcements" && (
          <div className="space-y-4">
            <ContentList
              items={announcements}
              emptyText="No announcements yet."
              EmptyContent={EmptyContent}
              onDelete={role === "admin" ? handleDeleteAnnouncement : undefined}
            />
          </div>
        )}

        {/* DISCUSSIONS */}
        {activeTab === "discussions" && (
          <div className="space-y-4">
            <ContentList
              items={discussions}
              emptyText="No discussions yet."
              EmptyContent={EmptyContent}
              onDelete={role === "admin" ? handleDeleteDiscussion : undefined}
            />
          </div>
        )}

        {/* EMPLOYEE WORK */}
        {activeTab === "tasks" && role !== "admin" && (
          <div className="space-y-5">
            <div className="cv-card bg-cv-surface border border-cv-border p-5 sm:p-6">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cv-primary">Operational workspace</p>
              <h2 className="mt-1 text-xl font-semibold text-cv-text">My assigned work</h2>
              <p className="mt-1 text-sm text-cv-text-muted">Accept, investigate and resolve issues assigned to you. Student verification remains the final satisfaction gate.</p>
            </div>
            {employeeTasksLoading ? <div className="cv-card bg-cv-surface border border-cv-border p-6 text-sm text-cv-text-muted">Loading assigned work…</div> : employeeTasks.length === 0 ? <div className="cv-card bg-cv-surface border border-cv-border p-6 text-sm text-cv-text-muted">No assigned work right now.</div> : employeeTasks.map((task) => {
              const status = String(task.status || "pending").toLowerCase();
              return (
                <div key={task._id} className="cv-card bg-cv-surface border border-cv-border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><p className="text-[10px] uppercase tracking-wider text-cv-text-subtle">{task.department || "Assigned issue"}</p><h3 className="mt-1 text-base font-semibold text-cv-text">{task.title || task.issueTitle || "Assigned grievance"}</h3><p className="mt-1 text-sm text-cv-text-secondary">{task.description || task.text || "Open the issue details from the workflow."}</p></div>
                    <span className="rounded-full border border-cv-border bg-cv-surface-soft px-3 py-1 text-xs font-semibold capitalize text-cv-text-secondary">{status}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {status === "pending" && <button type="button" disabled={employeeTaskBusy} onClick={() => performEmployeeTaskAction(task, "accept")} className="rounded-xl bg-cv-primary px-4 py-2 text-xs font-semibold text-white">Accept</button>}
                    {status === "accepted" && <button type="button" disabled={employeeTaskBusy} onClick={() => performEmployeeTaskAction(task, "investigate")} className="rounded-xl bg-cv-primary px-4 py-2 text-xs font-semibold text-white">Start investigation</button>}
                    {status === "investigating" && <button type="button" disabled={employeeTaskBusy} onClick={() => setEmployeeResolutionTask(task)} className="rounded-xl bg-cv-primary px-4 py-2 text-xs font-semibold text-white">Resolve issue</button>}
                  </div>
                </div>
              );
            })}
            {employeeResolutionTask && <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-3xl border border-cv-border bg-cv-surface p-5 shadow-2xl"><h3 className="text-lg font-semibold text-cv-text">Resolution note</h3><p className="mt-1 text-xs text-cv-text-muted">Explain what was done before marking this work complete.</p><textarea value={employeeResolutionNote} onChange={(e) => setEmployeeResolutionNote(e.target.value)} rows={5} className="mt-4 w-full rounded-2xl border border-cv-border bg-cv-bg p-3 text-sm outline-none" placeholder="Resolution details…"/><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => { setEmployeeResolutionTask(null); setEmployeeResolutionNote(""); }} className="rounded-xl border border-cv-border px-4 py-2 text-sm">Cancel</button><button type="button" disabled={Boolean(employeeTaskBusy)} onClick={resolveEmployeeTask} className="rounded-xl bg-cv-primary px-4 py-2 text-sm font-semibold text-white">Resolve</button></div></div></div>}
          </div>
        )}

        {/* USER MANAGEMENT */}
        {activeTab === "users" && role === "admin" && <UserManagement />}

        {/* FEEDBACK FORMS */}
        {activeTab === "feedback" && (
          <FeedbackAdminPanel
            feedbackForms={feedbackForms}
            loading={feedbackLoading}
            selectedForm={selectedFeedbackForm}
            view={feedbackView}
            onCreate={() => {
              setSelectedFeedbackForm(null);
              setFeedbackView("list");
              setShowFeedbackBuilder(true);
            }}
            onSelect={(form) => {
              setSelectedFeedbackForm(form);
              setFeedbackView("results");
            }}
            onBack={() => {
              setSelectedFeedbackForm(null);
              setFeedbackView("list");
              loadFeedbackForms();
            }}
            onRefresh={loadFeedbackForms}
            showCreateButton={false}
          />
        )}

        {showFeedbackBuilder && (
          <FeedbackFormBuilder
            onClose={() => setShowFeedbackBuilder(false)}
            onCreated={() => {
              setShowFeedbackBuilder(false);
              loadFeedbackForms();
            }}
          />
        )}
      </main>

      {role === "admin" && <WorkflowAssignmentModal
        issue={selectedIssue}
        open={workflowOpen}
        onClose={() => {
          setWorkflowOpen(false);
          setSelectedIssue(null);
          loadIssues();
        }}
      />}

      <IssueDetailsModal
        issue={selectedIssue}
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedIssue(null);
        }}
      />
    </div>
  );
}