---
description: Create a shared component for use across multiple pages
argument-hint: [component-name] [category]
---

Create a shared component: **$1** in category **$2**

## Skill Reference

For detailed implementation guidance, see: @.claude/skills/shared-component-builder.md

## Categories (from Architecture Plan)

- `cards/` - ContentCard, WorldCard, SceneCard, AssetCard
- `lists/` - ContentListItem, AssetListItem, LeaderboardItem
- `modals/` - ContentModal, ShareModal, CreateModal, ConfirmModal
- `filters/` - SearchFilterBar, TagPill, TagFilter
- `badges/` - AchievementBadge, RankBadge, LicenseBadge
- `carousels/` - Carousel components

## Reference

- Architecture: @docs/UNIFIED-COMPONENT-ARCHITECTURE.md
- Design System: @CLAUDE.md

## Directory Structure

```
src/components/shared/
├── $2/
│   ├── $1.jsx
│   └── index.js
```

## Component Template

Create `src/components/shared/$2/$1.jsx`:

```jsx
import PropTypes from 'prop-types';
import { Card, Badge, Avatar } from '../../ui';
import { getAssetUrl } from '../../../services/directus';

const $1 = ({
  // Props based on category
  data,
  onClick,
  className,
}) => {
  return (
    <Card
      variant="default"
      hoverable
      className={className}
      onClick={onClick}
    >
      {/* Component content */}
    </Card>
  );
};

$1.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string.isRequired,
    // Define shape based on usage
  }).isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default $1;
```

## Requirements

1. **Use UI Components** - Import from `src/components/ui/`
2. **Design Tokens** - Follow @CLAUDE.md styling guidelines
3. **Props Validation** - Use PropTypes for all props
4. **Reusability** - Design for multiple use cases
5. **Asset URLs** - Use `getAssetUrl()` for Directus assets

## After Creation

1. Create/update `src/components/shared/$2/index.js`:
   ```javascript
   export { default as $1 } from './$1';
   ```

2. Update `src/components/shared/index.js` if exists

3. Run `npm run lint`
