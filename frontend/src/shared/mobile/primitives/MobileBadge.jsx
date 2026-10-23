const TONES = {
  neutral: "cv-mobile-badge-neutral",
  primary: "cv-mobile-badge-primary",
  success: "cv-mobile-badge-success",
  warning: "cv-mobile-badge-warning",
  danger: "cv-mobile-badge-danger",
  info: "cv-mobile-badge-info",
};

export default function MobileBadge({ children, tone = "neutral", dot = false, className = "" }) {
  return (
    <span className={`cv-mobile-badge ${TONES[tone] || TONES.neutral}${className ? ` ${className}` : ""}`}>
      {dot ? <span className="cv-mobile-badge-dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
