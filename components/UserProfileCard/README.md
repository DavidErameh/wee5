# Rank Card Component

The Rank Card displays user statistics and progress in the WEE5 gamification system. It's commonly used in leaderboards and user profiles.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `userId` | `string` | Yes | - | User ID to display |
| `experienceId` | `string` | Yes | - | Experience ID context |
| `xp` | `number` | Yes | - | User's current XP |
| `level` | `number` | Yes | - | User's current level |
| `totalPosts` | `number` | Yes | - | Total posts by user |
| `totalMessages` | `number` | Yes | - | Total messages by user |
| `totalReactions` | `number` | Yes | - | Total reactions by user |
| `displayName` | `string` | No | - | User's display name |
| `avatarUrl` | `string` | No | - | User's avatar URL |
| `className` | `string` | No | - | Additional CSS classes |

## Usage Examples

```tsx
// Basic usage
<RankCard 
  userId="user_123456" 
  experienceId="exp_789012" 
  xp={12450} 
  level={25} 
  totalPosts={450} 
  totalMessages={120} 
  totalReactions={50} 
/>

// With custom display name and avatar
<RankCard 
  userId="user_123456" 
  experienceId="exp_789012" 
  xp={8750} 
  level={18} 
  totalPosts={230} 
  totalMessages={85} 
  totalReactions={25} 
  displayName="JohnDoe" 
  avatarUrl="https://example.com/avatar.jpg" 
/>
```

## Features

- Dark-themed design with purple accents
- XP progress bar with gradient fill
- Hover animations with lift effect
- Stats grid for posts, messages, and reactions
- Responsive layout
- Proper user identification with avatar or placeholder

## Accessibility

- Proper semantic HTML structure
- Sufficient color contrast for accessibility compliance
- Hover and focus states for keyboard navigation
- Proper ARIA attributes where needed

## Design Tokens

This component uses the following design tokens:

- Colors: `bg-dark`, `border-border`, `text-white`, `text-text-muted`, `border-accent`
- Spacing: Consistent padding and margins
- Typography: Appropriate font sizes and weights
- Borders: `border` with accent color
- Animations: Hover effects with smooth transitions