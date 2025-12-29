// src/app/components/todo-list.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { TodoListStore } from './todo-list.store';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [TodoListStore]
})
export class TodoListComponent implements OnInit {
  readonly store = inject(TodoListStore);

  ngOnInit() {
    this.store.loadAll();
  }

  onProgressChange(id: number, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.store.updateProgress(id, Number(value));
  }

updateDescription(id: number, description: string) {
  this.store.update(id, description);
}

// Hace que el textarea crezca según el contenido
adjustHeight(event: any) {
  const element = event.target;
  element.style.height = 'auto';
  element.style.height = (element.scrollHeight) + 'px';
}

getProgressColor(progress: number): string {
  if (progress === 100) return '#10b981'; // Verde éxito
  if (progress > 50) return '#6366f1';    // Indigo primario
  if (progress > 20) return '#f59e0b';    // Ámbar/Naranja
  return '#ef4444';                       // Rojo alerta
}
}
