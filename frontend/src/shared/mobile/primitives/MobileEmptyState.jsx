export default function MobileEmptyState({ icon, title, description, action, className = "" }) {
  return (
    <div className={`cv-mobile-empty-state${className ? ` ${className}` : ""}`} role="status">
      {icon ? <div className="cv-mobile-empty-icon" aria-hidden="true">{icon}</div> : null}
      <h3 className="cv-mobile-empty-title">{title}</h3>
      {description ? <p className="cv-mobile-empty-description">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
