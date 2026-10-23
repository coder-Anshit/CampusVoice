export default function MobileSkeleton({ variant = "card", className = "" }) {
  return <div aria-hidden="true" className={`cv-mobile-skeleton cv-mobile-skeleton-${variant}${className ? ` ${className}` : ""}`} />;
}
