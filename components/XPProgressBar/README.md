# XP Progress Bar Component

The XP Progress Bar is a key component in the WEE5 gamification system that visually represents a user's progress toward their next level.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `current` | `number` | Yes | - | Current XP value |
| `max` | `number` | Yes | - | Maximum XP needed for next level |
| `size` | `'small' \| 'medium' \| 'large'` | No | `'medium'` | Size variant of the progress bar |
| `showLabel` | `boolean` | No | `true` | Whether to display XP numbers label |
| `triggerPulse` | `boolean` | No | `false` | Trigger pulse animation (on XP gain) |
| `className` | `string` | No | - | Additional CSS classes |

## Usage Examples

```tsx
// Basic usage
<XPProgressBar current={7500} max={10000} />

// With custom size
<XPProgressBar 
  current={12450} 
  max={15625} 
  size="large" 
  showLabel={true} 
/>

// With pulse animation on XP gain
<XPProgressBar 
  current={newXpValue} 
  max={maxXpForLevel} 
  triggerPulse={true} 
/>
```

## Accessibility

- Uses `role="progressbar"` for screen readers
- Includes appropriate ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`)
- Proper color contrast for accessibility compliance

## Design Tokens

This component uses the following design tokens:

- Colors: `bg-dark`, `bg-gradient-to-r from-accent to-accent-light`, `text-white`
- Sizing: Defined by size prop (`small` → `h-6`, `medium` → `h-8`, `large` → `h-12`)
- Shadows: `shadow-glow` (when near level-up)
- Animations: 400ms duration for fill animation, ease-out timing function