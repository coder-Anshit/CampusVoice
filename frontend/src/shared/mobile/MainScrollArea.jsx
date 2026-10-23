export default function MainScrollArea({ children, className = "", noPadding = false }) {
  return (
    <main
      id="cv-mobile-content"
      tabIndex="-1"
      aria-label="Main content"
      className={`cv-mobile-main cv-mobile-scroll ${noPadding ? "" : "py-4"} pb-[calc(5rem+env(safe-area-inset-bottom)+1rem)] ${className}`.trim()}
    >
      {children}
    </main>
  );
}
