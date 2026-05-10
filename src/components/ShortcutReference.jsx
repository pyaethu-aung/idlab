import { useEffect, useRef } from "react";
import { FocusTrap } from "focus-trap-react";
import PropTypes from "prop-types";

function ShortcutReference({ isOpen, shortcuts, onClose }) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (document.activeElement instanceof HTMLElement) {
        triggerRef.current = document.activeElement;
      }
      dialogRef.current?.focus();
    } else if (
      triggerRef.current instanceof HTMLElement &&
      document.body.contains(triggerRef.current)
    ) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <FocusTrap
      active={isOpen}
      focusTrapOptions={{
        allowOutsideClick: true,
        fallbackFocus: () => dialogRef.current,
      }}
    >
      <div className="modal-scrim">
        <div className="modal-backdrop" aria-hidden="true" onClick={onClose} />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
          className="modal"
          tabIndex={-1}
          ref={dialogRef}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              onClose();
            }
          }}
        >
          <div className="modal-head">
            <span className="mono modal-title">keyboard shortcuts</span>
            <button
              type="button"
              className="ghost-btn mono"
              onClick={onClose}
              aria-label="Close"
            >
              esc
            </button>
          </div>
          <div className="modal-body">
            {shortcuts.map((entry, i) => (
              <div className="modal-row" key={i}>
                <span className="modal-keys mono">
                  <kbd>{entry.combo}</kbd>
                </span>
                <span className="modal-desc">{entry.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}

ShortcutReference.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  shortcuts: PropTypes.arrayOf(
    PropTypes.shape({
      combo: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ShortcutReference;
