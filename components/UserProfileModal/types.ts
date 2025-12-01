import { UserProfileCardProps } from '@/components/UserProfileCard/UserProfileCard';

export interface UserProfileModalProps extends UserProfileCardProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** User's streak (optional, if not part of UserProfileCardProps) */
  streak?: number;
  /** User's badges */
  badges?: Array<{
    id: string;
    type: 'beginner' | 'active' | 'expert' | 'legend' | 'custom';
    name: string;
    isLocked?: boolean;
  }>;
  /** Recent activity items */
  recentActivity?: Array<{
    id: string;
    type: 'post' | 'message' | 'reaction';
    content: string;
    timestamp: string;
  }>;
}