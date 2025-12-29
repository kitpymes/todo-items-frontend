// src/app/store/todo.store.ts
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { TodoItem } from './todo-item/todo-item.model';
import { TodoListService } from './todo-list.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { lastValueFrom, pipe, switchMap, tap } from 'rxjs';

// Definimos la forma del estado
export const TodoListStore = signalStore(
  { providedIn: 'root' },
  withState({
    items: [] as TodoItem[],
    loading: false,
    error: null as string | null,
  }),

  withComputed(({ items }) => ({
    totalProgress: computed(() => {
      const list = items();
      return list.length ? Math.round(list.reduce((acc, t) => acc + t.progress, 0) / list.length) : 0;
    }),
    count: computed(() => items().length)
  })),

  withMethods((store, todoListService = inject(TodoListService)) => ({

    // Carga inicial de datos
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() => todoListService.getItems().pipe(
          tap(items => patchState(store, { items, loading: false }))
        ))
      )
    ),

    async add(title: string) {
      const newItem = { title, date: new Date().toISOString(), progress: 0, completed: false };
      const created = await lastValueFrom(todoListService.createItem(newItem));
      if (created) {
        patchState(store, (state) => ({ items: [...state.items, created] }));
      }
    },

    async update(id: number, description: string) {
      await lastValueFrom(todoListService.updateItem(id, { description }));
      patchState(store, (state) => ({
        items: state.items.map(t => t.id === id ? { ...t, description } : t)
      }));
    },

    async updateProgress(id: number, progress: number) {
      const completed = progress === 100;
      await lastValueFrom(todoListService.updateItem(id, { progress, completed }));
      patchState(store, (state) => ({
        items: state.items.map(t => t.id === id ? { ...t, progress, completed } : t)
      }));
    },

    async remove(id: number) {
      await lastValueFrom(todoListService.deleteItem(id));
      patchState(store, (state) => ({
        items: state.items.filter(t => t.id !== id)
      }));
    }
  }))
);
