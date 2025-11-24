
import { Language } from '../types';

export const translations = {
  en: {
    appTitle: "GenAI Mastery Tracker",
    model: "Model",
    reset: "Reset Progress",
    resetConfirm: "Reset plan? This cannot be undone.",
    stats: {
      completion: "Completion",
      hoursLogged: "Hours Logged",
      pointsMastered: "Points Mastered",
      penalty: "Current Penalty",
      target: "Target",
      yesterdayIncomplete: "Yesterday incomplete",
      onTrack: "On track",
      none: "None"
    },
    calendar: {
      title: "Study Consistency",
      less: "Less",
      more: "More",
      today: "Today"
    },
    curriculum: "Your Curriculum",
    velocity: "Velocity Tracker",
    currentDay: "Current Day",
    dailyTarget: "Daily Target",
    nextMilestone: "Next Milestone",
    dayCard: {
      currentFocus: "CURRENT FOCUS",
      checkpoints: "Knowledge Checkpoints",
      noCheckpoints: "No checkpoints generated.",
      codingTask: "Coding Task",
      interviewFocus: "Interview Focus",
      logged: "Logged",
      markComplete: "Mark Complete",
      undo: "Undo",
      penaltyMsg: "(+1h penalty)"
    },
    onboarding: {
      title: "Gemini Mastery Plan",
      subtitle: "Prepare for your LLM & GenAI journey. We will generate a rigorous, code-focused curriculum tailored to your ML background.",
      penaltyMode: "Penalty Mode Active: Miss a day? +1 Hour added to tomorrow.",
      generating: "Generating optimal learning path... (Thinking Budget: 2048 tokens)",
      buttonGen: "Initiate Protocol",
      buttonLoading: "Creating Plan..."
    }
  },
  zh: {
    appTitle: "GenAI 学习助手",
    model: "模型",
    reset: "重置进度",
    resetConfirm: "确定要重置计划吗？此操作无法撤销。",
    stats: {
      completion: "完成度",
      hoursLogged: "学习时长",
      pointsMastered: "掌握知识点",
      penalty: "当前惩罚",
      target: "目标",
      yesterdayIncomplete: "昨日未完成",
      onTrack: "进度正常",
      none: "无"
    },
    calendar: {
      title: "学习热力图",
      less: "少",
      more: "多",
      today: "今天"
    },
    curriculum: "学习课程",
    velocity: "速度追踪",
    currentDay: "当前天数",
    dailyTarget: "每日目标",
    nextMilestone: "下一个里程碑",
    dayCard: {
      currentFocus: "当前重点",
      checkpoints: "知识点检查清单",
      noCheckpoints: "未生成检查点",
      codingTask: "代码任务",
      interviewFocus: "面试重点",
      logged: "已记录",
      markComplete: "标记完成",
      undo: "撤销",
      penaltyMsg: "(+1小时惩罚)"
    },
    onboarding: {
      title: "Gemini 深度学习计划",
      subtitle: "为你的 LLM 和 GenAI 之旅做好准备。我们将根据你的机器学习背景，生成一个严格的、以代码为核心的课程。",
      penaltyMode: "惩罚模式已激活：如果某天未完成，第二天将增加1小时学习时间。",
      generating: "正在生成最佳学习路径... (思考预算: 2048 tokens)",
      buttonGen: "启动计划",
      buttonLoading: "正在创建..."
    }
  }
};

export const getText = (lang: Language) => translations[lang];
