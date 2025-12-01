# Level-Up Toast Component

The Level-Up Toast provides celebratory notifications when a user achieves a new level in the WEE5 gamification system.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isVisible` | `boolean` | Yes | - | Whether toast is visible |
| `level` | `number` | Yes | - | New level reached |
| `reward` | `string` | No | - | Reward description |
| `onDismiss` | `() => void` | Yes | - | Callback when toast is dismissed |
| `duration` | `number` | No | `3000` | Auto-dismiss duration in ms |
| `playSound` | `boolean` | No | `false` | Play sound effect |

## Usage Examples

```tsx
// Basic usage
<LevelUpToast 
  isVisible={showToast} 
  level={25} 
  onDismiss={() => setShowToast(false)} 
/>

// With reward and custom duration
<LevelUpToast 
  isVisible={showToast} 
  level={50} 
  reward="3 free days unlocked" 
  duration={5000}
  playSound={true}
  onDismiss={() => setShowToast(false)} 
/>
```

## Features

- Slide-in animation from right (300ms)
- Confetti burst effect on appear
- Auto-dismiss after specified duration
- Sound effect capability
- Proper positioning (bottom-right, stacked)
- Accessible with proper ARIA attributes

## Accessibility

- Uses `role="alert"` and `aria-live="polite"` for screen readers
- Proper dismiss functionality with keyboard support
- Sufficient color contrast for accessibility compliance

## Design Tokens

This component uses the following design tokens:

- Colors: Gradient `from-accent to-accent-light`, `text-white`
- Sizing: Fixed `w-[350px] h-[100px]`
- Shadows: `shadow-glow-lg`
- Z-index: `z-toast`
- Animations: Slide-in/out with custom easing functions