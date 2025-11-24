import React from 'react';
import { Cpu, Sparkles, Terminal } from 'lucide-react';

interface OnboardingProps {
  onGenerate: () => void;
  isLoading: boolean;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onGenerate, isLoading }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center max-w-2xl mx-auto">
      <div className="bg-ai-accent/10 p-4 rounded-full mb-6 animate-pulse-slow">
        <Cpu size={64} className="text-ai-accent" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
        Gemini <span className="text-ai-accent">Mastery</span> Plan
      </h1>
      
      <p className="text-slate-400 text-lg mb-8 leading-relaxed">
        Prepare for your LLM & GenAI journey. We will generate a rigorous, 
        code-focused curriculum tailored to your ML background. 
        <br/><br/>
        <span className="text-sm font-mono bg-slate-800 px-2 py-1 rounded text-yellow-400">
          Penalty Mode Active: Miss a day? +1 Hour added to tomorrow.
        </span>
      </p>

      <div className="w-full max-w-md bg-slate-900 rounded-lg border border-slate-700 p-4 mb-8 text-left font-mono text-sm text-slate-300 shadow-xl">
        <div className="flex gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <p className="mb-1"><span className="text-green-400">$</span> user.background = "ML_Strong";</p>
        <p className="mb-1"><span className="text-green-400">$</span> user.goal = "LLM_Engineer";</p>
        <p className="mb-1"><span className="text-green-400">$</span> gemini.generate_plan({'{'} mode: "Hardcore" {'}'});</p>
        {isLoading && (
          <p className="mt-2 text-ai-accent animate-pulse">
            > Generating optimal learning path... (Thinking Budget: 2048 tokens)
          </p>
        )}
      </div>

      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-ai-accent font-sans rounded-full hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
           <span className="flex items-center gap-2">
             <Sparkles className="animate-spin" size={20} /> Creating Plan...
           </span>
        ) : (
           <span className="flex items-center gap-2">
             <Terminal size={20} /> Initiate Protocol
           </span>
        )}
      </button>
    </div>
  );
};
