import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTodoListRequest, AppResult, UpdateTodoListRequest, CreateTodoItemRequest, UpdateTodoItemRequest, TodoList, CreateProgressionRequest } from './todo-list.model';
import { AppConfigService } from '../app.config.service';

@Injectable({ providedIn: 'root' })
export class TodoListService {
  private configService = inject(AppConfigService);
  private http = inject(HttpClient);
  private readonly API_URL = `${this.configService.apiUrl}/v1/todo-list`;

  getAllTodoList = (): Observable<AppResult<TodoList[]>> =>
    this.http.get<AppResult<TodoList[]>>(this.API_URL);

  createTodoList = (request: CreateTodoListRequest): Observable<AppResult<string>> =>
    this.http.post<AppResult<string>>(this.API_URL, request);

  updateTodoList = (todoListId: string, request: Partial<UpdateTodoListRequest>): Observable<AppResult> =>
    this.http.put<AppResult>(`${this.API_URL}/${todoListId}`, request);

  createTodoItem = (todoListId: string, request: CreateTodoItemRequest): Observable<AppResult<number>> =>
    this.http.post<AppResult<number>>(`${this.API_URL}/${todoListId}/item`, request);

  updateTodoItem = (todoListId: string, itemId: number, request: UpdateTodoItemRequest): Observable<AppResult> =>
    this.http.put<AppResult>(`${this.API_URL}/${todoListId}/item/${itemId}`, request);

  deleteTodoItem = (todoListId: string, itemId: number): Observable<AppResult> =>
    this.http.delete<AppResult>(`${this.API_URL}/${todoListId}/item/${itemId}`);

  createProgressionTodoItem = (todoListId: string, itemId: number, request: CreateProgressionRequest): Observable<AppResult> =>
    this.http.post<AppResult>(`${this.API_URL}/${todoListId}/item/${itemId}/progression`, request);
}
