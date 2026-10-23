import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Eye,
  Flag,
  Hourglass,
  Search,
  UserCheck,
  Wrench,
} from "lucide-react";

const STAGES = [
  { key: "created", label: "New", icon: ClipboardList },
  { key: "viewed", label: "Viewed", icon: Eye },
  { key: "assigned", label: "Assigned", icon: UserCheck },
  { key: "accepted", label: "Accepted", icon: CheckCircle2 },
  { key: "investigating", label: "Investigating", icon: Search },
  { key: "resolved", label: "Resolved", icon: Wrench },
  { key: "verified", label: "Verified", icon: Eye },
  { key: "closed", label: "Closed", icon: CheckCircle2 },
];

const EXCEPTIONS = [
  { key: "escalated", label: "Escalated", icon: Flag },
  { key: "attention", label: "Attention", icon: AlertTriangle },
];

function Stage({ stage, count, active, onClick, first, last }) {
  const Icon = stage.icon;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`group relative flex min-w-[108px] flex-1 items-center gap-3 px-3 py-3 text-left transition-all duration-200 ${
        first ? "rounded-l-2xl" : ""
      } ${last ? "rounded-r-2xl" : ""} ${
        active
          ? "bg-cv-text text-cv-surface shadow-sm"
          : "bg-transparent text-cv-text-secondary hover:bg-cv-surface-soft hover:text-cv-text"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors ${
          active
            ? "border-white/15 bg-white/10 text-white"
            : "border-cv-border bg-cv-surface text-cv-text-muted group-hover:border-cv-primary-border group-hover:text-cv-primary"
        }`}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </span>

      <span className="min-w-0">
        <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.08em]">
          {stage.label}
        </span>
        <span
          className={`mt-0.5 block text-sm font-semibold tabular-nums ${
            active ? "text-white" : "text-cv-text"
          }`}
        >
          {count}
        </span>
      </span>

      {!last && (
        <span
          aria-hidden="true"
          className={`absolute right-0 top-1/2 h-8 w-px -translate-y-1/2 ${
            active ? "bg-white/10" : "bg-cv-border"
          }`}
        />
      )}
    </button>
  );
}

export default function WorkflowStageRail({
  activeKey,
  onChange,
  counts,
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-cv-border bg-cv-surface shadow-cv-sm">
      <div className="flex flex-col gap-4 border-b border-cv-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cv-primary">
            Workflow command center
          </p>
          <h2 className="mt-1 text-sm font-semibold tracking-tight text-cv-text">
            Move from intake to resolution
          </h2>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-medium text-cv-text-muted">
          <Hourglass className="h-3.5 w-3.5" />
          <span>{counts.all || 0} total records</span>
        </div>
      </div>

      <div className="overflow-x-auto px-3 py-3 sm:px-4">
        <div className="flex min-w-[900px] overflow-hidden rounded-2xl border border-cv-border bg-cv-surface-soft">
          {STAGES.map((stage, index) => (
            <Stage
              key={stage.key}
              stage={stage}
              count={counts[stage.key] || 0}
              active={activeKey === stage.key}
              onClick={() => onChange(stage.key)}
              first={index === 0}
              last={false}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-cv-border bg-cv-surface-soft/60 px-4 py-3 sm:px-6">
        <span className="mr-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-cv-text-subtle">
          Exceptions
        </span>
        {EXCEPTIONS.map((stage) => {
          const Icon = stage.icon;
          const active = activeKey === stage.key;
          return (
            <button
              key={stage.key}
              type="button"
              onClick={() => onChange(stage.key)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-semibold transition-all ${
                active
                  ? "border-cv-danger bg-cv-danger-soft text-cv-danger"
                  : "border-cv-border bg-cv-surface text-cv-text-secondary hover:border-cv-danger-border hover:text-cv-danger"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {stage.label}
              <span className="tabular-nums">{counts[stage.key] || 0}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onChange("all")}
          className={`ml-auto rounded-xl border px-3 py-2 text-[10px] font-semibold transition-all ${
            activeKey === "all"
              ? "border-cv-primary bg-cv-primary text-white"
              : "border-cv-border bg-cv-surface text-cv-text-secondary hover:border-cv-primary-border hover:text-cv-primary"
          }`}
        >
          View all
        </button>
      </div>
    </section>
  );
}
