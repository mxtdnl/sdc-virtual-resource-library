import type { ComponentType } from "react";
import PrioritizationMatrix from "@/exercises/PrioritizationMatrix";
import CirclesOfControl from "@/exercises/CirclesOfControl";
import PERMA from "@/exercises/PERMA";
import RulesAndAssumptions from "@/exercises/RulesAndAssumptions";
import SelfCareWheel from "@/exercises/SelfCareWheel";
import SelfCompassion from "@/exercises/SelfCompassion";
import ThoughtLogging from "@/exercises/ThoughtLogging";
import BoxBreathing from "@/exercises/BoxBreathing";
import CognitiveDistortions from "@/exercises/CognitiveDistortions";
import ChallengingRules from "@/exercises/ChallengingRules";
import ChimpBrain from "@/exercises/ChimpBrain";
import FutureSelf from "@/exercises/FutureSelf";
import CoreValues from "@/exercises/CoreValues";
import EndOfYearReview from "@/exercises/EndOfYearReview";
import FindingPassions from "@/exercises/FindingPassions";
import Ikigai from "@/exercises/Ikigai";
import ProcrastinationChecklist from "@/exercises/ProcrastinationChecklist";
import WheelOfPower from "@/exercises/WheelOfPower";
import WheelOfLife from "@/exercises/WheelOfLife";
import WheelOfHult from "@/exercises/WheelOfHult";
import SixThinkingHats from "@/exercises/SixThinkingHats";
import IdeaQuickfire from "@/exercises/IdeaQuickfire";
import ProjectBreakdown from "@/exercises/ProjectBreakdown";
import RewardReplacement from "@/exercises/RewardReplacement";
import SmartGoals from "@/exercises/SmartGoals";
import UrgentImportant from "@/exercises/UrgentImportant";
import DecisionGrid from "@/exercises/DecisionGrid";
import AsIfExercise from "@/exercises/AsIfExercise";
import WalkAndTalk from "@/exercises/WalkAndTalk";
import HighStandards from "@/exercises/HighStandards";
import PerfectionismInfo from "@/exercises/PerfectionismInfo";
import EthicalDilemmas from "@/exercises/EthicalDilemmas";
import BearFeedback from "@/exercises/BearFeedback";
import TeamAlignment from "@/exercises/TeamAlignment";
import MustShouldCould from "@/exercises/MustShouldCould";
import EnhancedTodo from "@/exercises/EnhancedTodo";
import ActioningObjectives from "@/exercises/ActioningObjectives";
import SkillsCards from "@/exercises/SkillsCards";
import GoalNetwork from "@/exercises/GoalNetwork";

export type Exercise = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  estimatedMinutes: number;
  component: ComponentType;
};

export const EXERCISES: Exercise[] = [
  {
    slug: "goal-network",
    title: "Goal Network",
    description:
      "Build a hierarchy of superordinate, intermediate and subordinate goals, then link each action to every goal it supports.",
    category: "Purpose & Direction",
    tags: ["goals", "planning", "motivation", "behaviour-change"],
    estimatedMinutes: 25,
    component: GoalNetwork,
  },
  {
    slug: "skills-and-mindset-cards",
    title: "Skills & Mindset Cards",
    description:
      "Spread twelve skill and mindset cards, pick your top three and three to develop, then work one card in depth.",
    category: "Self-Awareness",
    tags: ["strengths", "reflection", "development"],
    estimatedMinutes: 30,
    component: SkillsCards,
  },
  {
    slug: "prioritization-matrix",
    title: "Prioritization Matrix",
    description:
      "Rank tasks, goals, or options using pairwise comparison — never more than two at a time.",
    category: "Prioritization",
    tags: ["decision-making", "focus", "planning"],
    estimatedMinutes: 10,
    component: PrioritizationMatrix,
  },
  {
    slug: "circles-of-control",
    title: "Circles of Control, Influence, and Concern",
    description:
      "Sort your worries into what you can control, influence, and must let go of — then act.",
    category: "Stress & Anxiety",
    tags: ["focus", "stress", "agency"],
    estimatedMinutes: 10,
    component: CirclesOfControl,
  },
  {
    slug: "perma-model",
    title: "PERMA Model of Wellbeing",
    description:
      "Check in on the five elements of wellbeing: Positive emotions, Engagement, Relationships, Meaning, Accomplishment.",
    category: "Wellbeing",
    tags: ["wellbeing", "reflection", "positive-psychology"],
    estimatedMinutes: 10,
    component: PERMA,
  },
  {
    slug: "rules-and-assumptions-check",
    title: "Rules and Assumptions Check",
    description:
      "Surface the unconscious rules and assumptions that drive your behaviour and anxiety.",
    category: "Beliefs & Thinking",
    tags: ["perfectionism", "anxiety", "self-awareness"],
    estimatedMinutes: 12,
    component: RulesAndAssumptions,
  },
  {
    slug: "self-care-wheel",
    title: "Self-Care Wheel",
    description:
      "Visualise your wellbeing across six dimensions of self-care and find where to focus next.",
    category: "Wellbeing",
    tags: ["wellbeing", "balance", "self-care"],
    estimatedMinutes: 10,
    component: SelfCareWheel,
  },
  {
    slug: "self-compassion",
    title: "Practising Self-Compassion",
    description:
      "Five short steps to meet a hard moment with kindness instead of harsh self-criticism.",
    category: "Wellbeing",
    tags: ["self-compassion", "resilience", "reflection"],
    estimatedMinutes: 8,
    component: SelfCompassion,
  },
  {
    slug: "thought-logging",
    title: "Thought Logging",
    description:
      "Externalise and challenge unhelpful thoughts. Track triggers, evidence, and reframes over time.",
    category: "Beliefs & Thinking",
    tags: ["cbt", "anxiety", "reframing"],
    estimatedMinutes: 12,
    component: ThoughtLogging,
  },
  {
    slug: "box-breathing",
    title: "Box Breathing",
    description:
      "A guided 4-4-4-4 breathing timer to calm the nervous system in under two minutes.",
    category: "Calming Techniques",
    tags: ["breathing", "mindfulness", "stress"],
    estimatedMinutes: 3,
    component: BoxBreathing,
  },
  {
    slug: "challenging-cognitive-distortions",
    title: "Challenging Cognitive Distortions",
    description: "Spot common thinking traps and reframe a thought into something more balanced.",
    category: "Beliefs & Thinking",
    tags: ["cbt", "reframing", "self-awareness"],
    estimatedMinutes: 12,
    component: CognitiveDistortions,
  },
  {
    slug: "challenging-rules-and-assumptions",
    title: "Challenging Rules and Assumptions",
    description: "Run a small behavioural experiment to test and shift an unhelpful belief.",
    category: "Beliefs & Thinking",
    tags: ["perfectionism", "experiment", "growth"],
    estimatedMinutes: 15,
    component: ChallengingRules,
  },
  {
    slug: "chimp-brain",
    title: "The Chimp Mind Model",
    description: "Six steps to handle moments when your emotional brain hijacks your thinking.",
    category: "Stress & Anxiety",
    tags: ["emotional-regulation", "stress", "self-awareness"],
    estimatedMinutes: 10,
    component: ChimpBrain,
  },
  {
    slug: "future-self",
    title: "Meeting Your Future Self",
    description:
      "A guided visualization to meet a wiser version of you 15 years from now — and hear what they have to say.",
    category: "Purpose & Direction",
    tags: ["visualization", "goals", "reflection"],
    estimatedMinutes: 15,
    component: FutureSelf,
  },
  {
    slug: "core-values",
    title: "Core Values",
    description: "Clarify, group, and rank the values that guide your decisions and goals.",
    category: "Purpose & Direction",
    tags: ["values", "self-awareness", "decision-making"],
    estimatedMinutes: 15,
    component: CoreValues,
  },
  {
    slug: "end-of-year-review",
    title: "End-of-Year Review",
    description:
      "Reflect on your academic year — what you achieved, what you'd change, and where to focus next.",
    category: "Reflection",
    tags: ["reflection", "review", "goals"],
    estimatedMinutes: 15,
    component: EndOfYearReview,
  },
  {
    slug: "finding-your-passions",
    title: "Finding Your Passions",
    description: "Five questions to surface what energizes you and a small experiment to test it.",
    category: "Purpose & Direction",
    tags: ["passion", "self-awareness", "direction"],
    estimatedMinutes: 15,
    component: FindingPassions,
  },
  {
    slug: "ikigai",
    title: "Ikigai",
    description:
      "Find your reason for being at the intersection of what you love, are good at, can be paid for, and what the world needs.",
    category: "Purpose & Direction",
    tags: ["purpose", "meaning", "career"],
    estimatedMinutes: 20,
    component: Ikigai,
  },
  {
    slug: "procrastination-checklist",
    title: "Procrastination Checklist",
    description:
      "Pinpoint exactly where you procrastinate so you can stop labelling yourself and start fixing the specifics.",
    category: "Productivity",
    tags: ["procrastination", "self-awareness", "habits"],
    estimatedMinutes: 10,
    component: ProcrastinationChecklist,
  },
  {
    slug: "wheel-of-power-and-privilege",
    title: "Wheel of Privilege & Power",
    description:
      "Reflect on how parts of your identity shape privilege or marginalization across different contexts.",
    category: "Reflection",
    tags: ["identity", "privilege", "awareness"],
    estimatedMinutes: 15,
    component: WheelOfPower,
  },
  {
    slug: "wheel-of-life",
    title: "Wheel of Life",
    description:
      "A quick visual snapshot of your satisfaction across eight life areas — and where to bring more balance.",
    category: "Wellbeing",
    tags: ["balance", "reflection", "wellbeing"],
    estimatedMinutes: 10,
    component: WheelOfLife,
  },
  {
    slug: "six-thinking-hats",
    title: "The Six Thinking Hats",
    description:
      "Work through a problem or decision from six distinct perspectives to reach a balanced choice.",
    category: "Decision-Making",
    tags: ["decision-making", "creativity", "problem-solving"],
    estimatedMinutes: 20,
    component: SixThinkingHats,
  },
  {
    slug: "idea-generation-quickfire",
    title: "Idea Generation Quickfire",
    description: "A timed brainstorming sprint to flex your creative muscles — wild ideas welcome.",
    category: "Creativity",
    tags: ["brainstorming", "creativity", "ideas"],
    estimatedMinutes: 10,
    component: IdeaQuickfire,
  },
  {
    slug: "project-breakdown",
    title: "Project Breakdown",
    description: "Turn a daunting project into small, ordered tasks grouped by phase.",
    category: "Productivity",
    tags: ["planning", "procrastination", "projects"],
    estimatedMinutes: 12,
    component: ProjectBreakdown,
  },
  {
    slug: "reward-replacement",
    title: "Reward Replacement",
    description:
      "Identify the hidden reward driving a habit, then design an alternative that delivers the same payoff at lower cost.",
    category: "Habits & Behaviour",
    tags: ["habits", "behaviour-change", "self-awareness"],
    estimatedMinutes: 12,
    component: RewardReplacement,
  },
  {
    slug: "smart-goals",
    title: "SMART Goals",
    description:
      "Turn a vague goal into something Specific, Measurable, Achievable, Relevant, and Time-bound.",
    category: "Purpose & Direction",
    tags: ["goals", "planning", "motivation"],
    estimatedMinutes: 12,
    component: SmartGoals,
  },
  {
    slug: "urgent-important-matrix",
    title: "Urgent-Important Matrix",
    description:
      "Sort tasks by urgency and importance (Eisenhower Matrix) so the urgent doesn't crowd out the important.",
    category: "Prioritization",
    tags: ["prioritization", "focus", "planning"],
    estimatedMinutes: 10,
    component: UrgentImportant,
  },
  {
    slug: "decision-grid",
    title: "Decision Grid",
    description:
      "Weigh a tough decision by mapping the immediate and long-term benefits and costs of acting vs. staying the same.",
    category: "Decision-Making",
    tags: ["decision-making", "reflection", "trade-offs"],
    estimatedMinutes: 15,
    component: DecisionGrid,
  },
  {
    slug: "as-if-exercise",
    title: "'As If' Presentation Exercise",
    description:
      "A Stanislavski-style theatre technique — deliver your text as if you were in a completely different scenario, and notice the shift.",
    category: "Public Speaking",
    tags: ["presenting", "confidence", "rehearsal"],
    estimatedMinutes: 15,
    component: AsIfExercise,
  },
  {
    slug: "walk-and-talk",
    title: "Walk and Talk",
    description:
      "Rehearse a speech with movement tied to punctuation — sharper articulation, pacing, and recall.",
    category: "Public Speaking",
    tags: ["presenting", "rehearsal", "movement"],
    estimatedMinutes: 12,
    component: WalkAndTalk,
  },
  {
    slug: "high-standards-check-in",
    title: "High Standards Check-In",
    description:
      "Audit the standards you hold across life areas — adjust the ones that are unrealistic or inflexible.",
    category: "Beliefs & Thinking",
    tags: ["perfectionism", "self-awareness", "balance"],
    estimatedMinutes: 15,
    component: HighStandards,
  },
  {
    slug: "perfectionism-hub",
    title: "Perfectionism: A Practical Guide",
    description:
      "A hub of mindsets, busters, affirmations, and a personal script for working with perfectionism.",
    category: "Beliefs & Thinking",
    tags: ["perfectionism", "anxiety", "self-awareness"],
    estimatedMinutes: 20,
    component: PerfectionismInfo,
  },
  {
    slug: "ethical-dilemmas",
    title: "Ethical Dilemmas",
    description:
      "Work a hard choice from gut instinct to reasoned decision — consequences, values, and stakeholders.",
    category: "Decision-Making",
    tags: ["ethics", "values", "decision-making"],
    estimatedMinutes: 15,
    component: EthicalDilemmas,
  },
  {
    slug: "bear-feedback-model",
    title: "BEAR Feedback Model",
    description:
      "Build clear, non-confrontational feedback one step at a time: Behavior, Effect, Alternative, Result.",
    category: "Communication",
    tags: ["feedback", "teamwork", "communication"],
    estimatedMinutes: 12,
    component: BearFeedback,
  },
  {
    slug: "team-alignment",
    title: "Team Alignment Session",
    description:
      "A 45-minute guided session for a team to align on goals, roles, meeting rhythm, and expectations.",
    category: "Teamwork",
    tags: ["teamwork", "goals", "alignment"],
    estimatedMinutes: 45,
    component: TeamAlignment,
  },
  {
    slug: "must-should-could",
    title: "Must Do, Should Do, Could Do",
    description:
      "Sort everything on your plate into three levels of importance in 10 minutes flat.",
    category: "Prioritization",
    tags: ["prioritization", "planning", "focus"],
    estimatedMinutes: 10,
    component: MustShouldCould,
  },
  {
    slug: "enhanced-to-do-list",
    title: "Enhanced To-Do List",
    description:
      "A to-do list with priorities and time estimates — then compare estimated vs. actual time.",
    category: "Productivity",
    tags: ["planning", "time-management", "productivity"],
    estimatedMinutes: 12,
    component: EnhancedTodo,
  },
  {
    slug: "actioning-and-objectives",
    title: "Actioning and Objectives",
    description:
      "An acting technique for presentations: give every section an objective and every point an action verb.",
    category: "Public Speaking",
    tags: ["presenting", "rehearsal", "delivery"],
    estimatedMinutes: 20,
    component: ActioningObjectives,
  },
  {
    slug: "wheel-of-hult",
    title: "Wheel of Hult",
    description:
      "Rate eight areas of student life, then spend a limited pot of 35 focus points across them to decide what gets your attention next month.",
    category: "Student Life",
    tags: ["balance", "priorities", "focus", "trade-offs", "student-life"],
    estimatedMinutes: 20,
    component: WheelOfHult,
  },
];

export const getExercise = (slug: string) => EXERCISES.find((e) => e.slug === slug);

export const getCategories = () => Array.from(new Set(EXERCISES.map((e) => e.category))).sort();
