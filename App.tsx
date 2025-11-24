import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, Activity, AlertTriangle, Clock, BookOpen } from 'lucide-react';
import { generateStudyPlan } from './services/geminiService';
import { DayPlan, StudyStatus } from './types';
import { Onboarding } from './components/Onboarding';
import { DayCard } from './components/DayCard';
import { StatsCard } from './components/StatsCard';

const STORAGE_KEY = 'genai_study_plan_v1';

const App: React.FC = () => {
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0); // 0-based index of current active day

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPlan(JSON.parse(saved));
        // Find first non-completed day to set as current
        const parsed = JSON.parse(saved);
        const firstIncomplete = parsed.findIndex((d: DayPlan) => d.status !== StudyStatus.COMPLETED);
        setCurrentDayIndex(firstIncomplete !== -1 ? firstIncomplete : parsed.length - 1);
      } catch (e) {
        console.error("Failed to load plan", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (plan.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    }
  }, [plan]);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const newPlan = await generateStudyPlan();
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

  // Penalty Calculation Logic
  // If previous day (currentDayIndex - 1) exists AND is NOT completed, penalty is active.
  // Note: The prompt asks: "If the previous day is not completed, need to study 1 extra hour".
  // This implies the penalty applies to the *current* day if the *previous* day was missed.
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
    return { completed, totalHours, totalTarget, progress };
  }, [plan]);

  const chartData = useMemo(() => {
    return plan.map(d => ({
      name: `D${d.day}`,
      spent: d.hoursSpent,
      target: d.targetHours,
      status: d.status
    }));
  }, [plan]);

  if (plan.length === 0) {
    return <Onboarding onGenerate={handleGenerate} isLoading={isLoading} />;
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
                Model: <span className="text-ai-accent">Gemini 3.0 Pro</span>
             </div>
             <button 
              onClick={() => {
                if(confirm("Reset plan? This cannot be undone.")) {
                    setPlan([]);
                    localStorage.removeItem(STORAGE_KEY);
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 underline">
               Reset Progress
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Completion" 
            value={`${stats.completed}/${plan.length}`} 
            icon={Activity} 
            trend={`${stats.progress.toFixed(0)}%`}
            color="blue"
          />
          <StatsCard 
            title="Hours Logged" 
            value={stats.totalHours} 
            icon={Clock} 
            trend={`Target: ${stats.totalTarget}`}
            color="green"
          />
          <StatsCard 
            title="Current Penalty" 
            value={penaltyHours > 0 ? `+${penaltyHours}h` : "None"} 
            icon={AlertTriangle} 
            color={penaltyHours > 0 ? "red" : "green"}
            trend={penaltyHours > 0 ? "Yesterday incomplete" : "On track"}
          />
          <StatsCard 
            title="Current Topic" 
            value={plan[currentDayIndex]?.title || "Finish Line"} 
            icon={BookOpen} 
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="text-ai-accent" size={20} />
                Your Curriculum
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
                  penaltyHours={index === currentDayIndex ? penaltyHours : 0}
                />
              ))}
            </div>
          </div>

          {/* Sidebar - Visuals */}
          <div className="space-y-8">
            <div className="bg-ai-card border border-slate-700 rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-6 text-white">Velocity Tracker</h3>
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
                    <span>Current Day</span>
                    <span className="text-white font-mono">{currentDayIndex + 1}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 border-b border-slate-700 pb-2">
                    <span>Daily Target</span>
                    <span className="text-white font-mono">4h</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 pt-2">
                    <span>Next Milestone</span>
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
