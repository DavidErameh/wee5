"use client";

import ErrorBoundary from '@/components/ErrorBoundary';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardRow } from './LeaderboardRow';
import { UserProfileModal } from '@/components/UserProfileModal/UserProfileModal';
import { useNotification } from '@/contexts/NotificationContext';
import { supabase } from '@/lib/db';
import { cn } from '@/lib/utils';
import { LeaderboardEntry } from './types';
import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';

interface LeaderboardTableProps {
  experienceId: string;
  initialFilter?: 'all-time' | 'week' | 'month';
  limit?: number;
  className?: string;
  currentUserId?: string;
}

// Fetch for infinite scrolling (page-based)
const fetchLeaderboardPage = async (experienceId: string, filter: string, page: number, pageSize: number = 50) => {
  const response = await fetch(
    `/api/leaderboard?experienceId=${experienceId}&filter=${filter}&page=${page}&pageSize=${pageSize}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to fetch leaderboard page');
  }

  const data = await response.json();
  return {
    users: data.users || [],
    nextPage: data.pagination.page < data.pagination.totalPages ? data.pagination.page + 1 : undefined,
    hasMore: data.pagination.page < data.pagination.totalPages,
    total: data.pagination.total
  };
};

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  experienceId,
  initialFilter = 'all-time',
  limit = 100, // Kept for backward compatibility
  className,
  currentUserId,
}) => {
  const [filter, setFilter] = useState(initialFilter);
  const { showNotification } = useNotification();
  const queryClient = useQueryClient();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Use infinite query for virtual/infinite scrolling
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['leaderboard-infinite', experienceId, filter],
    queryFn: ({ pageParam = 1 }) =>
      fetchLeaderboardPage(experienceId, filter, pageParam, 50),
    getNextPageParam: (lastPage) =>
      lastPage.nextPage,
    initialPageParam: 1,
  });

  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);

  // Handle scrolling to load more data
  useEffect(() => {
    if (!tableContainerRef.current || !hasNextPage || isFetchingNextPage) return;

    const container = tableContainerRef.current;
    const handleScroll = () => {
      // Load more when user scrolls near bottom
      const threshold = 100; // pixels from bottom
      const position = container.scrollHeight - container.scrollTop;
      const height = container.clientHeight;

      if (position <= height + threshold) {
        fetchNextPage();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    // Reset infinite query when filter changes
    queryClient.invalidateQueries({ queryKey: ['leaderboard-infinite', experienceId, filter] });
  }, [filter, experienceId, queryClient]);

  // Flatten pages for rendering
  const allUsers = data?.pages.flatMap(page => page.users) ?? [];

  if (isLoading && !allUsers.length) {
    return (
      <div className={cn('bg-dark rounded-lg overflow-hidden border border-border', className)}>
        {/* Skeleton Loader */}
        <div className="p-4 space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 h-[72px] bg-dark-hover rounded-lg animate-pulse">
              <div className="w-10 h-10 rounded-full bg-border"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-border rounded w-1/3"></div>
                <div className="h-3 bg-border rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-border rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn('bg-dark rounded-lg p-6 border border-border', className)}>
        <div className="text-center py-8 text-text-muted">
          <p className="text-lg">Could not load leaderboard.</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={tableContainerRef}
        className={cn('bg-dark rounded-lg border border-border overflow-y-auto max-h-[600px]', className)}
      >
        {/* Filter Tabs */}
        <div role="tablist" aria-label="Leaderboard Filter" className="border-b border-border p-3 flex justify-center sticky top-0 z-20 bg-dark">
          {(['all-time', 'week', 'month'] as const).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              aria-controls={`leaderboard-panel-${f}`}
              id={`tab-${f}`}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black active:scale-98',
                filter === f
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:bg-dark'
              )}
              tabIndex={filter === f ? 0 : -1} // Only active tab is in tab order
            >
              {f === 'all-time' ? 'All Time' : f === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        <table className="w-full text-sm text-left" role="grid" aria-label="Community Leaderboard">
          <thead className="sticky top-12 bg-dark bg-opacity-80 backdrop-blur-sm z-10">
            <tr>
              <th scope="col" className="px-4 py-3 text-center w-[60px]">Rank</th>
              <th scope="col" className="px-4 py-3">User</th>
              <th scope="col" className="px-4 py-3 text-right w-[120px]">XP</th>
              <th scope="col" className="px-4 py-3 text-right w-[100px]">Level</th>
              <th scope="col" className="px-4 py-3 text-right w-[80px]">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <AnimatePresence>
              {allUsers && allUsers.length > 0 ? (
                allUsers.map((entry, index) => (
                  <LeaderboardRow
                    key={`${entry.userId}-${index}`} // Include index to ensure key uniqueness across pages
                    rank={entry.rank}
                    avatarUrl={entry.avatar_url}
                    displayName={entry.display_name || 'Anonymous'}
                    level={entry.level}
                    xp={entry.xp}
                    streak={entry.streak} // Pass streak data
                    rowIndex={index}  // Added for zebra striping
                    isCurrentUser={entry.userId === currentUserId}
                    onSelect={() => setSelectedUser(entry)}
                    tabIndex={0} // Make row focusable
                    aria-label={`Rank ${entry.rank}: ${entry.display_name || 'Anonymous'}, Level ${entry.level}, ${entry.xp.toLocaleString()} XP, Streak ${entry.streak || 0}`}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-muted">
                    No users on the leaderboard yet.
                  </td>
                </tr>
              )}
            </AnimatePresence>

            {/* Loader for next page */}
            {isFetchingNextPage && (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-4 h-4 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-4 h-4 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-4 h-4 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          isOpen={selectedUser !== null}
          onClose={() => setSelectedUser(null)}
          userId={selectedUser.userId}
          experienceId={experienceId}
          displayName={selectedUser.display_name || 'Anonymous'}
          avatarUrl={selectedUser.avatar_url}
          xp={selectedUser.xp}
          level={selectedUser.level}
          totalPosts={selectedUser.total_posts}
          totalMessages={selectedUser.total_messages}
          totalReactions={selectedUser.total_reactions}
        // NOTE: streak, badges, and recentActivity are not available in the LeaderboardEntry type.
        // These would need to be fetched separately if they are to be displayed in the modal.
        />
      )}
    </>
  );
};

LeaderboardTable.displayName = 'LeaderboardTable';

const LeaderboardTableWithErrorBoundary = (props: LeaderboardTableProps) => (
  <ErrorBoundary>
    <LeaderboardTable {...props} />
  </ErrorBoundary>
);

export default LeaderboardTableWithErrorBoundary;
