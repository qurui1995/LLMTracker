
import React, { useMemo } from 'react';
import { ActivityMap, Language } from '../types';
import { getText } from '../utils/translations';

interface CalendarHeatmapProps {
  activity: ActivityMap;
  language: Language;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ activity, language }) => {
  const t = getText(language).calendar;

  // Generate last 16 weeks (approx 4 months) of dates
  const calendarData = useMemo(() => {
    const today = new Date();
    const weeks = [];
    // Start from Sunday of 15 weeks ago
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setDate(endDate.getDate() - (15 * 7 + endDate.getDay()));

    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        // Don't render future dates if we are at the end
        if (currentDate > endDate && i > endDate.getDay()) {
            week.push(null);
        } else {
            week.push(dateStr);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  }, []);

  const getColor = (hours: number) => {
    if (hours === 0) return 'bg-slate-800 border-slate-700/50';
    if (hours < 2) return 'bg-sky-900 border-sky-800';
    if (hours < 4) return 'bg-sky-700 border-sky-600';
    if (hours < 6) return 'bg-sky-500 border-sky-400';
    return 'bg-sky-300 border-sky-200';
  };

  return (
    <div className="bg-ai-card border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">{t.title}</h3>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{t.less}</span>
          <div className="w-3 h-3 bg-slate-800 rounded-sm"></div>
          <div className="w-3 h-3 bg-sky-900 rounded-sm"></div>
          <div className="w-3 h-3 bg-sky-500 rounded-sm"></div>
          <div className="w-3 h-3 bg-sky-300 rounded-sm"></div>
          <span>{t.more}</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 custom-scrollbar">
        <div className="flex gap-1 min-w-max">
            {calendarData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((dateStr, dayIndex) => {
                        if (!dateStr && weekIndex === calendarData.length - 1) return null; // Future days
                        
                        const hours = dateStr ? (activity[dateStr] || 0) : 0;
                        const isToday = dateStr === new Date().toISOString().split('T')[0];

                        return (
                            <div 
                                key={`${weekIndex}-${dayIndex}`}
                                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm border transition-colors ${getColor(hours)} relative group`}
                            >
                                {isToday && <div className="absolute inset-0 border border-white rounded-sm opacity-50"></div>}
                                {dateStr && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max bg-slate-900 text-xs text-white px-2 py-1 rounded border border-slate-700 pointer-events-none">
                                        {dateStr}: {hours.toFixed(1)}h
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
