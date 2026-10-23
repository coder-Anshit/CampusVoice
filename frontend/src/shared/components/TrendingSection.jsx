import { TrendingUp, ArrowUp } from "lucide-react";

const CATEGORY_STYLES = {
  General: ["bg-cv-category-purple-soft text-cv-category-purple", "bg-cv-category-purple"],
  Hostel: ["bg-cv-category-green-soft text-cv-category-green", "bg-cv-category-green"],
  Academics: ["bg-cv-category-blue-soft text-cv-category-blue", "bg-cv-category-blue"],
  Faculty: ["bg-cv-category-pink-soft text-cv-category-pink", "bg-cv-category-pink"],
  Food: ["bg-cv-category-amber-soft text-cv-category-amber", "bg-cv-category-amber"],
};

const RANK_STYLES = [
  "bg-cv-warning-soft text-cv-warning border-cv-warning/20",
  "bg-cv-surface-muted text-cv-text-muted border-cv-border",
  "bg-cv-surface-muted text-cv-text-secondary border-cv-border",
];

export default function TrendingSection({ issues = [] }) {
  const topIssues = [...issues]
    .sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0))
    .slice(0, 3);

  return (
    <section className="mb-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cv-primary-soft cv-primary">
            <TrendingUp className="h-4 w-4" strokeWidth={1.8} />
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] cv-text">
              Trending
            </h3>
            <p className="mt-0.5 text-[10px] font-medium cv-text-muted">
              Most supported issues
            </p>
          </div>
        </div>

        <span className="rounded-full bg-cv-primary-soft px-2.5 py-1 text-[9px] font-semibold text-cv-text-secondary">
          Top 3
        </span>
      </div>

      {topIssues.length === 0 ? (
        <div className="rounded-xl border border-dashed cv-border bg-cv-surface-soft px-3 py-6 text-center">
          <p className="text-[10px] font-medium cv-text-muted">
            No issues yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {topIssues.map((issue, index) => {
            const [categoryStyle, dot] = CATEGORY_STYLES[issue.category] || ["bg-cv-surface-muted text-cv-text-secondary", "bg-cv-text-muted"];

            return (
              <article
                key={issue.id || issue._id || index}
                className="group relative overflow-hidden rounded-cv-md border cv-border cv-surface px-3 py-3.5 transition-all duration-200 hover:-translate-y-px hover:border-cv-primary-border hover:shadow-cv-md"
              >
                <div
                  className={`absolute inset-y-0 left-0 w-[2px] ${
                    index === 0
                      ? "bg-cv-warning"
                      : index === 1
                      ? "bg-cv-border-strong"
                      : "bg-cv-border-strong"
                  }`}
                />

                <div className="flex gap-2.5">
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${RANK_STYLES[index]}`}
                  >
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-semibold ${categoryStyle}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                        {issue.category || "General"}
                      </span>

                      {index === 0 && (
                        <span className="flex items-center gap-0.5 text-[9px] font-semibold text-cv-warning">
                          <ArrowUp className="h-2.5 w-2.5" strokeWidth={2.2} />
                          Rising
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-[11px] font-semibold leading-[1.5] cv-text transition-colors group-hover:cv-text">
                      {issue.title || issue.text || "Untitled issue"}
                    </p>

                    <div className="mt-2.5 flex items-center gap-1.5">
                      <div className="flex h-5 min-w-5 items-center justify-center rounded-md bg-cv-surface-muted px-1">
                        <ArrowUp
                          className="h-2.5 w-2.5 cv-text-muted"
                          strokeWidth={2.1}
                        />
                      </div>

                      <span className="text-[10px] font-bold cv-text-secondary">
                        {issue.votes ?? 0}
                      </span>

                      <span className="text-[9px] font-medium cv-text-muted">
                        people supported this
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}