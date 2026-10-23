import { BarChart2, Building2, TrendingUp } from "lucide-react";
import {
  getRawStatusLabel,
  getReportCount,
  isIssueOverdue,
} from "../lib/adminPanelUtils.js";

export function StatsPanel({ issues, polls }) {
  const total = issues.length;
  const resolved = issues.filter(i =>
    ["resolved", "verified", "closed"].includes(i.status)
  ).length;
  const closed = issues.filter(i => i.status === "closed").length;
  const escalated = issues.filter(i => i.status === "escalated").length;
  const reported = issues.filter(i => getReportCount(i.reports) > 0).length;
  const overdue = issues.filter(isIssueOverdue).length;
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;
  const closureRate = total ? Math.round((closed / total) * 100) : 0;

  const categoryMap = issues.reduce((a, i) => {
    const key = i.category || "General";
    a[key] = (a[key] || 0) + 1;
    return a;
  }, {});

  const departmentMap = issues.reduce((a, i) => {
    const key = i.department || "Unassigned";
    a[key] = (a[key] || 0) + 1;
    return a;
  }, {});

  const statusMap = issues.reduce((a, i) => {
    const key = i.status || "unknown";
    a[key] = (a[key] || 0) + 1;
    return a;
  }, {});

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-cv-text">
          Institutional Analytics
        </h2>
        <p className="text-sm text-cv-text-muted mt-1">
          Overview of grievance workload, performance and campus issues.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard label="Total Grievances" value={total} color="blue" />
        <StatCard label="Resolution Rate" value={`${resolutionRate}%`} color="green" />
        <StatCard label="Closed" value={closed} color="purple" />
        <StatCard label="Escalated" value={escalated} color="orange" />
        <StatCard label="Overdue" value={overdue} color="red" />
        <StatCard label="Reported" value={reported} color="red" />
        <StatCard label="Closure Rate" value={`${closureRate}%`} color="green" />
        <StatCard label="Active Polls" value={polls.length} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnalyticsCard
          title="Grievances by Status"
          icon={<TrendingUp className="w-4 h-4" />}
        >
          <AnalyticsList data={statusMap} formatter={getRawStatusLabel} />
        </AnalyticsCard>

        <AnalyticsCard
          title="Grievances by Category"
          icon={<BarChart2 className="w-4 h-4" />}
        >
          <AnalyticsList data={categoryMap} />
        </AnalyticsCard>
      </div>

      <AnalyticsCard
        title="Department Workload"
        icon={<Building2 className="w-4 h-4" />}
      >
        <AnalyticsList data={departmentMap} />
      </AnalyticsCard>
    </div>
  );
}

export function AnalyticsCard({ title, icon, children }) {
  return (
    <div className="bg-cv-surface border border-cv-border rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-cv-text mb-5 flex items-center gap-2">
        <span className="text-cv-primary">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

export function AnalyticsList({ data, formatter }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  if (!entries.length) {
    return <p className="text-sm text-cv-text-subtle">No data available.</p>;
  }

  const max = entries[0][1];

  return (
    <div className="space-y-3">
      {entries.map(([label, count]) => {
        const percentage = max > 0 ? Math.round((count / max) * 100) : 0;

        return (
          <div key={label} className="flex items-center gap-3">
            <span className="w-28 text-xs text-cv-text-secondary font-medium truncate">
              {formatter ? formatter(label) : label}
            </span>

            <div className="flex-1 bg-cv-surface-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-cv-primary h-full rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <span className="text-xs text-cv-text-subtle w-8 text-right font-semibold">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function StatCard({ label, value, color }) {
  const colorMap = {
    amber: "bg-cv-warning-soft text-cv-warning border-cv-warning-border",
    green: "bg-cv-success-soft text-cv-success border-cv-success-border",
    red: "bg-cv-danger-soft text-cv-danger border-cv-danger-border",
    blue: "bg-cv-info-soft text-cv-info border-cv-info-border",
    orange: "bg-cv-warning-soft text-cv-warning border-cv-warning-border",
    purple: "bg-cv-primary/8 text-cv-primary border-cv-primary/15",
  };

  return (
    <div
      className={`rounded-2xl p-4 border ${
        colorMap[color] || "bg-cv-surface-soft text-cv-text-secondary border-cv-border"
      }`}
    >
      <p className="text-2xl sm:text-3xl font-bold leading-none mb-1">
        {value}
      </p>
      <p className="text-xs font-medium opacity-70">{label}</p>
    </div>
  );
}