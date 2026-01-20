import { Component, ChangeDetectionStrategy, signal, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-websocket-exam',
  template: `
    <div class="exam-container">
      <h2>WebSocket Vizsga</h2>

      <button
        type="button"
        [disabled]="isConnected()"
        (click)="connect()">
        Kapcsolódás
      </button>

      <div class="log-container">
        <h3>Napló:</h3>
        <ul>
          @for (log of logs(); track log) {
            <li>{{ log }}</li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .exam-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    .log-container {
      margin-top: 20px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    li {
      padding: 4px 0;
      font-family: monospace;
    }
    button {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
    }
    button:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebsocketExamComponent implements OnDestroy {
  protected readonly logs = signal<string[]>([]);
  protected readonly isConnected = signal(false);

  private ws: WebSocket | null = null;

  ngOnDestroy(): void {
    this.ws?.close();
  }

  connect(): void {
    // Task 1: WebSocket létrehozása
    this.ws = new WebSocket('ws://localhost:8080');

    // Task 1: onopen - "Vizsga kapcsolat OK"
    this.ws.onopen = () => {
      this.log('Vizsga kapcsolat OK');
      this.isConnected.set(true);

      // Task 2: Belépési token küldése
      this.ws!.send('LOGIN:ABC123');
      this.log('Token elküldve: ABC123');
    };

    // Task 1: onclose - "Vizsga kapcsolat vége"
    this.ws.onclose = () => {
      this.log('Vizsga kapcsolat vége');
      this.isConnected.set(false);
    };
  }

  private log(message: string): void {
    this.logs.update(current => [...current, message]);
  }
}
