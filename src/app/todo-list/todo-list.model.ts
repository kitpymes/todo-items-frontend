import { TodoItem } from "./todo-item/todo-item.model";

export interface TodoList {
  id: string;
  items: TodoItem[];
};
