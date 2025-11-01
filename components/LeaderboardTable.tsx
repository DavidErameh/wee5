
'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

async function fetchLeaderboard(experienceId: string, filter: string) {
  const res = await fetch(`/api/leaderboard?experienceId=${experienceId}&filter=${filter}`);
  if (!res.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  const data = await res.json();
  return data.leaderboard;
}

interface LeaderboardTableProps {
  experienceId: string;
}

import { Tabs, TabsList, TabsTrigger, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from 'frosted-ui';

export function LeaderboardTable({ experienceId }: LeaderboardTableProps) {
  const [filter, setFilter] = useState('all-time');
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['leaderboard', experienceId, filter],
    queryFn: () => fetchLeaderboard(experienceId, filter),
  });

  if (isLoading) return <div>Loading leaderboard...</div>;
  if (error) return <div>Error loading leaderboard</div>;

  return (
    <Tabs defaultValue="all-time" onValueChange={setFilter}>
      <TabsList>
        <TabsTrigger value="all-time">All Time</TabsTrigger>
        <TabsTrigger value="week">Week</TabsTrigger>
        <TabsTrigger value="month">Month</TabsTrigger>
      </TabsList>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>XP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard?.map((user: any) => (
            <TableRow key={user.user_id}>
              <TableCell>{user.rank}</TableCell>
              <TableCell>{user.user_id}</TableCell>
              <TableCell>{user.level}</TableCell>
              <TableCell>{user.xp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Tabs>
  );
}
