import { Trash2 } from "lucide-react";
import { cv, SANS } from "../../../shared/design-system/inline.js";

/* =========================================================
   CONTENT CARD — used for both announcements and discussions
========================================================= */

export function ContentCard({ title, details, onDelete }) {
  return (
    <div className="bg-cv-surface border rounded-lg p-5" style={{ borderColor: cv.border }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium" style={{ ...SANS, color: cv.text }}>
            {title}
          </h3>
          <p className="text-sm mt-1.5 leading-relaxed" style={{ color: cv.textSecondary }}>
            {details}
          </p>
        </div>

        <button
          onClick={onDelete}
          className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors"
          style={{ color: cv.danger, borderColor: cv.dangerSoft, background: "transparent" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = cv.dangerSoft)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </div>
  );
}

export function ContentList({ items, emptyText, EmptyContent, renderKey, onDelete }) {
  if (items.length === 0) {
    return <EmptyContent text={emptyText} />;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const id = item._id ?? item.id;
        return (
          <ContentCard
            key={renderKey ? renderKey(item) : id}
            title={item.title}
            details={item.details}
            onDelete={() => onDelete(id)}
          />
        );
      })}
    </div>
  );
}