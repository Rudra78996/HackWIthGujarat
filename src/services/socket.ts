import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';

type SocketCallback = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, SocketCallback[]> = new Map();
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private currentToken: string | null = null;

  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('Socket connection in progress');
      return;
    }

    this.isConnecting = true;
    this.currentToken = token;
    const baseURL = 'http://localhost:5000';
    
    let socketUrl = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    socketUrl += '/chat';

    this.socket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ['polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
      autoConnect: true,
      withCredentials: true,
      path: '/socket.io'
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully to:', socketUrl);
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      
      // Request groups data after successful connection
      this.emit('get_groups', {}, (response: any) => {
        if (response.error) {
          console.error('Error fetching groups:', response.error);
          toast.error('Failed to fetch groups');
        } else {
          console.log('Groups data received:', response);
        }
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.isConnecting = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        toast.error('Connection failed. Please refresh the page.');
        return;
      }
      
      toast.error('Connection lost. Trying to reconnect...');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnecting = false;
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        console.log('Server disconnected, attempting to reconnect...');
        this.reconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.isConnecting = false;
      toast.error('Socket error occurred');
    });

    // Add specific error handler for group data
    this.socket.on('groups_error', (error) => {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups');
    });

    // Add success handler for group data
    this.socket.on('groups', (data) => {
      console.log('Received groups data:', data);
    });

    // Add timeout handler for group requests
    this.socket.on('get_groups_timeout', () => {
      console.error('Timeout while fetching groups');
      toast.error('Timeout while fetching groups');
    });

    // Register all existing listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback);
      });
    });
  }

  private reconnect(): void {
    if (this.currentToken && !this.socket?.connected) {
      console.log('Attempting to reconnect...');
      this.connect(this.currentToken);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      this.currentToken = null;
    }
  }

  on(event: string, callback: SocketCallback): void {
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

  off(event: string, callback?: SocketCallback): void {
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

  emit(event: string, data: any, callback?: SocketCallback): void {
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
    if (!this.socket?.connected) {
      toast.error('Not connected to the server');
      return;
    }
    this.emit('join_room', { roomId });
  }

  leaveRoom(roomId: string): void {
    if (!this.socket?.connected) {
      return;
    }
    this.emit('leave_room', { roomId });
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  sendGroupMessage(groupId: string, content: string, type: 'text' | 'image' = 'text', imageUrl?: string): void {
    if (!this.socket?.connected) {
      toast.error('Not connected to the server');
      return;
    }

    this.emit('group_message', {
      groupId,
      content,
      type,
      imageUrl,
      timestamp: new Date().toISOString()
    });
  }

  joinGroup(groupId: string): void {
    if (!this.socket?.connected) {
      toast.error('Not connected to the server');
      return;
    }
    this.emit('join_group', { groupId });
  }

  leaveGroup(groupId: string): void {
    if (!this.socket?.connected) {
      return;
    }
    this.emit('leave_group', { groupId });
  }

  onGroupMessage(callback: (message: any) => void): void {
    this.on('group_message', callback);
  }

  onGroupError(callback: (error: any) => void): void {
    this.on('group_error', callback);
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;