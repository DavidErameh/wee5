// components/AnalyticsDashboard/EngagementHeatmap.tsx
'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipData {
  day: string;
  hour: number;
  activity: number;
}

interface CustomTooltipProps {
  data: TooltipData;
  position: { x: number; y: number };
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ data, position }) => {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute z-tooltip rounded-lg border border-border bg-dark p-2 text-sm shadow-lg pointer-events-none"
      style={{ left: position.x + 10, top: position.y + 10 }}
    >
      <p className="label text-text-muted">{`Activity on ${data.day} at ${data.hour}:00`}</p>
      <p className="intro font-bold text-white">{`Activity: ${data.activity}`}</p>
    </motion.div>
  );
};

// Mock data - in a real app, this would come from an API
const generateMockHeatmapData = () => {
  const data = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  for (const day of days) {
    for (const hour of hours) {
      const activity = Math.floor(Math.random() * 100); // 0-99
      data.push({ day, hour, activity });
    }
  }
  return data;
};

const heatmapData = generateMockHeatmapData();

const getColorIntensity = (activity: number) => {
  // Scale activity from 0-99 to a color intensity
  if (activity === 0) return 'bg-dark'; // No activity
  if (activity < 20) return 'bg-accent/10';
  if (activity < 40) return 'bg-accent/20';
  if (activity < 60) return 'bg-accent/40';
  if (activity < 80) return 'bg-accent/60';
  return 'bg-accent/80'; // High activity
};

export const EngagementHeatmap: React.FC = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23

  const [hoveredCell, setHoveredCell] = useState<TooltipData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>, cellData: TooltipData) => {
    setHoveredCell(cellData);
    setTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  return (
    <motion.div
      className="h-[300px] rounded-xl border border-border bg-[#111111] p-4 flex flex-col relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h3 className="font-bold text-white mb-4">Engagement Heatmap</h3>
      <div className="flex text-xs text-text-muted mb-2 ml-[30px] lg:ml-[40px]">
        {hours.map(hour => (
          <span key={hour} className="flex-1 text-center">
            {hour === 0 || hour === 6 || hour === 12 || hour === 18 ? `${hour}:00` : ''}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-[30px_repeat(24,1fr)] lg:grid-cols-[40px_repeat(24,1fr)] gap-0.5">
        {/* Day Labels */}
        {days.map(day => (
          <React.Fragment key={day}>
            <div className="flex items-center justify-end text-xs text-text-muted pr-1">
              {day}
            </div>
            {hours.map(hour => {
              const cellData = heatmapData.find(d => d.day === day && d.hour === hour);
              const activity = cellData ? cellData.activity : 0;
              const currentCellData: TooltipData = { day, hour, activity };

              return (
                <div
                  key={`${day}-${hour}`}
                  className={cn(
                    'relative h-4 w-full rounded-sm transition-colors',
                    getColorIntensity(activity)
                  )}
                  onMouseEnter={(e) => handleMouseEnter(e, currentCellData)}
                  onMouseLeave={handleMouseLeave}
                >
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
       <p className="text-xs text-text-muted text-right mt-2">Activity scale: Low to High → Dark to Accent</p>
       {hoveredCell && (
         <CustomTooltip data={hoveredCell} position={tooltipPosition} />
       )}
    </motion.div>
  );
};

EngagementHeatmap.displayName = 'EngagementHeatmap';
