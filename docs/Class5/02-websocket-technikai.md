# WebSocket - Technikai dokumentáció

## Architektúra áttekintés

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│                 │         (ws://)            │                 │
│  Angular App    │◄─────────────────────────►│  Node.js Server │
│  (port 4200)    │                            │  (port 3001)    │
│                 │                            │                 │
│  ┌───────────┐  │                            │  ┌───────────┐  │
│  │WebSocket  │  │                            │  │    ws     │  │
│  │Service    │  │                            │  │  könyvtár │  │
│  │(RxJS)     │  │                            │  │           │  │
│  └───────────┘  │                            │  └───────────┘  │
└─────────────────┘                            └─────────────────┘
```

## Szerver oldal: Node.js + ws

### Miért a `ws` könyvtárat választottuk?

| Szempont | ws | Socket.IO |
|----------|-----|-----------|
| Méret | ~50KB | ~300KB |
| Protokoll | Natív WebSocket | Saját protokoll |
| Komplexitás | Egyszerű | Több funkció |
| Tanulási görbe | Alacsony | Közepes |

### Szerver struktúra

```
server/
├── websocket-server.js    # Fő szerver fájl
└── package.json           # Függőségek
```

### Alapvető szerver kód magyarázata

```javascript
const { WebSocketServer } = require('ws');

// WebSocket szerver létrehozása a 3001-es porton
const wss = new WebSocketServer({ port: 3001 });

// Csatlakozott kliensek nyilvántartása
const clients = new Map();

wss.on('connection', (ws) => {
  // Új kliens csatlakozott
  const clientId = generateId();
  clients.set(clientId, ws);

  ws.on('message', (data) => {
    // Üzenet érkezett egy klienstől
    const message = JSON.parse(data);

    // Broadcast: küldés minden kliensnek
    broadcast(message);
  });

  ws.on('close', () => {
    // Kliens lecsatlakozott
    clients.delete(clientId);
  });
});
```

### Üzenet típusok

```typescript
// Közös üzenet interfész
interface ChatMessage {
  type: 'chat' | 'join' | 'leave' | 'system';
  username: string;
  content: string;
  timestamp: number;
}
```

## Kliens oldal: Angular + RxJS

### Miért RxJS WebSocket?

Az Angular alkalmazások már használják az RxJS-t, így a `webSocket` operátor természetes választás:

```typescript
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
```

**Előnyök:**
- Observable-alapú API
- Automatikus JSON szerializáció
- Beépített újracsatlakozás támogatás
- Ismerős RxJS operátorok használhatók

### Service struktúra

```typescript
@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket$: WebSocketSubject<ChatMessage>;

  // Signal-alapú állapotkezelés
  private _messages = signal<ChatMessage[]>([]);
  private _connectionStatus = signal<'connected' | 'disconnected' | 'error'>('disconnected');

  // Publikus readonly hozzáférés
  messages = this._messages.asReadonly();
  connectionStatus = this._connectionStatus.asReadonly();
}
```

### Kapcsolódás kezelése

```typescript
connect(username: string): void {
  this.socket$ = webSocket({
    url: 'ws://localhost:3001',
    openObserver: {
      next: () => {
        this._connectionStatus.set('connected');
        // Csatlakozási üzenet küldése
        this.send({ type: 'join', username, content: '', timestamp: Date.now() });
      }
    },
    closeObserver: {
      next: () => {
        this._connectionStatus.set('disconnected');
      }
    }
  });

  // Feliratkozás a bejövő üzenetekre
  this.socket$.subscribe({
    next: (message) => {
      this._messages.update(msgs => [...msgs, message]);
    },
    error: (err) => {
      this._connectionStatus.set('error');
    }
  });
}
```

### Üzenet küldése

```typescript
send(message: ChatMessage): void {
  if (this.socket$) {
    this.socket$.next(message);
  }
}
```

## Komponens integráció

### Chat komponens

```typescript
@Component({
  selector: 'app-chat',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (wsService.connectionStatus() === 'disconnected') {
      <!-- Bejelentkezési form -->
    } @else {
      <!-- Chat felület -->
      @for (msg of wsService.messages(); track msg.timestamp) {
        <div class="message">{{ msg.username }}: {{ msg.content }}</div>
      }
    }
  `
})
export class ChatComponent {
  wsService = inject(WebSocketService);
}
```

## Hibakezelés

### Szerver oldali

```javascript
ws.on('error', (error) => {
  console.error('WebSocket hiba:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  wss.close(() => {
    console.log('Szerver leállítva');
  });
});
```

### Kliens oldali

```typescript
// Automatikus újracsatlakozás
this.socket$.pipe(
  retry({
    count: 3,
    delay: 1000
  })
).subscribe();
```

## Futtatás

### 1. Függőségek telepítése

```bash
# Gyökér mappában
npm install ws
```

### 2. Szerverek indítása

```bash
# Terminal 1: WebSocket szerver
node server/websocket-server.js

# Terminal 2: Angular dev server
npm start
```

### 3. Tesztelés

Nyiss meg két böngésző ablakot a `http://localhost:4200/chat` címen és próbáld ki a kommunikációt.

## Biztonsági megfontolások

### Fejlesztési környezetben

- `ws://` protokoll használata (nem titkosított)
- Nincs autentikáció
- CORS nincs korlátozva

### Éles környezetben (javaslatok)

- `wss://` protokoll használata (TLS titkosítás)
- Token-alapú autentikáció a handshake során
- Rate limiting
- Input validáció
- CORS beállítások

## Hibakeresés

### Chrome DevTools

1. Nyisd meg a DevTools-t (F12)
2. Network fül → WS szűrő
3. Kattints a WebSocket kapcsolatra
4. Messages fülön láthatod az üzeneteket

### Gyakori hibák

| Hiba | Ok | Megoldás |
|------|-----|----------|
| `Connection refused` | Szerver nem fut | Indítsd el a szervert |
| `CORS error` | Rossz origin | Ellenőrizd a szerver CORS beállításait |
| `JSON parse error` | Hibás üzenet formátum | Ellenőrizd az üzenet struktúrát |

## Összefoglalás

Ez a megoldás egy egyszerű, de teljes WebSocket implementációt mutat be:

- **Szerver**: Node.js + ws könyvtár
- **Kliens**: Angular + RxJS webSocket
- **Állapotkezelés**: Angular Signals
- **Üzenet formátum**: JSON

A következő lépés az implementáció elkészítése.
