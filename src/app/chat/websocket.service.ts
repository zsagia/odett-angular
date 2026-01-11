import { Injectable, signal, computed } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { retry, catchError } from 'rxjs/operators';
import { EMPTY, Subscription } from 'rxjs';
import { ChatMessage, ConnectionStatus, WebSocketMessage, UsersMessage } from './chat.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket$: WebSocketSubject<WebSocketMessage> | null = null;
  private subscription: Subscription | null = null;

  // Privát signal-ok az állapot tárolására
  private readonly _messages = signal<ChatMessage[]>([]);
  private readonly _onlineUsers = signal<string[]>([]);
  private readonly _connectionStatus = signal<ConnectionStatus>('disconnected');
  private readonly _currentUser = signal<string | null>(null);

  // Publikus readonly signal-ok
  readonly messages = this._messages.asReadonly();
  readonly onlineUsers = this._onlineUsers.asReadonly();
  readonly connectionStatus = this._connectionStatus.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();

  // Computed signal-ok
  readonly isConnected = computed(() => this._connectionStatus() === 'connected');
  readonly messageCount = computed(() => this._messages().length);

  /**
   * Csatlakozás a WebSocket szerverhez
   */
  connect(username: string): void {
    if (this.socket$) {
      this.disconnect();
    }

    this._connectionStatus.set('connecting');
    this._currentUser.set(username);

    this.socket$ = webSocket<WebSocketMessage>({
      url: environment.websocketUrl,
      openObserver: {
        next: () => {
          console.log('WebSocket kapcsolat létrejött');
          this._connectionStatus.set('connected');

          // Csatlakozási üzenet küldése
          this.send({
            type: 'join',
            username,
            content: '',
            timestamp: Date.now(),
          });
        },
      },
      closeObserver: {
        next: () => {
          console.log('WebSocket kapcsolat lezárva');
          this._connectionStatus.set('disconnected');
        },
      },
    });

    // Feliratkozás a bejövő üzenetekre
    this.subscription = this.socket$
      .pipe(
        retry({ count: 3, delay: 2000 }),
        catchError((error) => {
          console.error('WebSocket hiba:', error);
          this._connectionStatus.set('error');
          return EMPTY;
        })
      )
      .subscribe({
        next: (message) => this.handleMessage(message),
        error: (error) => {
          console.error('Subscription hiba:', error);
          this._connectionStatus.set('error');
        },
      });
  }

  /**
   * Bejövő üzenet feldolgozása
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log('Üzenet érkezett:', message);

    if (this.isUsersMessage(message)) {
      // Online felhasználók frissítése
      this._onlineUsers.set(message.users);
    } else {
      // Chat/system üzenet hozzáadása
      this._messages.update((msgs) => [...msgs, message]);
    }
  }

  /**
   * Type guard a UsersMessage típushoz
   */
  private isUsersMessage(message: WebSocketMessage): message is UsersMessage {
    return message.type === 'users';
  }

  /**
   * Chat üzenet küldése
   */
  sendMessage(content: string): void {
    const username = this._currentUser();
    if (!username || !content.trim()) {
      return;
    }

    this.send({
      type: 'chat',
      username,
      content: content.trim(),
      timestamp: Date.now(),
    });
  }

  /**
   * Általános üzenet küldése
   */
  private send(message: ChatMessage): void {
    if (this.socket$ && this._connectionStatus() === 'connected') {
      this.socket$.next(message);
    }
  }

  /**
   * Lecsatlakozás a szerverről
   */
  disconnect(): void {
    const username = this._currentUser();

    if (username && this.socket$ && this._connectionStatus() === 'connected') {
      // Kilépési üzenet küldése
      this.send({
        type: 'leave',
        username,
        content: '',
        timestamp: Date.now(),
      });
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }

    // Állapot visszaállítása
    this._connectionStatus.set('disconnected');
    this._currentUser.set(null);
    this._messages.set([]);
    this._onlineUsers.set([]);
  }

  /**
   * Üzenetek törlése
   */
  clearMessages(): void {
    this._messages.set([]);
  }
}
