import { Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notify.message(); as msg) {
      <div class="toast-popup" [class]="msg.type">
        <span class="icon">
          @if (msg.type === 'success') { ✅ }
          @else if (msg.type === 'error') { ❌ }
          @else { ℹ️ }
        </span>
        <p>{{ msg.text }}</p>
      </div>
    }
  `,
  styleUrl: './toast.component.scss'
})
export class ToastComponent {
    readonly notify = inject(NotificationService);
}
