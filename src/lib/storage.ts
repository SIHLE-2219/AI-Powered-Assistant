export type Priority = "low" | "medium" | "high" | "urgent";
export type Task = {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  priority: Priority;
  category: string;
  progress: number;
  completed: boolean;
  createdAt: number;
};

export type EmailDoc = { id: string; title: string; subject?: string; body: string; tone: string; audience: string; createdAt: number };
export type MeetingDoc = { id: string; title: string; notes: string; summary: string; createdAt: number };
export type ResearchDoc = { id: string; topic: string; brief: string; createdAt: number };
export type ChatMsg = { id: string; role: "user" | "assistant"; content: string; createdAt: number };

export type Stats = {
  tasksCompleted: number;
  emailsGenerated: number;
  meetingsSummarized: number;
  researchSessions: number;
  hoursSaved: number;
  weekly: number[]; // last 7 days completion counts
};

export const defaultStats: Stats = {
  tasksCompleted: 0,
  emailsGenerated: 0,
  meetingsSummarized: 0,
  researchSessions: 0,
  hoursSaved: 0,
  weekly: [3, 5, 4, 7, 6, 9, 8],
};

export const priorityTone: Record<Priority, "default" | "warning" | "danger" | "info" | "success"> = {
  low: "info",
  medium: "success",
  high: "warning",
  urgent: "danger",
};

export const uid = () => Math.random().toString(36).slice(2, 10);
