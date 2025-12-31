import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class NotificationService {
private notificationSignal = signal<{ text: string; type: NotificationType } | null>(null);
 readonly message = this.notificationSignal.asReadonly();

 show(text: string, type: NotificationType = 'info') {
    this.notificationSignal.set({ text, type });
  }


  success(text: string) {
    this.show(text, 'success');

    setTimeout(() => {
      this.notificationSignal.set(null);
    }, 3000);
  }

  error(text: string) {
    this.show(text, 'error');

    setTimeout(() => {
      this.notificationSignal.set(null);
    }, 6000);
  }

  info(text: string) {
    this.show(text, 'info');

    setTimeout(() => {
      this.notificationSignal.set(null);
    }, 3000);
  }
}
