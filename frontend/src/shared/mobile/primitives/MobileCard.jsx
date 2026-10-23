export default function MobileCard({ children, as: Tag = "section", interactive = false, padding = "md", className = "", ...props }) {
  return (
    <Tag
      className={`cv-mobile-card cv-card cv-mobile-card-${padding}${interactive ? " cv-mobile-card-interactive" : ""}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
