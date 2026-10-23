export function formatFeedbackStatus(status) {
  return String(status || "draft")
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function formatFeedbackDate(value) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return String(value);
  }
}

export function getFilterLabel(filter) {
  const labels = {
    all: "All Grievances",
    created: "New",
    viewed: "Viewed",
    assigned: "Assigned",
    accepted: "Accepted",
    investigating: "Investigating",
    resolved: "Resolved",
    verified: "Verified",
    escalated: "Escalated",
    closed: "Closed",
    attention: "Needs Attention",
  };
  return labels[filter] || "Grievances";
}

export function getRawStatusLabel(status) {
  const labels = {
    created: "New",
    viewed: "Viewed",
    assigned: "Assigned",
    accepted: "Accepted",
    investigating: "Investigating",
    resolved: "Resolved",
    verified: "Verified",
    escalated: "Escalated",
    closed: "Closed",
  };
  return labels[status] || status || "Unknown";
}

export function formatDateTime(value) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTimestamp(value) {
  if (!value) return 0;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function getDaysSince(value) {
  const timestamp = getTimestamp(value);
  if (!timestamp) return 0;

  return (Date.now() - timestamp) / (24 * 60 * 60 * 1000);
}

export function priorityWeight(priority) {
  const value = String(priority || "medium").toLowerCase();
  if (value === "high") return 3;
  if (value === "medium") return 2;
  return 1;
}

export function getDueTimestamp(issue) {
  if (!issue.assignedAt || !issue.expectedResolutionDays) return Infinity;

  return (
    getTimestamp(issue.assignedAt) +
    Number(issue.expectedResolutionDays) * 24 * 60 * 60 * 1000
  );
}

export function isIssueOverdue(issue) {
  if (["closed"].includes(issue.status)) return false;
  if (!issue.assignedAt || !issue.expectedResolutionDays) return false;

  const due = getDueTimestamp(issue);
  return due !== Infinity && Date.now() > due;
}

export function hasSLA(issue) {
  return Boolean(
    issue.assignedAt && issue.expectedResolutionDays
  );
}

export function getReportCount(reports) {
  if (Array.isArray(reports)) return reports.length;
  if (typeof reports === "number") return reports;
  return 0;
}

export function pendingCount(issues) {
  return issues.filter(issue => issue.status === "created").length;
}

export function capitalize(value) {
  if (!value) return "";

  return (
    String(value).charAt(0).toUpperCase() +
    String(value).slice(1)
  );
}

export function getAttentionReason(issue) {
  if (isIssueOverdue(issue)) return "SLA overdue";
  if (issue.status === "escalated") return "Escalated grievance";

  if (
    String(issue.priority || "").toLowerCase() === "high"
  ) {
    return "High priority";
  }

  if (issue.status === "assigned") {
    return "Awaiting employee action";
  }

  return "Unresolved for several days";
}