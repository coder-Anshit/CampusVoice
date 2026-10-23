# Phase 10.14 — Mobile Overlays & Interaction Layer

Implemented a unified mobile overlay foundation.

## Included
- MobileOverlayProvider + useMobileOverlays
- Bottom sheet
- Action sheet
- Filter sheet
- Sort sheet
- Picker sheet
- Confirm sheet
- Form sheet
- Info sheet
- Drawer
- Fullscreen overlay
- Backdrop dismissal
- Escape-to-close
- Focus management and lightweight focus trap
- Body scroll lock
- Safe-area aware footer/body
- Reduced-motion support
- Nested overlay stack support
- Reusable option-sheet helper

## Integration
MobileAppShell now wraps its mobile experience with MobileOverlayProvider. Existing desktop UI is unchanged.

## Usage
Use `useMobileOverlays()` inside the mobile tree:
- `openSheet`
- `openActionSheet`
- `openFilterSheet`
- `openSortSheet`
- `openPickerSheet`
- `openConfirmSheet`
- `openFormSheet`
- `openInfoSheet`
- `openDrawer`
- `openFullscreen`
- `close`
- `closeAll`

`useMobileSheetActions()` provides the same API plus `openOptions()` for common single-selection sheets.

## Verification
Source-level integration was performed. A production React build was not run because this extracted project does not contain `node_modules` / `react-scripts`.
