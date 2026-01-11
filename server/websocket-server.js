/**
 * WebSocket Chat Server
 *
 * Egyszerű WebSocket szerver chat funkcionalitással.
 * Használat: node server/websocket-server.js
 */

const { WebSocketServer } = require('ws');

const PORT = 3001;

// WebSocket szerver létrehozása
const wss = new WebSocketServer({ port: PORT });

// Csatlakozott kliensek tárolása
const clients = new Map();

// Egyedi azonosító generálása
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Üzenet küldése minden kliensnek
function broadcast(message) {
  const messageStr = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      // WebSocket.OPEN
      client.send(messageStr);
    }
  });
}

// Üzenet küldése egy adott kliensnek
function sendToClient(ws, message) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(message));
  }
}

// Online felhasználók listája
function getOnlineUsers() {
  return Array.from(clients.values()).map((c) => c.username);
}

console.log(`WebSocket szerver indítása a ${PORT} porton...`);

wss.on('connection', (ws) => {
  const clientId = generateId();
  console.log(`Új kapcsolat: ${clientId}`);

  // Kliens tárolása (username később kerül beállításra)
  clients.set(clientId, { ws, username: null });

  // Üzenet fogadása
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`Üzenet [${clientId}]:`, message);

      switch (message.type) {
        case 'join':
          // Felhasználó csatlakozása
          clients.get(clientId).username = message.username;

          // Rendszerüzenet küldése mindenkinek
          broadcast({
            type: 'system',
            username: 'Rendszer',
            content: `${message.username} csatlakozott a chathez`,
            timestamp: Date.now(),
          });

          // Online felhasználók listájának küldése
          broadcast({
            type: 'users',
            users: getOnlineUsers(),
            timestamp: Date.now(),
          });
          break;

        case 'chat':
          // Chat üzenet továbbítása mindenkinek
          broadcast({
            type: 'chat',
            username: message.username,
            content: message.content,
            timestamp: Date.now(),
          });
          break;

        case 'leave':
          // Felhasználó kilépése
          broadcast({
            type: 'system',
            username: 'Rendszer',
            content: `${message.username} elhagyta a chatet`,
            timestamp: Date.now(),
          });
          break;

        default:
          console.log('Ismeretlen üzenet típus:', message.type);
      }
    } catch (error) {
      console.error('Üzenet feldolgozási hiba:', error);
    }
  });

  // Kapcsolat lezárása
  ws.on('close', () => {
    const client = clients.get(clientId);
    if (client && client.username) {
      broadcast({
        type: 'system',
        username: 'Rendszer',
        content: `${client.username} lecsatlakozott`,
        timestamp: Date.now(),
      });

      // Online felhasználók frissítése
      clients.delete(clientId);
      broadcast({
        type: 'users',
        users: getOnlineUsers(),
        timestamp: Date.now(),
      });
    } else {
      clients.delete(clientId);
    }
    console.log(`Kapcsolat bontva: ${clientId}`);
  });

  // Hiba kezelése
  ws.on('error', (error) => {
    console.error(`Hiba [${clientId}]:`, error);
  });

  // Üdvözlő üzenet az új kliensnek
  sendToClient(ws, {
    type: 'system',
    username: 'Rendszer',
    content: 'Üdvözöllek a chat szobában! Add meg a felhasználóneved a csatlakozáshoz.',
    timestamp: Date.now(),
  });
});

// Szerver események
wss.on('listening', () => {
  console.log(`WebSocket szerver fut: ws://localhost:${PORT}`);
});

wss.on('error', (error) => {
  console.error('Szerver hiba:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nSzerver leállítása...');
  wss.close(() => {
    console.log('Szerver leállt.');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  wss.close(() => {
    process.exit(0);
  });
});
