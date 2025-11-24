import React, { useState } from 'react';
import { CheckCircle, Circle, Clock, Code, BookOpen, HelpCircle, Loader } from 'lucide-react';
import { DayPlan, StudyStatus, KnowledgePoint, Language } from '../types';
import { getConceptExplanation } from '../services/geminiService';
import { getText } from '../utils/translations';

interface DayCardProps {
  plan: DayPlan;
  isActive: boolean;
  onUpdateStatus: (day: number, status: StudyStatus) => void;
  onUpdateHours: (day: number, hours: number) => void;
  onToggleKnowledgePoint: (day: number, pointIndex: number) => void;
  onUpdateExplanation: (day: number, pointIndex: number, explanation: string) => void;
  penaltyHours: number;
  language: Language;
}

export const DayCard: React.FC<DayCardProps> = ({ 
  plan, 
  isActive, 
  onUpdateStatus, 
  onUpdateHours, 
  onToggleKnowledgePoint,
  onUpdateExplanation,
  penaltyHours,
  language
}) => {
  const [localHours, setLocalHours] = useState(plan.hoursSpent);
  const [loadingExplanation, setLoadingExplanation] = useState<number | null>(null);
  
  const t = getText(language).dayCard;
  const effectiveTarget = isActive ? plan.targetHours + penaltyHours : plan.targetHours;
  
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setLocalHours(val);
  };

  const saveHours = () => {
    onUpdateHours(plan.day, localHours);
  };

  const handleExplain = async (index: number, point: KnowledgePoint) => {
    if (point.explanation) return; // Already loaded

    setLoadingExplanation(index);
    try {
      const explanation = await getConceptExplanation(point.text, plan.title, language);
      onUpdateExplanation(plan.day, index, explanation);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingExplanation(null);
    }
  };

  return (
    <div className={`relative rounded-xl border p-6 transition-all duration-300 ${
      isActive 
        ? 'bg-slate-800/50 border-ai-accent shadow-[0_0_20px_rgba(56,189,248,0.1)]' 
        : 'bg-ai-card border-slate-700 opacity-90 hover:opacity-100'
    }`}>
      {isActive && (
        <div className="absolute -top-3 -right-3 bg-ai-accent text-slate-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
          {t.currentFocus}
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

      <p className="text-slate-300 text-sm mb-6 leading-relaxed">{plan.description}</p>

      {/* Knowledge Points Checklist */}
      <div className="mb-6 bg-slate-900/30 rounded-lg p-4 border border-slate-700/50">
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.checkpoints}</h5>
        <div className="space-y-3">
          {plan.knowledgePoints?.map((point, idx) => (
            <div key={idx} className="group">
              <div className="flex items-start gap-3">
                <button 
                  onClick={() => onToggleKnowledgePoint(plan.day, idx)}
                  className={`mt-0.5 flex-shrink-0 transition-colors ${point.isLearned ? 'text-green-400' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  {point.isLearned ? <CheckCircle size={18} /> : <Circle size={18} />}
                </button>
                
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${point.isLearned ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {point.text}
                    </span>
                    <button 
                      onClick={() => handleExplain(idx, point)}
                      className="ml-2 text-ai-accent opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-ai-accent/10 rounded"
                      title={language === 'zh' ? "向 Gemini 提问" : "Ask Gemini for an explanation"}
                    >
                      {loadingExplanation === idx ? <Loader size={14} className="animate-spin" /> : <HelpCircle size={14} />}
                    </button>
                  </div>
                  
                  {/* AI Explanation Area */}
                  {point.explanation && (
                    <div className="mt-2 text-xs bg-slate-800/80 p-3 rounded border-l-2 border-ai-accent text-slate-300 animate-in fade-in slide-in-from-top-2">
                       {point.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {(!plan.knowledgePoints || plan.knowledgePoints.length === 0) && (
             <p className="text-xs text-slate-500 italic">{t.noCheckpoints}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-2">
            <Code size={16} /> {t.codingTask}
          </div>
          <p className="text-slate-300 text-sm">{plan.codingTask}</p>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold mb-2">
            <BookOpen size={16} /> {t.interviewFocus}
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
            <span className="text-sm text-slate-400">{t.logged}:</span>
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
            {isActive && penaltyHours > 0 && <span className="text-xs ml-1 text-red-400">{t.penaltyMsg}</span>}
          </span>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
            {plan.status !== StudyStatus.COMPLETED ? (
                 <button 
                 onClick={() => onUpdateStatus(plan.day, StudyStatus.COMPLETED)}
                 className="flex-1 sm:flex-none bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
               >
                 <CheckCircle size={16} /> {t.markComplete}
               </button>
            ) : (
                <button 
                onClick={() => onUpdateStatus(plan.day, StudyStatus.IN_PROGRESS)}
                className="flex-1 sm:flex-none bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
              >
                {t.undo}
              </button>
            )}
        </div>
      </div>
    </div>
  );
};