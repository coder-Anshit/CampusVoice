import { cv, SANS } from "../../../shared/design-system/inline.js";
import { Search, Filter } from "lucide-react";

const inputStyle = {
  borderColor: cv.border,
  color: cv.text,
};

/* =========================================================
   SEARCH + FILTER + SORT
========================================================= */

export function SearchFilterBar({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  sortBy,
  onSortChange,
  priorityFilter,
  onPriorityChange,
  departmentFilter,
  onDepartmentChange,
  departments,
}) {
  return (
    <div className="bg-cv-surface border rounded-lg p-3" style={{ borderColor: cv.border }}>
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: cv.textMuted }}
          />
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search grievances, students, departments, categories…"
            className="w-full pl-9 pr-4 py-2.5 border rounded-md text-sm outline-none transition-shadow"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${cv.primarySoft}`)}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
        </div>

        <button
          onClick={onToggleFilters}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border text-sm font-medium transition-colors"
          style={
            showFilters
              ? { background: cv.primary, color: cv.textInverse, borderColor: cv.primary }
              : { background: cv.surfaceSoft, color: cv.textSecondary, borderColor: cv.border }
          }
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="border rounded-md px-3 py-2.5 text-sm bg-cv-surface outline-none"
          style={inputStyle}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="priority">Highest priority</option>
          <option value="due">Due soon</option>
        </select>
      </div>

      {showFilters && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t"
          style={{ borderColor: cv.border }}
        >
          <FilterSelect
            label="Priority"
            value={priorityFilter}
            onChange={onPriorityChange}
            options={[
              { value: "all", label: "All priorities" },
              { value: "high", label: "High" },
              { value: "medium", label: "Medium" },
              { value: "low", label: "Low" },
            ]}
          />

          <FilterSelect
            label="Department"
            value={departmentFilter}
            onChange={onDepartmentChange}
            options={[
              { value: "all", label: "All departments" },
              ...departments.map((d) => ({ value: d, label: d })),
            ]}
          />
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-[11px] font-medium mb-1.5" style={{ color: cv.textMuted }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md px-3 py-2.5 text-sm bg-cv-surface outline-none"
        style={inputStyle}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   CURRENT VIEW SUMMARY LINE
========================================================= */

export function ViewSummary({ filterLabel, count, hasActiveFilters, onClear }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h3 className="text-xs font-medium tracking-wide" style={{ color: cv.textMuted }}>
          {filterLabel}
        </h3>
        <p className="text-sm mt-1" style={{ color: cv.textSecondary }}>
          {count} grievance{count !== 1 ? "s" : ""}
        </p>
      </div>

      {hasActiveFilters && (
        <button onClick={onClear} className="text-xs font-medium hover:underline" style={{ color: cv.primary }}>
          Clear filters
        </button>
      )}
    </div>
  );
}