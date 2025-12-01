/**
 * Utility functions for the WEE5 application
 * 
 * This file contains commonly used utility functions,
 * including the class name concatenation helper.
 */

/**
 * Class name concatenation utility
 * 
 * Conditionally joins class names together, filtering out
 * falsy values and joining with spaces.
 * 
 * @param inputs - Class names or conditional class name objects
 * @returns A string of concatenated class names
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs
    .filter(Boolean)
    .join(' ');
}

/**
 * Format XP values with commas
 * 
 * @param xp - The XP value to format
 * @returns Formatted XP string (e.g., "12,450 XP")
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString() + ' XP';
}

/**
 * Format number values with commas
 * 
 * @param num - The number to format
 * @returns Formatted number string (e.g., "12,450")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format percentage with one decimal place
 * 
 * @param value - The value to format
 * @param total - The total for percentage calculation
 * @returns Formatted percentage string (e.g., "75.3%")
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return ((value / total) * 100).toFixed(1) + '%';
}

/**
 * Get a random number between min and max (inclusive)
 * 
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random number between min and max
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Debounce function to limit the rate at which a function is called
 * 
 * @param func - The function to debounce
 * @param wait - Time to wait in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit the rate at which a function is called
 * 
 * @param func - The function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>): void {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}