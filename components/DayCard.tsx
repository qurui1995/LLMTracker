import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, Code, BookOpen, Play } from 'lucide-react';
import { DayPlan, StudyStatus } from '../types';

interface DayCardProps {
  plan: DayPlan;
  isActive: boolean;
  onUpdateStatus: (day: number, status: StudyStatus) => void;
  onUpdateHours: (day: number, hours: number) => void;
  penaltyHours: number;
}

export const DayCard: React.FC<DayCardProps> = ({ plan, isActive, onUpdateStatus, onUpdateHours, penaltyHours }) => {
  const [localHours, setLocalHours] = useState(plan.hoursSpent);
  
  // If this is the active day, the target is base target + penalty
  const effectiveTarget = isActive ? plan.targetHours + penaltyHours : plan.targetHours;
  
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLocalHours(val);
  };

  const saveHours = () => {
    onUpdateHours(plan.day, localHours);
  };

  return (
    <div className={`relative rounded-xl border p-6 transition-all duration-300 ${
      isActive 
        ? 'bg-slate-800/50 border-ai-accent shadow-[0_0_20px_rgba(56,189,248,0.1)]' 
        : 'bg-ai-card border-slate-700 opacity-90 hover:opacity-100'
    }`}>
      {isActive && (
        <div className="absolute -top-3 -right-3 bg-ai-accent text-slate-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
          CURRENT FOCUS
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-slate-400 text-sm font-mono">Day {plan.day}</h4>
          <h3 className="text-xl font-bold text-white mt-1">{plan.title}</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${
          plan.status === StudyStatus.COMPLETED ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-300'
        }`}>
          {plan.status === StudyStatus.COMPLETED ? <CheckCircle size={14} /> : <Circle size={14} />}
          {plan.status}
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-4 leading-relaxed">{plan.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-2">
            <Code size={16} /> Coding Task
          </div>
          <p className="text-slate-300 text-sm">{plan.codingTask}</p>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold mb-2">
            <BookOpen size={16} /> Interview Focus
          </div>
          <p className="text-slate-300 text-sm">{plan.interviewFocus}</p>
        </div>
      </div>

      {/* Topics Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {plan.topics.map((t, i) => (
          <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-600">
            {t}
          </span>
        ))}
      </div>

      {/* Controls */}
      <div className="border-t border-slate-700 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-slate-400" />
            <span className="text-sm text-slate-400">Logged:</span>
          </div>
          <input 
            type="number" 
            min="0" 
            max="24"
            step="0.5"
            value={localHours}
            onChange={handleHourChange}
            onBlur={saveHours}
            className="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-center focus:border-ai-accent focus:outline-none"
          />
          <span className="text-sm text-slate-500">
            / <span className={isActive && penaltyHours > 0 ? 'text-red-400 font-bold' : ''}>{effectiveTarget}h</span>
            {isActive && penaltyHours > 0 && <span className="text-xs ml-1 text-red-400">(+1h penalty)</span>}
          </span>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
            {plan.status !== StudyStatus.COMPLETED ? (
                 <button 
                 onClick={() => onUpdateStatus(plan.day, StudyStatus.COMPLETED)}
                 className="flex-1 sm:flex-none bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
               >
                 <CheckCircle size={16} /> Mark Complete
               </button>
            ) : (
                <button 
                onClick={() => onUpdateStatus(plan.day, StudyStatus.IN_PROGRESS)}
                className="flex-1 sm:flex-none bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Undo
              </button>
            )}
        </div>
      </div>
    </div>
  );
};
