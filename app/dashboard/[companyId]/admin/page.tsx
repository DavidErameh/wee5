'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useNotification } from '@/contexts/NotificationContext';
import { BadgeAssignment } from '@/components/BadgeAssignment/BadgeAssignment';

interface User {
  id: string;
  user_id: string;
  xp: number;
  level: number;
  tier: string;
  total_messages: number;
  total_posts: number;
  total_reactions: number;
}

export default function AdminPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const { showSuccess, showError, showWarning } = useNotification();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showXpModal, setShowXpModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [xpAdjustment, setXpAdjustment] = useState<number>(0);
  const [xpReason, setXpReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [companyId]);

  useEffect(() => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterTier !== 'all') {
      filtered = filtered.filter(user => user.tier === filterTier);
    }
    setFilteredUsers(filtered);
  }, [users, searchTerm, filterTier]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboard?experienceId=${companyId}&limit=100`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.leaderboard || []);
      setFilteredUsers(data.leaderboard || []);
    } catch (error) {
      console.error('Error:', error);
      showError('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  async function handleXpAdjustment() {
    if (!selectedUser || xpAdjustment === 0) {
      showWarning('Validation', 'Please enter an XP adjustment amount');
      return;
    }
    if (!xpReason.trim()) {
      showWarning('Validation', 'Please provide a reason');
      return;
    }
    showSuccess('Success', `XP adjusted by ${xpAdjustment > 0 ? '+' : ''}${xpAdjustment}`);
    setShowXpModal(false);
    setXpAdjustment(0);
    setXpReason('');
    setSelectedUser(null);
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage users, adjust XP, and assign badges</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Users</div>
            <div className="text-3xl font-bold text-gray-900">{users.length}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Free Tier</div>
            <div className="text-3xl font-bold text-gray-900">
              {users.filter(u => u.tier === 'free').length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Premium</div>
            <div className="text-3xl font-bold text-blue-600">
              {users.filter(u => u.tier === 'premium').length}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Enterprise</div>
            <div className="text-3xl font-bold text-purple-600">
              {users.filter(u => u.tier === 'enterprise').length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user ID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tier</label>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Tiers</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">XP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{user.user_id.substring(0, 20)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold">Level {user.level}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{user.xp.toLocaleString()} XP</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.tier === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                          user.tier === 'premium' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{user.tier}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600">
                          <div>📝 {user.total_messages}</div>
                          <div>📄 {user.total_posts}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => { setSelectedUser(user); setShowXpModal(true); }}
                          className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                        >
                          Adjust XP
                        </button>
                        <button
                          onClick={() => { setSelectedUser(user); setShowBadgeModal(true); }}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Badge
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showXpModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Adjust XP</h2>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">User</div>
                <div className="font-medium">{selectedUser.user_id}</div>
                <div className="text-sm text-gray-600 mt-2">Current XP</div>
                <div className="font-bold text-2xl">{selectedUser.xp}</div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">XP Adjustment *</label>
                  <input
                    type="number"
                    value={xpAdjustment}
                    onChange={(e) => setXpAdjustment(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter positive or negative number"
                  />
                  {xpAdjustment !== 0 && (
                    <p className="text-sm font-medium mt-2">New XP: {selectedUser.xp + xpAdjustment}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason *</label>
                  <textarea
                    value={xpReason}
                    onChange={(e) => setXpReason(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowXpModal(false); setXpAdjustment(0); setXpReason(''); setSelectedUser(null); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleXpAdjustment}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {showBadgeModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">Assign Badge</h2>
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">User</div>
                <div className="font-medium">{selectedUser.user_id}</div>
              </div>
              <BadgeAssignment
                userId={selectedUser.user_id}
                experienceId={companyId}
                onAssigned={() => { setShowBadgeModal(false); setSelectedUser(null); }}
              />
              <button
                onClick={() => { setShowBadgeModal(false); setSelectedUser(null); }}
                className="w-full mt-4 bg-gray-100 hover:bg-gray-200 font-semibold py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
