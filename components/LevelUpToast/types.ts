export interface LevelUpToastProps {
  /** Whether toast is visible */
  isVisible: boolean;
  /** New level reached */
  level: number;
  /** Reward description */
  reward?: string;
  /** Callback when toast is dismissed */
  onDismiss: () => void;
  /** Auto-dismiss duration in ms */
  duration?: number;
  /** Play sound effect */
  playSound?: boolean;
}