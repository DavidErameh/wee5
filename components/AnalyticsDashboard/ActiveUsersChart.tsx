// components/AnalyticsDashboard/ActiveUsersChart.tsx
'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { motion } from 'framer-motion';

// Mock data - in a real app, this would come from an API
const data = [
  { name: '7d ago', activeUsers: 120 },
  { name: '6d ago', activeUsers: 150 },
  { name: '5d ago', activeUsers: 130 },
  { name: '4d ago', activeUsers: 180 },
  { name: '3d ago', activeUsers: 210 },
  { name: '2d ago', activeUsers: 250 },
  { name: 'Yesterday', activeUsers: 230 },
  { name: 'Today', activeUsers: 260 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-dark p-2 text-sm shadow-lg">
          <p className="label text-text-muted">{`${label}`}</p>
          <p className="intro font-bold text-white">{`Active Users : ${payload[0].value}`}</p>
        </div>
      );
    }
  
    return null;
  };

export const ActiveUsersChart: React.FC = () => {
  return (
    <motion.div 
        className="h-[300px] w-full rounded-xl border border-border bg-dark p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Active Users</h3>
            <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs text-text-muted">Live</span>
            </div>
        </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6B46C1" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#6B46C1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
          <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--color-accent-light)', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Area type="monotone" dataKey="activeUsers" stroke="#6B46C1" fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

ActiveUsersChart.displayName = 'ActiveUsersChart';
