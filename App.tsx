import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, Activity, AlertTriangle, Clock, BookOpen, Globe } from 'lucide-react';
import { generateStudyPlan } from './services/geminiService';
import { DayPlan, StudyStatus, KnowledgePoint, Language } from './types';
import { Onboarding } from './components/Onboarding';
import { DayCard } from './components/DayCard';
import { StatsCard } from './components/StatsCard';
import { getText } from './utils/translations';

const STORAGE_KEY = 'genai_study_plan_v1';
const LANG_STORAGE_KEY = 'genai_study_lang';

const App: React.FC = () => {
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [language, setLanguage] = useState<Language>('en');

  // Load from local storage on mount
  useEffect(() => {
    // Load Plan
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migratedPlan = parsed.map((d: any) => ({
          ...d,
          knowledgePoints: d.knowledgePoints || []
        }));
        setPlan(migratedPlan);
        const firstIncomplete = migratedPlan.findIndex((d: DayPlan) => d.status !== StudyStatus.COMPLETED);
        setCurrentDayIndex(firstIncomplete !== -1 ? firstIncomplete : migratedPlan.length - 1);
      } catch (e) {
        console.error("Failed to load plan", e);
      }
    }
    
    // Load Language
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (plan.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    }
  }, [plan]);

  useEffect(() => {
    localStorage.setItem(LANG_STORAGE_KEY, language);
  }, [language]);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const newPlan = await generateStudyPlan(language);
      setPlan(newPlan);
      setCurrentDayIndex(0);
    } catch (error) {
      alert("Failed to generate plan. Please check your API Key or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = (dayNumber: number, status: StudyStatus) => {
    setPlan(prev => prev.map(d => d.day === dayNumber ? { ...d, status } : d));
  };

  const updateHours = (dayNumber: number, hours: number) => {
    setPlan(prev => prev.map(d => d.day === dayNumber ? { ...d, hoursSpent: hours } : d));
  };

  const toggleKnowledgePoint = (dayNumber: number, pointIndex: number) => {
    setPlan(prev => prev.map(d => {
      if (d.day !== dayNumber) return d;
      
      const newPoints = [...d.knowledgePoints];
      newPoints[pointIndex] = {
        ...newPoints[pointIndex],
        isLearned: !newPoints[pointIndex].isLearned
      };
      
      return { ...d, knowledgePoints: newPoints };
    }));
  };

  const updateExplanation = (dayNumber: number, pointIndex: number, explanation: string) => {
    setPlan(prev => prev.map(d => {
        if (d.day !== dayNumber) return d;
        
        const newPoints = [...d.knowledgePoints];
        newPoints[pointIndex] = {
          ...newPoints[pointIndex],
          explanation: explanation
        };
        
        return { ...d, knowledgePoints: newPoints };
      }));
  }

  // Penalty Calculation Logic
  const penaltyHours = useMemo(() => {
    if (currentDayIndex === 0) return 0;
    const previousDay = plan[currentDayIndex - 1];
    if (previousDay && previousDay.status !== StudyStatus.COMPLETED) {
      return 1;
    }
    return 0;
  }, [plan, currentDayIndex]);

  const stats = useMemo(() => {
    const completed = plan.filter(p => p.status === StudyStatus.COMPLETED).length;
    const totalHours = plan.reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0);
    const totalTarget = plan.reduce((acc, curr) => acc + curr.targetHours, 0);
    const progress = plan.length ? (completed / plan.length) * 100 : 0;
    
    // Count total learned points
    const totalPoints = plan.reduce((acc, curr) => acc + curr.knowledgePoints.length, 0);
    const learnedPoints = plan.reduce((acc, curr) => acc + curr.knowledgePoints.filter(k => k.isLearned).length, 0);
    
    return { completed, totalHours, totalTarget, progress, learnedPoints, totalPoints };
  }, [plan]);

  const chartData = useMemo(() => {
    return plan.map(d => ({
      name: `D${d.day}`,
      spent: d.hoursSpent,
      target: d.targetHours,
      status: d.status
    }));
  }, [plan]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const t = getText(language);

  if (plan.length === 0) {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-slate-700 border border-slate-700"
          >
            <Globe size={14} />
            {language === 'en' ? 'English' : '中文'}
          </button>
        </div>
        <Onboarding onGenerate={handleGenerate} isLoading={isLoading} language={language} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ai-dark text-slate-50 font-sans pb-20">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-ai-accent p-1.5 rounded text-slate-900">
              <Brain size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight">GenAI<span className="text-ai-accent">Tracker</span></h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-xs text-slate-400">
                {t.model}: <span className="text-ai-accent">Gemini 3.0 Pro</span>
             </div>
             
             <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs hover:bg-slate-700 border border-slate-700"
              >
                <Globe size={12} />
                {language === 'en' ? 'EN' : '中'}
             </button>

             <button 
              onClick={() => {
                if(confirm(t.resetConfirm)) {
                    setPlan([]);
                    localStorage.removeItem(STORAGE_KEY);
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 underline">
               {t.reset}
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title={t.stats.completion}
            value={`${stats.completed}/${plan.length}`} 
            icon={Activity} 
            trend={`${stats.progress.toFixed(0)}%`}
            color="blue"
          />
          <StatsCard 
            title={t.stats.hoursLogged}
            value={stats.totalHours} 
            icon={Clock} 
            trend={`${t.stats.target}: ${stats.totalTarget}`}
            color="green"
          />
          <StatsCard 
            title={t.stats.pointsMastered}
            value={`${stats.learnedPoints}/${stats.totalPoints}`} 
            icon={BookOpen} 
            trend={stats.totalPoints > 0 ? `${((stats.learnedPoints/stats.totalPoints)*100).toFixed(0)}%` : '0%'}
            color="yellow"
          />
          <StatsCard 
            title={t.stats.penalty}
            value={penaltyHours > 0 ? `+${penaltyHours}h` : t.stats.none}
            icon={AlertTriangle} 
            color={penaltyHours > 0 ? "red" : "green"}
            trend={penaltyHours > 0 ? t.stats.yesterdayIncomplete : t.stats.onTrack}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="text-ai-accent" size={20} />
                {t.curriculum}
              </h2>
            </div>
            
            <div className="space-y-4">
              {plan.map((dayPlan, index) => (
                <DayCard 
                  key={dayPlan.day} 
                  plan={dayPlan} 
                  isActive={index === currentDayIndex}
                  onUpdateStatus={updateStatus}
                  onUpdateHours={updateHours}
                  onToggleKnowledgePoint={toggleKnowledgePoint}
                  onUpdateExplanation={updateExplanation}
                  penaltyHours={index === currentDayIndex ? penaltyHours : 0}
                  language={language}
                />
              ))}
            </div>
          </div>

          {/* Sidebar - Visuals */}
          <div className="space-y-8">
            <div className="bg-ai-card border border-slate-700 rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-6 text-white">{t.velocity}</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }}
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    />
                    <Bar dataKey="spent" fill="#38BDF8" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.status === 'COMPLETED' ? '#34D399' : '#38BDF8'} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-400 border-b border-slate-700 pb-2">
                    <span>{t.currentDay}</span>
                    <span className="text-white font-mono">{currentDayIndex + 1}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 border-b border-slate-700 pb-2">
                    <span>{t.dailyTarget}</span>
                    <span className="text-white font-mono">4h</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 pt-2">
                    <span>{t.nextMilestone}</span>
                    <span className="text-ai-accent font-mono">LLM Architecture</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;