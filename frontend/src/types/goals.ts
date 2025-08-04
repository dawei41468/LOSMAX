export type GoalCategory = "Family" | "Work" | "Health" | "Personal"; // Matching backend constants

export type GoalStatus = 'active' | 'completed';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  status: GoalStatus;
  target_date: string; // ISO string from API
  completed_at?: string; // ISO string from API
  created_at: string; // ISO string from API
  updated_at: string; // ISO string from API
  days_remaining?: number; // To be calculated client-side
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  category: GoalCategory;
  target_date: string; // ISO string
  status?: GoalStatus; // Optional, backend defaults to active
}

export type UpdateGoalPayload = Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'days_remaining'>>;