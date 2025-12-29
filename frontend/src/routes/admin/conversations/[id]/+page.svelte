<script lang="ts">
    import { api } from '$lib/api';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    interface Message {
        id: string;
        sender: 'user' | 'ai';
        text: string;
        timestamp: string;
    }

    interface ConversationData {
        conversation: { id: string; createdAt: string };
        messages: Message[];
    }

    let data: ConversationData | null = null;
    let loading = true;
    let error = '';

    onMount(async () => {
        try {
            const id = $page.params.id;
            const res = await api.get<ConversationData>(`/admin/conversations/${id}`);
            data = res;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load conversation';
        } finally {
            loading = false;
        }
    });

    function formatTime(isoString: string) {
        return new Date(isoString).toLocaleString();
    }
</script>

<div class="detail-page">
    <div class="header">
        <a href="/admin/conversations" class="back-link">&larr; Back to Conversations</a>
        {#if data}
            <h1>Conversation <span class="mono">{data.conversation.id}</span></h1>
            <div class="meta">Started: {formatTime(data.conversation.createdAt)}</div>
        {/if}
    </div>

    {#if loading}
        <div class="loading">Loading conversation...</div>
    {:else if error}
        <div class="error">{error}</div>
    {:else if data}
        <div class="messages-container">
            {#each data.messages as msg}
                <div class="message {msg.sender}">
                    <div class="bubble">
                        <div class="text">{msg.text}</div>
                        <div class="time">{formatTime(msg.timestamp)}</div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .detail-page {
        max-width: 800px;
        margin: 0 auto;
    }

    .header {
        margin-bottom: 2rem;
    }

    .back-link {
        display: inline-block;
        margin-bottom: 1rem;
        color: #6b7280;
        text-decoration: none;
    }

    .back-link:hover {
        color: #111827;
    }

    h1 {
        font-size: 1.5rem;
        font-weight: bold;
        color: #111827;
        margin: 0;
    }

    .mono {
        font-family: monospace;
        color: #4b5563;
        background: #e5e7eb;
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-size: 0.9em;
    }

    .meta {
        color: #6b7280;
        margin-top: 0.5rem;
        font-size: 0.875rem;
    }

    .messages-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .message {
        display: flex;
    }

    .message.user {
        justify-content: flex-end;
    }

    .message.ai {
        justify-content: flex-start;
    }

    .bubble {
        max-width: 70%;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .message.user .bubble {
        background-color: #2563eb;
        color: white;
        border-bottom-right-radius: 0;
    }

    .message.ai .bubble {
        background-color: white;
        color: #111827;
        border-bottom-left-radius: 0;
    }

    .time {
        font-size: 0.75rem;
        margin-top: 0.5rem;
        opacity: 0.8;
    }

    .loading, .error {
        text-align: center;
        padding: 2rem;
        color: #6b7280;
    }
    
    .error {
        color: #991b1b;
    }
</style>
