export default function MobileRail({ children, className = "", ariaLabel }) {
  return (
    <div className={`cv-horizontal-rail cv-mobile-rail${className ? ` ${className}` : ""}`} aria-label={ariaLabel}>
      {children}
    </div>
  );
}
