// components/AnalyticsDashboard/XpDistributionChart.tsx
'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

// Mock data - in a real app, this would come from an API
const data = [
  { name: 'Lvl 1-10', xp: 5000 },
  { name: 'Lvl 11-20', xp: 12000 },
  { name: 'Lvl 21-30', xp: 25000 },
  { name: 'Lvl 31-40', xp: 40000 },
  { name: 'Lvl 41-50', xp: 60000 },
  { name: 'Lvl 51+', xp: 80000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-dark p-2 text-sm shadow-lg">
        <p className="label text-text-muted">{`${label}`}</p>
        <p className="intro font-bold text-white">{`Total XP : ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }

  return null;
};

export const XpDistributionChart: React.FC = () => {
  return (
    <motion.div
      className="h-[250px] w-full rounded-xl border border-border bg-[#111111] p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="font-bold text-white mb-4">XP Distribution</h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#A1A1AA', fontSize: 12 }} axisLine={{ stroke: '#2D2D2D' }} tickLine={false} />
          <YAxis tick={{ fill: '#A1A1AA', fontSize: 12 }} axisLine={{ stroke: '#2D2D2D' }} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(107, 70, 193, 0.2)' }} />
          <Bar dataKey="xp" fill="#6B46C1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

XpDistributionChart.displayName = 'XpDistributionChart';