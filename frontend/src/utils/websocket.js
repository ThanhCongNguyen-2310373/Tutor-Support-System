import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log('🔌 WebSocket already connected');
      return;
    }

    const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:3000';

    this.socket = io(`${WS_URL}/notifications`, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id);
    });

    this.socket.on('connection:success', (data) => {
      console.log('✅ Connection success:', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('🔌 WebSocket disconnected');
    }
  }

  on(event, callback) {
    if (!this.socket) {
      console.warn('⚠️ WebSocket not connected');
      return;
    }

    this.socket.on(event, callback);
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) {
      return;
    }

    this.socket.off(event, callback);

    // Remove from stored listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (!this.socket) {
      console.warn('⚠️ WebSocket not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();
