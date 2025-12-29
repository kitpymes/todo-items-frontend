// src/app/services/todo-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, max, Observable, of } from 'rxjs';
import { TodoItem } from './todo-item/todo-item.model';
import { AppConfigService } from '../app.config.service';

@Injectable({ providedIn: 'root' })
export class TodoListService {
  private configService = inject(AppConfigService);
  private http = inject(HttpClient);
  private readonly API_URL = `${this.configService.apiUrl}/v1/todo-list`;

  getLatsDate(progressions: { date: Date, percent: number }[]) {
    const dates = progressions.map(p => new Date(p.date).getTime());
    const maxTimestamp = Math.max(...dates);
    const latestDateObject = new Date(maxTimestamp);

    return latestDateObject;
  };

  getItems(): Observable<TodoItem[]> {
    return this.http.get<any>(this.API_URL).pipe(
      map((response: {
        isSuccess: boolean,
        message: string,
        data: {
          id: string, items: any[]
        }[]
      }) => {

        return response.data[0].items.map((item: any) => {
          const latestDateObj = this.getLatsDate(item.progressions);
          return {
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category?.name || 'Sin categoría',
            date: latestDateObj ? latestDateObj.toISOString() : new Date().toISOString(),
            progress: item.totalProgress,
            completed: item.isCompleted
          } as TodoItem;
        });
      })
    );
  };

  createItem(body: Partial<TodoItem>): Observable<TodoItem> {
    return this.http.post<TodoItem>(this.API_URL, body);
  }

  updateItem(id: number, body: Partial<TodoItem>): Observable<TodoItem> {
    return this.http.patch<TodoItem>(`${this.API_URL}/${id}`, body);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
