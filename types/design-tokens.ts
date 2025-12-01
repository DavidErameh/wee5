/**
 * WEE5 Design System Tokens
 * 
 * This file contains TypeScript definitions for all design tokens
 * used in the WEE5 application to ensure consistency and type safety.
 */

// Color Tokens
export interface ColorTokens {
  // Core Palette
  black: '#000000';           // Primary background
  dark: '#111111';            // Cards, secondary surfaces
  border: '#2D2D2D';          // Borders, dividers
  accent: {                   // Primary purple
    DEFAULT: '#6B46C1';
    light: '#9F7AEA';         // Hover, gradients
  };
  text: {                     // Text colors
    DEFAULT: '#FFFFFF';       // Primary text
    muted: '#A1A1AA';         // Secondary text
  };
  success: '#10B981';         // XP gain, positive
  warning: '#F59E0B';         // Warnings
  error: '#EF4444';           // Errors, negative
}

// Spacing Scale
export interface SpacingTokens {
  // 4px/8px increments
  1: '4px';       // Tight gaps
  2: '8px';       // Icon padding
  3: '12px';      // Card padding (small)
  4: '16px';      // Default gap
  6: '24px';      // Section spacing
  8: '32px';      // Major sections
  12: '48px';     // Page sections
  18: '72px';     // Custom larger space
  22: '88px';     // Custom larger space
  26: '104px';    // Custom larger space
  30: '120px';    // Custom larger space
  34: '136px';    // Custom larger space
  38: '152px';    // Custom larger space
}

// Typography Scale
export interface TypographyTokens {
  // Font sizes
  xs: '12px';
  sm: '14px';
  base: '16px';
  lg: '20px';
  xl: '24px';
  '2xl': '30px';
  '3xl': '36px';
  '4xl': '48px';
  
  // Font weights
  normal: '400';
  medium: '500';
  semibold: '600';
  bold: '700';
  
  // Line heights
  tight: '1.2';
  snug: '1.3';
  normal: '1.4';
  relaxed: '1.5';
  loose: '1.6';
}

// Breakpoint Tokens
export interface BreakpointTokens {
  mobile: '640px';   // ≤640px
  tablet: '1024px';  // ≤1024px
  desktop: '1280px'; // ≥1280px
}

// Z-Index Tokens
export interface ZIndexTokens {
  base: 0;           // Normal content
  dropdown: 10;      // Dropdowns, popovers
  sticky: 20;        // Sticky headers
  modal: 30;         // Modal overlays
  toast: 40;         // Toast notifications
  tooltip: 50;       // Tooltips (highest)
}

// Animation Tokens
export interface AnimationTokens {
  // Durations (ms)
  fast: '150ms';
  normal: '200ms';
  slow: '300ms';
  slower: '400ms';
  
  // Easing functions
  easeIn: 'cubic-bezier(0.4, 0, 0.2, 1)';
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)';
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)';
  celebration: 'cubic-bezier(0.34, 1.56, 0.64, 1)'; // For level-up animations
}

// Layout Tokens
export interface LayoutTokens {
  maxWidth: '1280px'; // Max page width
  gutter: '16px';    // Grid gutter width
  columns: 12;       // Grid columns
}

// All Design Tokens Combined
export interface DesignTokens {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  breakpoints: BreakpointTokens;
  zIndex: ZIndexTokens;
  animation: AnimationTokens;
  layout: LayoutTokens;
}

// Export individual token interfaces
export {
  type ColorTokens as Colors,
  type SpacingTokens as Spacing,
  type TypographyTokens as Typography,
  type BreakpointTokens as Breakpoints,
  type ZIndexTokens as ZIndex,
  type AnimationTokens as Animation,
  type LayoutTokens as Layout,
};