export interface TodoList {
  id: string;
  title: string;
  description: string | null;
  items: TodoItem[];
};

export interface CreateTodoListRequest {
  title: string;
  description: string | null;
};

export interface UpdateTodoListRequest {
  title?: string;
  description?: string;
};

export interface TodoItem {
  id: number;
  title: string;
  category: string;
  description: string | null;
  progression: Progression[];
};

export interface CreateTodoItemRequest {
  title: string;
  category: string;
  description: string | null;
};

export interface CreateTodoItemResponse {
  id: number;
  progression: Progression[];
};

export interface UpdateTodoItemRequest {
  title?: string;
  description?: string;
};

export interface Progression {
  date: string; // ISO Date string
  percent: number;
};

export interface CreateProgressionRequest {
  percent: number;
  date: string; // ISO String
};

export interface AppResult<T = void> {
  isSuccess: boolean;
  status: number;
  data: T;
  message: string;
  errors?: string[];
};
