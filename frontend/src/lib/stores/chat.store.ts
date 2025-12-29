import { writable, derived } from 'svelte/store';
import { sendMessage, getHistory, type Message } from '../api/chat.api.js';
import { socketService } from '../api/socket.service.js';

// Session ID storage key
const SESSION_STORAGE_KEY = 'spur_chat_session_id';

// Get session ID from localStorage
function getStoredSessionId(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(SESSION_STORAGE_KEY);
    }
    return null;
}

// Store session ID in localStorage
function storeSessionId(sessionId: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
}

// Chat state
interface ChatState {
    messages: Message[];
    sessionId: string | null;
    isLoading: boolean;
    isTyping: boolean;
    error: string | null;
    initialized: boolean;
    streamingText: string;
    useStreaming: boolean;
}

const initialState: ChatState = {
    messages: [],
    sessionId: null,
    isLoading: false,
    isTyping: false,
    error: null,
    initialized: false,
    streamingText: '',
    useStreaming: true,
};

function createChatStore() {
    const { subscribe, set, update } = writable<ChatState>(initialState);

    return {
        subscribe,

        // Initialize store - load history if session exists
        async init() {
            const storedSessionId = getStoredSessionId();

            // Connect WebSocket
            socketService.connect();

            if (storedSessionId) {
                update((state) => ({ ...state, isLoading: true }));

                try {
                    const history = await getHistory(storedSessionId);
                    update((state) => ({
                        ...state,
                        messages: history.messages,
                        sessionId: history.sessionId,
                        isLoading: false,
                        initialized: true,
                    }));
                } catch {
                    // Session not found or expired - start fresh
                    update((state) => ({
                        ...state,
                        isLoading: false,
                        initialized: true,
                    }));
                }
            } else {
                update((state) => ({ ...state, initialized: true }));
            }
        },

        // Send a message with streaming support
        async send(text: string) {
            if (!text.trim()) return;

            let currentState: ChatState = initialState;
            update((state) => {
                currentState = state;
                return state;
            });

            // Add optimistic user message
            const tempUserMessage: Message = {
                id: `temp-${Date.now()}`,
                sender: 'user',
                text: text.trim(),
                timestamp: new Date().toISOString(),
            };

            update((state) => ({
                ...state,
                messages: [...state.messages, tempUserMessage],
                isTyping: true,
                error: null,
                streamingText: '',
            }));

            // Try streaming first if enabled
            if (currentState.useStreaming) {
                socketService.sendMessage(
                    text.trim(),
                    currentState.sessionId,
                    {
                        onChunk: (chunk) => {
                            update((state) => ({
                                ...state,
                                streamingText: state.streamingText + chunk,
                            }));
                        },
                        onComplete: (aiMessage) => {
                            update((state) => ({
                                ...state,
                                messages: [
                                    ...state.messages,
                                    {
                                        id: aiMessage.id,
                                        sender: 'ai' as const,
                                        text: aiMessage.text,
                                        timestamp: aiMessage.timestamp,
                                    },
                                ],
                                isTyping: false,
                                streamingText: '',
                            }));
                        },
                        onError: async (error) => {
                            // Fallback to REST API
                            await this.sendWithRest(text, currentState.sessionId, tempUserMessage);
                        },
                        onTypingStart: () => {
                            update((state) => ({ ...state, isTyping: true }));
                        },
                        onTypingStop: () => {
                            update((state) => ({ ...state, isTyping: false }));
                        },
                    }
                );
            } else {
                await this.sendWithRest(text, currentState.sessionId, tempUserMessage);
            }
        },

        // Fallback REST API send
        async sendWithRest(text: string, sessionId: string | null, tempUserMessage: Message) {
            try {
                const response = await sendMessage(text.trim(), sessionId || undefined);

                const aiMessage: Message = {
                    id: `ai-${Date.now()}`,
                    sender: 'ai',
                    text: response.reply,
                    timestamp: response.timestamp,
                };

                update((state) => ({
                    ...state,
                    messages: [...state.messages.slice(0, -1),
                    { ...tempUserMessage, id: `user-${Date.now()}` },
                        aiMessage
                    ],
                    sessionId: response.sessionId,
                    isTyping: false,
                }));

                storeSessionId(response.sessionId);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to send message';

                update((state) => ({
                    ...state,
                    messages: state.messages.slice(0, -1),
                    isTyping: false,
                    error: errorMessage,
                }));
            }
        },

        // Toggle streaming mode
        toggleStreaming() {
            update((state) => ({ ...state, useStreaming: !state.useStreaming }));
        },

        // Clear error
        clearError() {
            update((state) => ({ ...state, error: null }));
        },

        // Clear chat and start new session
        clearChat() {
            if (typeof window !== 'undefined') {
                localStorage.removeItem(SESSION_STORAGE_KEY);
            }
            set({ ...initialState, initialized: true });
        },
    };
}

export const chatStore = createChatStore();

// Derived stores for convenience
export const messages = derived(chatStore, ($store) => $store.messages);
export const isLoading = derived(chatStore, ($store) => $store.isLoading);
export const isTyping = derived(chatStore, ($store) => $store.isTyping);
export const error = derived(chatStore, ($store) => $store.error);
export const initialized = derived(chatStore, ($store) => $store.initialized);
export const streamingText = derived(chatStore, ($store) => $store.streamingText);
export const useStreaming = derived(chatStore, ($store) => $store.useStreaming);
