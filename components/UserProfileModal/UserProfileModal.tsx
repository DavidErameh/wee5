import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { UserProfileCard, UserProfileCardProps } from '@/components/UserProfileCard/UserProfileCard';
import { Badge } from '@/components/Badge/Badge';
import { cn } from '@/lib/utils';
// import { calculateProgress } from '@/lib/xp-logic'; // No longer needed as UserProfileCard handles it

interface UserProfileModalProps extends UserProfileCardProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** User's streak */
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

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userId,
  displayName,
  avatarUrl,
  xp,
  level,
  totalPosts,
  totalMessages,
  totalReactions,
  // streak = 0, // Handled by UserProfileCard if needed, or removed if not displayed there
  badges = [],
  recentActivity = [],
  experienceId, // Passed through to UserProfileCard
}) => {
  // const progress = calculateProgress(xp, level); // No longer needed as UserProfileCard handles it

  // Handle escape key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[40]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 md:top-1/2 md:left-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:w-[600px] md:h-[700px] md:max-w-[90vw] md:max-h-[90vh] overflow-y-auto z-[modal] bg-black/80 backdrop-blur-2xl rounded-none md:rounded-2xl border-none md:border border-white/10 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-profile-modal-title"
            tabIndex={-1} // Make modal focusable programmatically
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors p-2 rounded-full hover:bg-border z-10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Close user profile modal"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* User Profile Card Content */}
            <UserProfileCard
              userId={userId}
              experienceId={experienceId}
              displayName={displayName}
              avatarUrl={avatarUrl}
              xp={xp}
              level={level}
              totalPosts={totalPosts}
              totalMessages={totalMessages}
              totalReactions={totalReactions}
              className="rounded-none border-none p-6" // Adjust styling as needed
            />

            {/* Additional Modal Content (e.g., Recent Activity, Badges) */}
            <div className="p-6 pt-0"> {/* pt-0 to prevent double padding with UserProfileCard */}
              {/* Recent Activity */}
              {recentActivity.length > 0 && (
                <div className="mb-8" aria-labelledby="recent-activity-title">
                  <h3 id="recent-activity-title" className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                  <div role="list" className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        role="listitem"
                        tabIndex={0} // Make activity item focusable
                        aria-label={`${activity.type} activity: ${activity.content} at ${activity.timestamp}`}
                        className="glass-panel glass-panel-hover p-3 flex items-start gap-3 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black cursor-pointer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="mt-1" aria-hidden="true">
                          {/* Icons can be added here based on activity type */}
                          {activity.type}
                        </div>
                        <div>
                          <p className="text-white text-sm">{activity.content}</p>
                          <p className="text-xs text-text-muted mt-1">{activity.timestamp}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements/Badges */}
              {badges.length > 0 && (
                <div aria-labelledby="achievements-title">
                  <h3 id="achievements-title" className="text-lg font-semibold text-white mb-4">Achievements</h3>
                  <div role="list" className="flex flex-wrap gap-3">
                    {badges.map((badge, index) => (
                      <motion.div
                        key={badge.id}
                        role="listitem"
                        tabIndex={0} // Make badge focusable
                        aria-label={`${badge.name} badge, ${badge.isLocked ? 'locked' : 'unlocked'}`}
                        className="focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black cursor-pointer"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge
                          type={badge.type}
                          size="medium"
                          name={badge.name}
                          isLocked={badge.isLocked}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

UserProfileModal.displayName = 'UserProfileModal';

export default UserProfileModal;