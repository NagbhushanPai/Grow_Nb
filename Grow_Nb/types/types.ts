export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  timestamp: string;
}

export interface FitnessLog {
  id: string;
  type: string;
  reps?: number;
  distance?: number;
  pace?: string;
  timestamp: string;
}

export interface CodingLog {
  id: string;
  learned: string;
  leetcodeProblem?: {
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    link: string;
    notes: string;
  };
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  whatHappened: string;
  gratefulFor: string[];
  mood: 'happy' | 'neutral' | 'sad';
  timestamp: string;
}
