import { useMobileOverlays } from "./MobileOverlayProvider.jsx";

export function useMobileSheetActions() {
  const overlays = useMobileOverlays();

  const openOptions = ({ title, options = [], value, onSelect, type = "picker", ...rest }) =>
    overlays[`open${type[0].toUpperCase()}${type.slice(1)}Sheet`]({
      title,
      ...rest,
      render: ({ close }) => (
        <div className="cv-mobile-option-list">
          {options.map((option) => {
            const item = typeof option === "string" ? { label: option, value: option } : option;
            const selected = String(item.value) === String(value);
            return (
              <button
                key={String(item.value)}
                type="button"
                className={`cv-mobile-option ${selected ? "is-selected" : ""}`}
                onClick={() => { onSelect?.(item.value, item); close(); }}
              >
                <span>{item.label}</span>
                {selected && <span className="cv-mobile-option-check" aria-label="Selected">✓</span>}
              </button>
            );
          })}
        </div>
      ),
    });

  return { ...overlays, openOptions };
}
