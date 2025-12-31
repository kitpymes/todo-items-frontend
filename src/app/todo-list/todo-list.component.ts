import { Component, inject, OnInit, signal } from '@angular/core';
import { TodoListStore } from './todo-list.store';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Progression, TodoItem, TodoList } from './todo-list.model';

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

  isTodoListCreating = signal<boolean>(false);
  editingTodoListId = signal<string | null>(null);
  newTodoListBuffer = { title: '', description: '' };
  editTodoListBuffer = { title: '', description: '', originalTitle: '', originalDescription: '' };

  isTodoItemCreating = signal<boolean>(false);
  editingTodoItemId = signal<number | null>(null);
  newTodoItemBuffer = { title: '', category: 'Normal', description: '' };
  editTodoItemBuffer = { title: '', description: '', originalTitle: '', originalDescription: '' };

  ngOnInit() {
    this.store.loadAllTodoList();
  }

  startCreationTodoList() {
    this.newTodoListBuffer = { title: '', description: '' };
    this.isTodoListCreating.set(true);
    this.store.selectProject('');
  }

  confirmCreationTodoList() {
    if (this.newTodoListBuffer.title.trim()) {
      this.store.createTodoList(this.newTodoListBuffer);
      this.isTodoListCreating.set(false);
    }
  }

  startEditTodoList(project: TodoList) {
    this.editTodoListBuffer = { title: project.title, description: project.description || '', originalTitle: project.title, originalDescription: project.description || '' };
    this.editingTodoListId.set(project.id);
  }

  confirmEditTodoList(id: string) {
    this.store.updateTodoList({ todoListId: id, request: { title: this.editTodoListBuffer.title, description: this.editTodoListBuffer.description } });

    this.cancelEdit();
  }

  // --- Lógica de Tareas ---
  startCreationTodoItem() {
    this.newTodoItemBuffer = { title: '', category: 'Normal', description: '' };
    this.isTodoItemCreating.set(true);
    this.editingTodoItemId.set(null);
  }

  confirmCreationTodoItem(projectId: string) {
    if (this.newTodoItemBuffer.title.trim()) {
      this.store.createTodoItem({
        todoListId: projectId,
        request: this.newTodoItemBuffer
      });
      this.isTodoItemCreating.set(false);
    }
  }

  startEditTodoItem(item: TodoItem) {
    this.editTodoItemBuffer = { title: item.title, description: item.description || '', originalTitle: item.title, originalDescription: item.description || '' };
    this.editingTodoItemId.set(item.id);
  }

  confirmEditTodoItem(projectId: string, taskId: number) {
    const hasEditTitle = this.editTodoItemBuffer.title.trim() !== '' && this.editTodoItemBuffer.title !== this.editTodoItemBuffer.originalTitle;
    const hasEditDescription = this.editTodoItemBuffer.description.trim() !== '' && this.editTodoItemBuffer.description !== this.editTodoItemBuffer.originalDescription;

    this.store.updateTodoItem({ todoListId: projectId, todoItemId: taskId, request: { title: this.editTodoItemBuffer.title, description: this.editTodoItemBuffer.description } });

    this.cancelEdit();
  }

  cancelEdit() {
    this.editingTodoListId.set(null);
    this.editingTodoItemId.set(null);
    this.newTodoListBuffer = { title: '', description: '' };
    this.newTodoItemBuffer = { title: '', category: '', description: '' };
    this.editTodoListBuffer = { title: '', description: '', originalTitle: '', originalDescription: '' };
    this.editTodoItemBuffer = { title: '', description: '', originalTitle: '', originalDescription: '' };
    this.isTodoListCreating.set(false);
    this.isTodoItemCreating.set(false);
  }


  createProgressionTodoItem(projectId: string, taskId: number, value: string, inputElement: HTMLInputElement) {
  // 1. Convertir a número
  const hitoValue = parseInt(value, 10);

  // 2. Obtener el item para validar el límite
  const item = this.store.selectedProject()?.items.find(i => i.id === taskId);
  if (!item || isNaN(hitoValue) || hitoValue <= 0) return;

  const currentTotal = this.getLatestProgress(item.progression)?.percent || 0;

  // 3. Ajustar al máximo de 100
  let allowedValue = hitoValue;
  if (currentTotal + hitoValue > 100) {
    allowedValue = 100 - currentTotal;
  }

  if (allowedValue > 0) {
    this.store.createProgressionTodoItem({
      todoListId: projectId,
      todoItemId: taskId,
      percent: allowedValue
    });

    // 4. Resetear el input manualmente
    inputElement.value = '';
  }
}


  // onProgressChange(id: number, event: Event) {
  //   const value = (event.target as HTMLInputElement).value;
  //   this.store.updateProgress(id, Number(value));
  // }



validateHitoInput(event: Event, item: TodoItem) {
  const input = event.target as HTMLInputElement;
  const stats = this.getLatestProgress(item.progression);
  const currentPercent = stats?.percent || 0;
  const remaining = 100 - currentPercent;

  let value = parseInt(input.value, 10);

  // 1. Si el valor es mayor al permitido, lo forzamos al límite
  if (value > remaining) {
    input.value = remaining.toString();
  }

  // 2. Si el valor es negativo, lo forzamos a 1 (o vacío)
  if (value < 0) {
    input.value = '1';
  }
}

  getLatestProgress(progression: Progression[]): { date: string, percent: number } | null {
    const result = progression.reduce((acc, current) => {
      // 1. Sumamos el porcentaje actual al acumulado
      acc.totalPercent += current.percent;

      // 2. Comparamos milisegundos para mantener la fecha más reciente
      const accTime = new Date(acc.maxDate).getTime();
      const currentTime = new Date(current.date).getTime();

      if (currentTime > accTime) {
        acc.maxDate = current.date;
      }

      return acc;
    }, {
      maxDate: progression[0]?.date,
      totalPercent: 0
    });

    // Limitamos el total al 100% para evitar errores visuales en la barra de progreso
    const finalPercent = result.totalPercent == 100 ? 100 : result.totalPercent;

    return {
      date: result.maxDate,
      percent: finalPercent || 0
    };
  }
}
