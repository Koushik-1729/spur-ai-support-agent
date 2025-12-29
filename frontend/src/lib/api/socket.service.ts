import { io, Socket } from 'socket.io-client';
import { writable, get } from 'svelte/store';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_URL = RAW_API_URL.replace(/\/+$/, ''); // Remove trailing slashes

export interface StreamEvents {
    onChunk: (chunk: string) => void;
    onComplete: (message: { id: string; text: string; timestamp: string }) => void;
    onError: (error: string) => void;
    onTypingStart: () => void;
    onTypingStop: () => void;
}

class SocketService {
    private socket: Socket | null = null;
    private streamingBuffer = '';

    public connected = writable(false);
    public currentMessageId = writable<string | null>(null);

    connect(): void {
        if (this.socket?.connected) return;

        this.socket = io(API_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('WebSocket connected');
            this.connected.set(true);
        });

        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            this.connected.set(false);
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            this.connected.set(false);
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected.set(false);
        }
    }

    sendMessage(
        message: string,
        sessionId: string | null,
        events: StreamEvents
    ): void {
        if (!this.socket?.connected) {
            // Fallback to REST API if WebSocket not available
            console.warn('WebSocket not connected, using REST API');
            events.onError('Streaming not available, using standard mode');
            return;
        }

        this.streamingBuffer = '';

        // Set up event handlers
        this.socket.once('messageReceived', (data: { sessionId: string }) => {
            // Message received acknowledgment
        });

        this.socket.once('typingStart', () => {
            events.onTypingStart();
        });

        this.socket.on('streamChunk', (data: { chunk: string; messageId: string }) => {
            this.streamingBuffer += data.chunk;
            this.currentMessageId.set(data.messageId);
            events.onChunk(data.chunk);
        });

        this.socket.once('streamComplete', (data: {
            sessionId: string;
            aiMessage: { id: string; text: string; timestamp: string }
        }) => {
            events.onComplete(data.aiMessage);
            this.streamingBuffer = '';
            this.currentMessageId.set(null);
            // Clean up stream listeners
            this.socket?.off('streamChunk');
        });

        this.socket.once('typingStop', () => {
            events.onTypingStop();
        });

        this.socket.once('error', (data: { message: string }) => {
            events.onError(data.message);
            this.streamingBuffer = '';
            this.currentMessageId.set(null);
            this.socket?.off('streamChunk');
        });

        // Send the message
        this.socket.emit('sendMessage', { message, sessionId });
    }

    getCurrentBuffer(): string {
        return this.streamingBuffer;
    }
}

export const socketService = new SocketService();
