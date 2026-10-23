export default function MobileSection({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`cv-mobile-section${className ? ` ${className}` : ""}`}>
      {(title || subtitle || action) && (
        <div className="cv-mobile-section-header">
          <div className="min-w-0">
            {title ? <h2 className="cv-mobile-section-title">{title}</h2> : null}
            {subtitle ? <p className="cv-mobile-section-subtitle">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
