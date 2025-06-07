import { refreshToken } from './auth';

type AuthUpdateCallback = (authenticated: boolean) => void;

export class WebSocketService {
  private socket: WebSocket | null = null;
  private onAuthUpdate: AuthUpdateCallback;
  private intentionalDisconnect: boolean = false;
  private reconnectTimeoutId: number | null = null;

  constructor(onAuthUpdate: AuthUpdateCallback) {
    this.onAuthUpdate = onAuthUpdate;
  }

  async connect(userId: string, userEmail?: string | null) { // Add userEmail as an optional parameter
    if (this.socket) {
      return;
    }

    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token available');
    }

    // Check if token is expired or about to expire (within 1 minute)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now() + 60000) {
        token = await refreshToken();
      }
    } catch (e) {
      console.warn('Token validation error:', e);
    }

    const apiUrl = new URL(import.meta.env.VITE_API_BASE_URL);
    const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    // We need to construct the WebSocket URL from the API base URL, but without the /api path
    const wsHost = apiUrl.host;
    const wsUrl = `${protocol}//${wsHost}/ws/${userId}?token=${encodeURIComponent(token)}`;
    console.log('Connecting to websocket:', wsUrl);
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = () => {
      if (userEmail) {
        console.log(`WebSocket connection established for user: ${userEmail} (ID: ${userId})`);
      } else {
        console.log(`WebSocket connection established for user ID: ${userId}`);
      }
    };

    this.socket.onmessage = (event) => {
      if (typeof event.data === 'string') {
        if (event.data === 'ping') {
          console.log('Received ping from server, sending pong.');
          this.socket?.send('pong'); // Send pong back
          return; // Do not attempt to parse "ping" as JSON
        }

        // Attempt to parse other string messages as JSON
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'auth_update') {
            this.onAuthUpdate(data.authenticated);
          }
          // Handle other structured JSON messages here
        } catch (e) {
          console.error('Failed to parse WebSocket message as JSON:', event.data, e);
        }
      } else {
        // Handle binary messages if necessary
        console.log('Received binary WebSocket message:', event.data);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = async (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      this.socket = null; // Clear the socket reference

      if (this.reconnectTimeoutId) {
        clearTimeout(this.reconnectTimeoutId);
        this.reconnectTimeoutId = null;
      }

      if (this.intentionalDisconnect) {
        this.intentionalDisconnect = false; // Reset flag for future connections
        console.log('Intentional WebSocket disconnect. Not attempting to reconnect.');
        return;
      }
      
      // If closed due to token expiration (code 1008)
      if (event.code === 1008 && event.reason && event.reason.includes('token')) {
        try {
          console.log('WebSocket closed due to token issue, attempting refresh...');
          await refreshToken();
          // If refresh is successful, the connect attempt below will use the new token.
        } catch (e) {
          console.error('Failed to refresh token after WebSocket close:', e);
          this.onAuthUpdate(false); // Signal auth failure if refresh fails
          return; // Do not attempt to reconnect if refresh fails
        }
      }
      
      // Attempt to reconnect after 5 seconds for unintentional disconnects
      console.log('WebSocket connection closed unexpectedly. Attempting to reconnect in 5 seconds...');
      // Pass userEmail to reconnect attempts as well
      this.reconnectTimeoutId = window.setTimeout(() => this.connect(userId, userEmail), 5000);
    };
  }

  disconnect() {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    if (this.socket) {
      this.intentionalDisconnect = true;
      this.socket.close();
      // this.socket = null; // Let onclose handle this
    }
  }
}