import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string): void {
    if (this.socket?.connected) return;

    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    this.socket = io(baseURL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Connection lost. Trying to reconnect...');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Reconnect manually if the server disconnected us
        this.socket?.connect();
      }
    });

    // Register all existing listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function): void {
    // Add to listeners map for reconnection
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);

    // Register with socket if connected
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: Function): void {
    if (callback) {
      // Remove specific callback
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
        this.listeners.set(event, callbacks);
      }
      
      if (this.socket) {
        this.socket.off(event, callback);
      }
    } else {
      // Remove all callbacks for this event
      this.listeners.delete(event);
      
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  emit(event: string, data: any, callback?: Function): void {
    if (!this.socket || !this.socket.connected) {
      toast.error('Not connected to the server');
      return;
    }
    
    if (callback) {
      this.socket.emit(event, data, callback);
    } else {
      this.socket.emit(event, data);
    }
  }

  joinRoom(roomId: string): void {
    this.emit('join_room', { roomId });
  }

  leaveRoom(roomId: string): void {
    this.emit('leave_room', { roomId });
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;