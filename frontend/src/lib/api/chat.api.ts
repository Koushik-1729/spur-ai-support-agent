const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE_URL = RAW_API_URL.replace(/\/+$/, ''); // Remove trailing slashes

export interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
}

export interface SendMessageResponse {
    reply: string;
    sessionId: string;
    timestamp: string;
}

export interface HistoryResponse {
    sessionId: string;
    messages: Message[];
}

export interface ApiError {
    error: string;
    type: string;
}

export async function sendMessage(
    message: string,
    sessionId?: string
): Promise<SendMessageResponse> {
    const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, sessionId }),
    });

    if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
}

export async function getHistory(sessionId: string): Promise<HistoryResponse> {
    const response = await fetch(`${API_BASE_URL}/chat/history/${sessionId}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Conversation not found');
        }
        const error: ApiError = await response.json();
        throw new Error(error.error || 'Failed to load history');
    }

    return response.json();
}
