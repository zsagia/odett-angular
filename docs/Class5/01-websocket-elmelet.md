# WebSocket - Elméleti alapok

## Mi a WebSocket?

A WebSocket egy **kétirányú, állandó kapcsolatot** biztosító kommunikációs protokoll a kliens (böngésző) és a szerver között. A hagyományos HTTP kérés-válasz modellel ellentétben a WebSocket lehetővé teszi, hogy mindkét fél bármikor küldhessen üzenetet a másiknak.

## HTTP vs WebSocket

### Hagyományos HTTP (Request-Response)

```
Kliens                          Szerver
  |                                |
  |-------- HTTP Request --------->|
  |<------- HTTP Response ---------|
  |                                |
  |-------- HTTP Request --------->|
  |<------- HTTP Response ---------|
```

**Jellemzők:**
- Minden kéréshez új kapcsolat (vagy keep-alive)
- A szerver csak válaszolhat, nem kezdeményezhet
- Polling szükséges valós idejű adatokhoz

### WebSocket (Full-Duplex)

```
Kliens                          Szerver
  |                                |
  |==== WebSocket Handshake ======>|
  |<========= Upgrade =============|
  |                                |
  |<======= Állandó kapcsolat ====>|
  |                                |
  |-------- Üzenet --------------->|
  |<------- Üzenet ----------------|
  |<------- Üzenet ----------------|
  |-------- Üzenet --------------->|
```

**Jellemzők:**
- Egyetlen, állandó kapcsolat
- Kétirányú kommunikáció
- Alacsony késleltetés (latency)
- Kevesebb overhead

## WebSocket Handshake

A WebSocket kapcsolat HTTP upgrade kéréssel kezdődik:

### Kliens kérés:
```http
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```

### Szerver válasz:
```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

## Mikor használjunk WebSocket-et?

### Ideális használati esetek:

| Alkalmazás | Miért WebSocket? |
|------------|------------------|
| **Chat alkalmazások** | Azonnali üzenetküldés |
| **Valós idejű dashboard** | Folyamatos adatfrissítés |
| **Online játékok** | Alacsony latency kritikus |
| **Kollaboratív szerkesztés** | Google Docs-szerű szinkronizáció |
| **Tőzsdei adatok** | Másodpercenkénti frissítések |
| **Értesítések** | Push notifications |

### Mikor NE használjunk WebSocket-et?

- Egyszerű CRUD műveletek
- Ritkán változó adatok
- SEO-kritikus tartalom
- Egyirányú adatlekérés

## WebSocket életciklus

```
┌─────────────────────────────────────────────────────────────┐
│                    WebSocket Életciklus                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. CONNECTING ──────> 2. OPEN ──────> 3. CLOSING         │
│         │                  │                │               │
│         │                  │                │               │
│         └──────────────────┴────────────────┴───> 4. CLOSED │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Állapotok:

1. **CONNECTING (0)** - Kapcsolódás folyamatban
2. **OPEN (1)** - Kapcsolat létrejött, kommunikáció lehetséges
3. **CLOSING (2)** - Kapcsolat lezárása folyamatban
4. **CLOSED (3)** - Kapcsolat lezárva

## Események

| Esemény | Mikor történik |
|---------|----------------|
| `onopen` | Sikeres kapcsolódás |
| `onmessage` | Üzenet érkezik |
| `onerror` | Hiba történik |
| `onclose` | Kapcsolat bezárul |

## Előnyök és hátrányok

### Előnyök

- **Valós idejű kommunikáció** - Nincs szükség pollingra
- **Alacsony overhead** - Nincs HTTP header minden üzenetnél
- **Kétirányú** - Szerver is kezdeményezhet
- **Alacsony latency** - Azonnali üzenetküldés

### Hátrányok

- **Komplexitás** - Bonyolultabb, mint REST API
- **Állapotkezelés** - Kapcsolat fenntartása szükséges
- **Skálázás** - Nehezebb horizontálisan skálázni
- **Tűzfalak** - Néhány tűzfal blokkolhatja

## Alternatívák

| Technológia | Jellemző |
|-------------|----------|
| **Long Polling** | HTTP-alapú, egyszerűbb, nagyobb overhead |
| **Server-Sent Events (SSE)** | Egyirányú (szerver→kliens), HTTP-alapú |
| **WebRTC** | Peer-to-peer, video/audio |

## Összefoglalás

A WebSocket ideális választás, amikor:
- Valós idejű, kétirányú kommunikációra van szükség
- Alacsony késleltetés kritikus
- Gyakori adatfrissítések szükségesek
- A szerver is kezdeményezhet kommunikációt

A következő fejezetben a technikai implementációt nézzük meg Angular és Node.js környezetben.
