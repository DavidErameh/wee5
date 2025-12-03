"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';
// Placeholder for a logo
const Logo = () => <div className="w-8 h-8 rounded-full bg-accent" />;

interface NavigationBarProps {
  communityName: string;
  userName: string;
  userAvatarUrl?: string;
  currentXp: number;
  // This would come from a real-time context
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  communityName,
  userName,
  userAvatarUrl,
  currentXp,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]); // Replace any with actual UserCard type
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    if (query.length > 2) {
      // In a real app, this would debounce and call an API
      console.log('Searching for:', query);
      // Dummy results
      setSearchResults([
        { id: '1', name: 'Alice', avatar: 'https://avatar.vercel.sh/alice' },
        { id: '2', name: 'Bob', avatar: 'https://avatar.vercel.sh/bob' },
      ]);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-sticky h-[64px] bg-black/30 backdrop-blur-xl border-b border-white/10">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 md:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <a href="/" aria-label="Home" className="focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black rounded-full">
            <Logo />
          </a>
          <span className="hidden md:inline font-bold text-lg text-white">{communityName}</span>
        </div>

        {/* Center (Search Bar) - Desktop */}
        <div className="hidden md:flex flex-1 justify-center px-8">
          <div className="relative w-full max-w-md">
            <label htmlFor="search-users" className="sr-only">Search users</label>
            <input
              id="search-users"
              type="text"
              placeholder="Search users..."
              aria-label="Search users"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 100)} // Delay to allow click on results
              className="w-full rounded-lg border border-border bg-dark px-4 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <Search className="h-5 w-5 text-text-muted" aria-hidden="true" />
            </div>
            <AnimatePresence>
              {isSearchOpen && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute left-0 right-0 mt-2 shadow-lg glass-panel z-dropdown max-h-60 overflow-y-auto"
                  role="listbox"
                >
                  {searchResults.map((user) => (
                    <a
                      key={user.id}
                      href={`/profile/${user.id}`}
                      className="flex items-center gap-3 p-2 hover:bg-dark-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-dark rounded-md m-1"
                      role="option"
                      aria-selected={false}
                    >
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-white text-sm font-medium">{user.name}</span>
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* XP Badge */}
          <div className="hidden md:flex items-center gap-2 rounded-full bg-dark px-3 py-1.5 text-sm" aria-label={`Current XP: ${currentXp.toLocaleString()}`}>
            <span className="font-bold text-accent">XP</span>
            <span className="font-semibold text-white">{currentXp.toLocaleString()}</span>
          </div>

          {/* Avatar Dropdown */}
          <div className="relative">
            <motion.button
              className="h-10 w-10 rounded-full bg-dark ring-2 ring-offset-2 ring-offset-black ring-border hover:ring-accent transition-all focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="User menu"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              whileHover={{ boxShadow: '0 0 12px rgba(107, 70, 193, 0.25)' }}
              aria-expanded={isDropdownOpen}
              aria-haspopup="menu"
            >
              <img
                src={userAvatarUrl || `https://avatar.vercel.sh/${userName}`}
                alt={userName}
                className="h-full w-full rounded-full object-cover"
              />
            </motion.button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-48 shadow-lg glass-panel z-dropdown origin-top-right"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <div className="py-1" role="none">
                    <a href="#profile" className="block px-4 py-2 text-sm text-white hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-dark rounded-md m-1" role="menuitem">
                      Your Profile
                    </a>
                    <a href="#settings" className="block px-4 py-2 text-sm text-white hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-dark rounded-md m-1" role="menuitem">
                      Settings
                    </a>
                    <button className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-error/20 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 focus:ring-offset-dark rounded-md m-1" role="menuitem">
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black p-2 rounded-md"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay would be implemented here */}
    </header>
  );
};

NavigationBar.displayName = 'NavigationBar';
