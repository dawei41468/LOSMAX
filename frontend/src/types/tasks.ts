export interface Task {
  id: string;
  user_id: string;
  goal_id: string; // Tasks are tied to a specific goal
  title: string;
  status: 'completed' | 'incomplete';
  created_at: string; // ISO string
}

export interface CreateTaskPayload {
  title: string;
  goal_id: string; // Required, as tasks must be tied to a goal
}

export type UpdateTaskPayload = Partial<Omit<Task, 'id' | 'user_id' | 'goal_id' | 'created_at'>>;