import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnDestroy,
  ElementRef,
  viewChild,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { WebSocketService } from './websocket.service';
import { ChatMessage } from './chat.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.html',
  styleUrl: './chat.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe],
})
export class ChatComponent implements OnDestroy {
  protected readonly wsService = inject(WebSocketService);

  // Form mezők
  protected readonly username = signal('');
  protected readonly messageInput = signal('');

  // Template reference az automatikus görgetéshez
  private readonly messagesContainer = viewChild<ElementRef<HTMLElement>>('messagesContainer');

  constructor() {
    // Automatikus görgetés új üzenet érkezésekor
    effect(() => {
      const messages = this.wsService.messages();
      if (messages.length > 0) {
        this.scrollToBottom();
      }
    });
  }

  ngOnDestroy(): void {
    this.wsService.disconnect();
  }

  /**
   * Csatlakozás a chat szobához
   */
  protected join(): void {
    const name = this.username().trim();
    if (name) {
      this.wsService.connect(name);
    }
  }

  /**
   * Kilépés a chat szobából
   */
  protected leave(): void {
    this.wsService.disconnect();
  }

  /**
   * Üzenet küldése
   */
  protected sendMessage(): void {
    const message = this.messageInput().trim();
    if (message) {
      this.wsService.sendMessage(message);
      this.messageInput.set('');
    }
  }

  /**
   * Enter billentyű kezelése az üzenet inputban
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Üzenet CSS osztályának meghatározása
   */
  protected getMessageClass(message: ChatMessage): string {
    if (message.type === 'system') {
      return 'message message--system';
    }
    if (message.username === this.wsService.currentUser()) {
      return 'message message--own';
    }
    return 'message message--other';
  }

  /**
   * Görgetés az üzenetek aljára
   */
  private scrollToBottom(): void {
    const container = this.messagesContainer()?.nativeElement;
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 0);
    }
  }
}
