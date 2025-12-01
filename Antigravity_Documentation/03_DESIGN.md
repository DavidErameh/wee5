# Design System

WEE5 employs a modern, "dark mode first" aesthetic that aligns with gaming culture and the Whop platform's visual identity. The design prioritizes clarity, feedback, and a premium feel.

## Visual Identity

### Color Palette
The application uses a high-contrast dark theme with a signature purple accent.

- **Backgrounds**:
  - `black` (#000000): Main background.
  - `dark` (#111111): Secondary background (cards, panels).
  - `dark-hover` (#1a1a1a): Interactive element states.
  
- **Accents**:
  - `accent` (#6B46C1): Primary brand color (Purple).
  - `accent-light` (#9F7AEA): Lighter shade for hover states or highlights.
  - `glow`: `rgba(107, 70, 193, 0.25)` - Used for box shadows to create a neon/gaming effect.

- **Text**:
  - `text` (#FFFFFF): Primary text.
  - `text-muted` (#A1A1AA): Secondary/description text.

- **Status**:
  - `success` (#10B981): Green for positive actions (level up, rewards).
  - `warning` (#F59E0B): Orange for alerts.
  - `error` (#EF4444): Red for errors.

### Typography
- **Font Family**: `Inter` (Google Fonts) - Chosen for its high legibility and modern look.
- **Scale**:
  - `2xs` (8px) to `4xl` (36px) - A comprehensive scale for everything from tiny labels to major headings.

## UI Components

### Core Components
The UI is built using a mix of custom components and `frosted-ui`.

1. **RankCard**:
   - A visual representation of a user's status.
   - Displays: Avatar, Username, Level, Rank, XP Progress Bar.
   - Features: Real-time updates via Supabase subscriptions.

2. **Leaderboard**:
   - Tabular display of top users.
   - Supports filtering by All-time, Weekly, and Monthly.
   - Highlights the current user's position.

3. **XPProgressBar**:
   - Visual indicator of progress towards the next level.
   - Animated transitions for XP gains.

4. **LevelUpToast**:
   - A celebratory notification that appears when a user levels up.
   - Uses animations to draw attention.

5. **AnalyticsDashboard** (Premium):
   - Data visualization using Recharts.
   - Shows engagement trends over time.

### Layout
- **NavigationBar**: Persistent top navigation with community context and user summary.
- **Main Container**: Centered layout with a max-width of `1280px` for large screens.
- **Responsive Design**: Mobile-first approach using Tailwind's breakpoints.

## User Experience (UX)

### Real-Time Feedback
- The interface is designed to feel "alive".
- XP gains are reflected instantly.
- Leaderboard positions update dynamically.

### Micro-Interactions
- Hover effects on cards and buttons.
- Smooth transitions for progress bars.
- Loading skeletons for data fetching states.

### Accessibility
- Semantic HTML structure.
- High contrast text.
- Focus states for keyboard navigation.
