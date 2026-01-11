# Class 5/1 - WebSocket Chat

Ez a gyakorlat egy valós idejű chat alkalmazást mutat be WebSocket technológiával.

## Fájlok

### Dokumentáció
- [01-websocket-elmelet.md](./01-websocket-elmelet.md) - Elméleti alapok
- [02-websocket-technikai.md](./02-websocket-technikai.md) - Technikai dokumentáció

### Szerver
- `server/websocket-server.js` - Node.js WebSocket szerver

### Angular kliens
- `src/app/chat/chat.model.ts` - Típusdefiníciók
- `src/app/chat/websocket.service.ts` - WebSocket szolgáltatás
- `src/app/chat/chat.ts` - Chat komponens
- `src/app/chat/chat.html` - Chat sablon
- `src/app/chat/chat.css` - Chat stílusok

## Futtatás

### 1. Terminál: WebSocket szerver indítása

```bash
npm run ws
```

Ezt fogod látni:
```
WebSocket szerver indítása a 3001 porton...
WebSocket szerver fut: ws://localhost:3001
```

### 2. Terminál: Angular alkalmazás indítása

```bash
npm start
```

### 3. Chat használata

1. Nyisd meg a böngészőben: http://localhost:4200/chat
2. Add meg a felhasználóneved
3. Kattints a "Csatlakozás" gombra
4. Nyiss meg egy másik böngésző ablakot ugyanezen a címen
5. Csatlakozz egy másik névvel
6. Küldj üzeneteket!

## Tesztelési forgatókönyvek

### Alapműveletek
- [ ] Csatlakozás felhasználónévvel
- [ ] Üzenet küldése
- [ ] Üzenet fogadása másik klienstől
- [ ] Online felhasználók listája
- [ ] Kilépés

### Speciális esetek
- [ ] Mi történik, ha a szerver nem fut? (Hibaüzenet)
- [ ] Mi történik, ha megszakad a kapcsolat? (Automatikus újracsatlakozás 3x)
- [ ] Mi történik, ha egyszerre több kliens csatlakozik?

## Architektúra

```
┌─────────────────┐                    ┌─────────────────┐
│  Browser 1      │◄──── WebSocket ───►│                 │
│  (Chat kliens)  │                    │   Node.js       │
└─────────────────┘                    │   WebSocket     │
                                       │   Server        │
┌─────────────────┐                    │   (port 3001)   │
│  Browser 2      │◄──── WebSocket ───►│                 │
│  (Chat kliens)  │                    └─────────────────┘
└─────────────────┘
```

## Tanulási pontok

1. **WebSocket alapok**: Kétirányú, állandó kapcsolat
2. **RxJS webSocket**: Observable-alapú WebSocket kezelés
3. **Angular Signals**: Reaktív állapotkezelés
4. **Type Guards**: TypeScript típusbiztonság
5. **Node.js ws**: Egyszerű WebSocket szerver
