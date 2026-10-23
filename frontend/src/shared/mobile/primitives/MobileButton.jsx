import { forwardRef } from "react";

const VARIANTS = {
  primary: "cv-mobile-button-primary",
  secondary: "cv-mobile-button-secondary",
  ghost: "cv-mobile-button-ghost",
  danger: "cv-mobile-button-danger",
};

const MobileButton = forwardRef(function MobileButton(
  { variant = "primary", size = "md", fullWidth = false, loading = false, disabled, children, className = "", type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`cv-mobile-button ${VARIANTS[variant] || VARIANTS.primary} cv-mobile-button-${size}${fullWidth ? " cv-mobile-button-full" : ""}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {loading ? <span className="cv-mobile-spinner" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
});

export default MobileButton;
