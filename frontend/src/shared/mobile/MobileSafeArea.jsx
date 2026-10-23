export default function MobileSafeArea({ children, top = false, bottom = false, className = "" }) {
  return (
    <div
      className={`${top ? "cv-mobile-safe-top" : ""} ${bottom ? "cv-mobile-safe-bottom" : ""} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
