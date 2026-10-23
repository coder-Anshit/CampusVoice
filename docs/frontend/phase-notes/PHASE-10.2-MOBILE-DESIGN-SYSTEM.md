# CampusVoice — Phase 10.2 Mobile Design System Integration

## Goal
Create reusable mobile UI primitives that inherit the existing CampusVoice theme and appearance engine instead of introducing a second visual system.

## Added primitives
- MobileButton
- MobileCard
- MobileSection
- MobileBadge
- MobileStatus
- MobileEmptyState
- MobileSkeleton
- MobileRail

## Token integration
Primitives use the existing `--cv-*` tokens for:
- color themes
- shape/radius
- depth/shadows
- density
- borders
- motion
- touch targets

## Import surface
```js
import { MobileButton, MobileCard, MobileSection } from "./components/mobile";
```

## Responsive rules
- Mobile: <= 767px
- Tablet: 768–1023px
- Desktop: >= 1024px
- Intentional horizontal rails are allowed; accidental page overflow is not.
