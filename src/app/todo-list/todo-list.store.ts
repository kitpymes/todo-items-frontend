// src/app/store/todo.store.ts
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { TodoListService } from './todo-list.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, lastValueFrom, of, pipe, switchMap, tap } from 'rxjs';
import { CreateProgressionRequest, CreateTodoItemRequest, CreateTodoListRequest, Progression, TodoItem, TodoList, UpdateTodoItemRequest, UpdateTodoListRequest } from './todo-list.model';
import { NotificationService } from '../core/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

type TodoState = {
  projects: TodoList[];
  loading: boolean;
  selectedId: string | null;
};

const initialState: TodoState = {
  projects: [],
  loading: false,
  selectedId: null
};

// Definimos la forma del estado
export const TodoListStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ projects, selectedId }) => ({
    selectedProject: computed(() =>
      projects()?.find(p => p.id === selectedId()) || null
    ),
    projectsCount: computed(() => projects().length),
    allCategories: computed(() => {
      const categories = projects().flatMap(p => p.items.map(i => i.category));
      return [...new Set(categories)];
    })
    /*
    totalProgress: computed((itemId: number) => {
      const list = items();
      return list.length ? Math.round(list.reduce((acc, t) => acc + t.progress, 0) / list.length) : 0;
    }),
    count: computed(() => items().length)
    */
  })),

  withMethods((store, todoListService = inject(TodoListService), notify = inject(NotificationService)) => ({
    selectProject: (id: string) => patchState(store, { selectedId: id }),

    loadAllTodoList: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          todoListService.getAllTodoList().pipe(
            tap({
              next: (result) => {
                if (result.isSuccess) {
                  patchState(store, { projects: result.data });
                  notify.success('Datos sincronizados correctamente');
                } else {
                  const error = result.message ? result.message : result.errors ? result.errors.join(', ') : 'Error desconocido';
                  notify.error(error);
                }
              },
              complete: () => patchState(store, { loading: false })
            }),
            catchError((res: HttpErrorResponse) => {
              const error = res.error.Message ? res.error.Message : res.error;
              notify.error(error);
              return of(null);
            })
          )
        )
      )
    ),

    createTodoList: rxMethod<CreateTodoListRequest>(
      pipe(
        switchMap((request) => todoListService.createTodoList(request).pipe(
          tap({
            next: (result) => {
              if (result.isSuccess) {
                patchState(store, {
                  projects: [...store.projects(),
                  <TodoList>{
                    id: result.data,
                    title: request.title,
                    description: request.description,
                    items: []
                  }]
                });
                notify.success('Proyecto creado correctamente');
              } else {
                const error = result.message ? result.message : result.errors ? result.errors.join(', ') : 'Error desconocido';
                notify.error(error);
              }
            },
            complete: () => patchState(store, { loading: false })
          }),
          catchError((res: HttpErrorResponse) => {
            const error = res.error.Message ? res.error.Message : res.error;
            notify.error(error);
            return of(null);
          })
        ))
      )
    ),

    updateTodoList: rxMethod<{ todoListId: string, request: Partial<UpdateTodoListRequest> }>(
      pipe(
        switchMap(({ todoListId, request }) => todoListService.updateTodoList(todoListId, request).pipe(
          tap({
            next: (result) => {
              if (result.isSuccess) {
                patchState(store, (state) => ({
                  projects: state.projects.map(p => p.id === todoListId ? {
                    ...p, title: request.title ?? p.title,
                    description: request.description ?? p.description,
                  } : p)
                }));
                notify.success('Proyecto actualizado correctamente');
              } else {
                const error = result.message ? result.message : result.errors ? result.errors.join(', ') : 'Error desconocido';
                notify.error(error);
              }
            },
            complete: () => patchState(store, { loading: false })
          }),
          catchError((res: HttpErrorResponse) => {
            const error = res.error.Message ? res.error.Message : res.error;
            notify.error(error);
            return of(null);
          })
        ))
      )
    ),

    createTodoItem: rxMethod<{ todoListId: string, request: CreateTodoItemRequest }>(
      pipe(
        switchMap(({ todoListId, request }) => todoListService.createTodoItem(todoListId, request).pipe(
          tap({
            next: (result) => {
              if (result.isSuccess) {
                patchState(store, {
                  projects: store.projects().map(p => p.id === todoListId
                    ? {
                      ...p, items: [...p.items, <TodoItem>{
                        id: result.data,
                        title: request.title,
                        description: request.description,
                        category: request.category,
                        date: new Date().toISOString(),
                        progression: []
                      }]
                    }
                    : p)
                });
                notify.success('Tarea creada correctamente');
              } else {
                const error = result.message ? result.message : result.errors ? result.errors.join(', ') : 'Error desconocido';
                notify.error(error);
              }
            },
            complete: () => patchState(store, { loading: false })
          }),
          catchError((res: HttpErrorResponse) => {
            const error = res.error.Message ? res.error.Message : res.error;
            notify.error(error);
            return of(null);
          })
        ))
      )
    ),

    updateTodoItem: rxMethod<{ todoListId: string, todoItemId: number, request: Partial<UpdateTodoItemRequest> }>(
      pipe(
        switchMap(({ todoListId, todoItemId, request }) => todoListService.updateTodoItem(todoListId, todoItemId, request).pipe(
          tap({
            next: (result) => {
              if (result.isSuccess) {
                patchState(store, (state) => ({
                  projects: state.projects.map(p => p.id === todoListId
                    ? {
                      ...p,
                      items: p.items.map(i => i.id === todoItemId
                        ? {
                          ...i,
                          title: request.title ?? i.title,
                          description: request.description ?? i.description,
                          category: i.category
                        }
                        : i)
                    }
                    : p)
                }));
                notify.success('Tarea actualizada correctamente');
              } else {
                const error = result.message ? result.message : result.errors ? result.errors.join(', ') : 'Error desconocido';
                notify.error(error);
              }
            },
            complete: () => patchState(store, { loading: false })
          }),
          catchError((res: HttpErrorResponse) => {
            const error = res.error.Message ? res.error.Message : res.error;
            notify.error(error);
            return of(null);
          })
        ))
      )
    ),

    deleteTodoItem: rxMethod<{ todoListId: string, todoItemId: number }>(
      pipe(
        switchMap(({ todoListId, todoItemId }) => todoListService.deleteTodoItem(todoListId, todoItemId).pipe(
          tap({
            next: (result) => {
              if (result.isSuccess) {
                patchState(store, {
                  projects: store.projects().map(p => p.id === todoListId ? { ...p, items: p.items.filter(i => i.id !== todoItemId) } : p)
                });
                notify.success('Tarea eliminada correctamente');
              } else {
                const error = result.message ? result.message : result.errors ? result.errors.join(', ') : 'Error desconocido';
                notify.error(error);
              }
            },
            complete: () => patchState(store, { loading: false })
          }),
          catchError((res: HttpErrorResponse) => {
            const error = res.error.Message ? res.error.Message : res.error;
            notify.error(error);
            return of(null);
          })
        ))
      )
    ),

    createProgressionTodoItem: rxMethod<{ todoListId: string, todoItemId: number, percent: number }>(
      pipe(
        switchMap(({ todoListId, todoItemId, percent }) => {
          const newProgression: CreateProgressionRequest = {
            percent,
            date: new Date().toISOString()
          };

          return todoListService.createProgressionTodoItem(todoListId, todoItemId, newProgression).pipe(
            tap({
              next: (result) => {
                if (result.isSuccess) {
                  patchState(store, (state) => ({
                    projects: state.projects.map(p => p.id === todoListId
                      ? {
                        ...p,
                        items: p.items.map(i => {
                          if (i.id === todoItemId) {
                            const currentSum = i.progression.reduce((s, h) => s + h.percent, 0);
                            // Solo añadimos si la suma previa es menor a 100
                            if (currentSum < 100) {
                              const allowed = Math.min(percent, 100 - currentSum);
                              return { ...i, progression: [...i.progression, { ...newProgression, percent: allowed }] };
                            }
                          }
                          return i;
                        })
                      }
                      : p)
                  }));
                  notify.success('Progreso actualizado');
                } else {
                  const error = result.message ? result.message : result.errors ? result.errors.join(', ') : 'Error desconocido';
                  notify.error(error);
                }
              },
              complete: () => patchState(store, { loading: false })
            }),
            catchError((res: HttpErrorResponse) => {
              const error = res.error.Message ? res.error.Message : res.error;
              notify.error(error);
              return of(null);
            })
          );
        })
      )
    )

  }))
);
