"use client";

import ErrorBoundary from '@/components/ErrorBoundary';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardRow } from './LeaderboardRow';
import { UserProfileModal } from '@/components/UserProfileModal/UserProfileModal';
import { useNotification } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';
import { LeaderboardEntry } from './types';
import { useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';

interface LeaderboardTableProps {
  experienceId: string;
  initialFilter?: 'all-time' | 'week' | 'month';
  limit?: number;
  className?: string;
  currentUserId?: string;
}

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
  className,
  currentUserId,
}) => {
  const [filter, setFilter] = useState(initialFilter);
  const queryClient = useQueryClient();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);

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
    queryFn: ({ pageParam = 1 }) => fetchLeaderboardPage(experienceId, filter, pageParam, 50),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  useEffect(() => {
    if (!tableContainerRef.current || !hasNextPage || isFetchingNextPage) return;
    const container = tableContainerRef.current;
    const handleScroll = () => {
      if (container.scrollHeight - container.scrollTop <= container.clientHeight + 100) {
        fetchNextPage();
      }
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['leaderboard-infinite', experienceId, filter] });
  }, [filter, experienceId, queryClient]);

  const allUsers = data?.pages.flatMap(page => page.users) ?? [];

  return (
    <div className={cn('glass-panel overflow-hidden flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Leaderboard</h3>
        </div>

        <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
          {(['all-time', 'week', 'month'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-lg transition-all',
                filter === f ? 'bg-white/10 text-white shadow-sm' : 'text-text-muted hover:text-white'
              )}
            >
              {f === 'all-time' ? 'All Time' : f === 'week' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div ref={tableContainerRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-black/80 backdrop-blur-xl z-10 text-xs font-bold uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-6 py-4 w-20 text-center">Rank</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4 text-right">Level</th>
              <th className="px-6 py-4 text-right">XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading && !allUsers.length ? (
              [...Array(10)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="h-8 w-8 bg-white/5 rounded-full mx-auto" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-8 bg-white/5 rounded ml-auto" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-16 bg-white/5 rounded ml-auto" /></td>
                </tr>
              ))
            ) : (
              allUsers.map((entry, index) => (
                <LeaderboardRow
                  key={`${entry.userId}-${index}`}
                  {...entry}
                  rank={index + 1}
                  isCurrentUser={entry.userId === currentUserId}
                  onSelect={() => setSelectedUser(entry)}
                  rowIndex={index}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserProfileModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          {...selectedUser}
          displayName={selectedUser.display_name || 'Anonymous'}
          avatarUrl={selectedUser.avatar_url}
          totalPosts={selectedUser.total_posts}
          totalMessages={selectedUser.total_messages}
          totalReactions={selectedUser.total_reactions}
        />
      )}
    </div>
  );
};

const LeaderboardTableWithErrorBoundary = (props: LeaderboardTableProps) => (
  <ErrorBoundary>
    <LeaderboardTable {...props} />
  </ErrorBoundary>
);

export default LeaderboardTableWithErrorBoundary;
