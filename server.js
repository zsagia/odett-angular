const WebSocket = require("ws");

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket szerver fut: ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  console.log("Új kliens csatlakozott");

  ws.on("message", (raw) => {
    const msg = raw.toString();
    console.log("Üzenet érkezett:", msg);

    if (msg === "LOGIN:ABC123") {
      // JAVÍTVA: "NO" helyett "OK"-t küldünk
      ws.send("OK");
      return;
    }

    if (msg === "START") {
      ws.send("Q:2+2");
      return;
    }

    if (msg === "A:4") {
      ws.send("DONE");
      return;
    }

    // Echo minden más üzenetre
    ws.send(msg);
  });

  ws.on("close", () => {
    console.log("Kliens lecsatlakozott");
  });

  ws.on("error", (err) => {
    console.error("WebSocket hiba:", err);
  });
});
