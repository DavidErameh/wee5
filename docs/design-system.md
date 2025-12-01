# WEE5 Design System Documentation

This document provides an overview of the WEE5 design system, including design tokens, component usage, and implementation guidelines.

## Design Tokens

### Color System
- **Primary Background:** `#000000` (black)
- **Secondary Surfaces:** `#111111` (dark)
- **Borders:** `#2D2D2D` (border)
- **Primary Accent:** `#6B46C1` (accent)
- **Accent Light:** `#9F7AEA` (accent-light)
- **Primary Text:** `#FFFFFF` (text)
- **Secondary Text:** `#A1A1AA` (text-muted)
- **Success:** `#10B981`
- **Warning:** `#F59E0B`
- **Error:** `#EF4444`

### Typography
- **Font Family:** Inter
- **Sizes:** xs(12px), sm(14px), base(16px), lg(20px), xl(24px), 2xl(30px), 3xl(36px)
- **Weights:** normal(400), medium(500), semibold(600), bold(700)
- **Line Heights:** tight(1.2), snug(1.3), normal(1.4), relaxed(1.5), loose(1.6)

### Spacing
- Based on 4px/8px grid system
- Standard utilities: 1(4px), 2(8px), 3(12px), 4(16px), 6(24px), 8(32px), 12(48px)

### Animation Durations
- Fast: 150ms
- Normal: 200ms
- Slow: 300ms
- Slower: 400ms

## Components

### XP Progress Bar
A visual indicator showing a user's progress toward the next level.

- **Sizes:** small (h-6), medium (h-8), large (h-12)
- **Features:** Gradient fill, pulse animation on XP gain, near-level-up glow
- **Usage:** Display in user profiles, leaderboards, and progress tracking

### Level-Up Toast
Celebratory notification that appears when a user achieves a new level.

- **Features:** Slide-in animation, confetti burst, auto-dismiss, sound option
- **Positioning:** Bottom-right, stackable
- **Usage:** Trigger after XP awards result in level advancement

### Rank Card
Displays user statistics and progress in a card format.

- **Features:** XP progress bar, stats grid, hover animations, avatar display
- **Usage:** Leaderboards, user profiles, team member displays

### Leaderboard Table
Displays ranked users with sorting and filtering capabilities.

- **Features:** Real-time updates, filter tabs, skeleton loading, medal indicators
- **Usage:** Community leaderboards, competition tracking

### Badge System
Visual indicators for achievements and status.

- **Sizes:** tiny(4px), small(6px), medium(8px), large(12px)
- **Types:** beginner(🌱), active(⚡), expert(🔥), legend(👑), custom(⭐), locked(🔒)
- **Usage:** Achievement displays, user recognition, milestone tracking

## Accessibility

All components follow WCAG 2.1 AA guidelines:
- Proper color contrast ratios
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- Reduced motion support

## Responsive Design

- Mobile-first approach
- Responsive breakpoints: mobile(max:640px), tablet(max:1024px), desktop(min:1280px)
- Adapts layouts based on screen size
- Touch-friendly targets

## Animation Guidelines

- All animations should run at 60fps
- Use GPU-accelerated transforms
- Respect user's reduced motion preferences
- Provide meaningful feedback for interactions
- Celebratory animations for achievements