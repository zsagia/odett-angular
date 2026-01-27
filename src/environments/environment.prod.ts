export const environment = {
  production: true,
  apiUrl: 'https://your-laravel-api.com/api', // Csereld ki a production API URL-re
  // Ez a Cloud Run service URL-je lesz (wss:// mert HTTPS)
  // Cseréld ki a saját Cloud Run URL-edre!
  websocketUrl: 'wss://websocket-chat-r74tkogtpa-ew.a.run.app',
};
