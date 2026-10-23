# CampusVoice — Phase 10.3 Mobile App Shell

Implemented on top of the Phase 10.4 source package.

## Architecture

MobileAppShell → MobileHeader → MainScrollArea → current page → MobileBottomNav → MobileCreateHub

## Included

- Dedicated `MainScrollArea` primitive.
- Dedicated `MobileSafeArea` primitive.
- Role-aware mobile navigation for student, faculty/employee, HOD, admin and super-admin.
- Five-slot bottom navigation with role-specific queue/task/overview destinations.
- Create action remains an action hub rather than a page.
- Create hub now supports Issue, Discussion and Feedback callbacks.
- Focused workflow mode can hide bottom navigation and switch header to back mode.
- Safe-area and scroll behavior preserved.
- Existing Phase 10.4 header/search callbacks preserved.

## Integration note

The current App renders the mobile shell for the student experience. Existing admin/employee routing remains unchanged; the role-aware shell is prepared for those surfaces as they are migrated in later mobile-admin phases.

## Verification

Source-level integration was checked. A production React build was not claimed because the supplied environment did not provide a verified working build pipeline.
