import { Component, ChangeDetectionStrategy, signal, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-websocket-exam',
  templateUrl: './websocket-exam.html',
  styleUrl: './websocket-exam.css',
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

    // Task 3: Üzenet fogadása és állapotkezelés
    this.ws.onmessage = (event) => {
      const message = event.data;

      // Minden üzenetre először kiírjuk: "Szerver válasz: <üzenet>"
      this.log(`Szerver válasz: ${message}`);

      // 3/A: Ha "OK" jön, küldünk "START"-ot
      if (message === 'OK') {
        this.ws!.send('START');
        this.log('Indítás elküldve');
      }

      // 3/B: Ha "Q:2+2" jön, küldünk "A:4"-et
      if (message === 'Q:2+2') {
        this.ws!.send('A:4');
        this.log('Válasz elküldve: 4');
      }

      // Task 4: Ha "DONE" jön, kiírjuk a sikert és lezárjuk
      if (message === 'DONE') {
        this.log('Sikeres vizsga szimuláció');
        this.ws!.close();
      }
    };
  }

  private log(message: string): void {
    this.logs.update(current => [...current, message]);
  }
}
