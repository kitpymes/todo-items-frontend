export interface TodoItem {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;    // ISO String para facilitar el manejo con APIs
  progress: number;
  completed: boolean;
};
