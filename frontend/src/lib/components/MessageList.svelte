<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import MessageBubble from './MessageBubble.svelte';
  import TypingIndicator from './TypingIndicator.svelte';
  import type { Message } from '../api/chat.api.js';

  export let messages: Message[] = [];
  export let isTyping: boolean = false;
  export let isLoading: boolean = false;

  let container: HTMLDivElement;

  // Auto-scroll to bottom when new messages arrive
  afterUpdate(() => {
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });

  onMount(() => {
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
</script>

<div class="message-list" bind:this={container}>
  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <span>Loading conversation...</span>
    </div>
  {:else if messages.length === 0}
    <div class="empty-state">
      <div class="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      </div>
      <h3>Welcome to Spur Shop Support!</h3>
      <p>Ask me anything about our products, shipping, returns, or policies.</p>
      <div class="suggestions">
        <span>Try asking:</span>
        <ul>
          <li>"What's your return policy?"</li>
          <li>"Do you ship to USA?"</li>
          <li>"What payment methods do you accept?"</li>
        </ul>
      </div>
    </div>
  {:else}
    {#each messages as message (message.id)}
      <MessageBubble 
        sender={message.sender} 
        text={message.text} 
        timestamp={message.timestamp} 
      />
    {/each}
  {/if}

  {#if isTyping}
    <TypingIndicator />
  {/if}
</div>

<style>
  .message-list {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    scroll-behavior: smooth;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    height: 100%;
    color: #666;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e0e0e0;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;
    padding: 40px 20px;
    color: #555;
  }

  .empty-state .icon {
    width: 64px;
    height: 64px;
    color: #667eea;
    margin-bottom: 16px;
    opacity: 0.8;
  }

  .empty-state .icon svg {
    width: 100%;
    height: 100%;
  }

  .empty-state h3 {
    margin: 0 0 8px 0;
    color: #1a1a2e;
    font-size: 1.25rem;
  }

  .empty-state p {
    margin: 0 0 24px 0;
    opacity: 0.8;
  }

  .suggestions {
    background: rgba(102, 126, 234, 0.08);
    padding: 16px 24px;
    border-radius: 12px;
    text-align: left;
  }

  .suggestions span {
    font-size: 0.85rem;
    color: #667eea;
    font-weight: 500;
  }

  .suggestions ul {
    margin: 8px 0 0 0;
    padding-left: 20px;
    list-style: disc;
  }

  .suggestions li {
    margin: 4px 0;
    font-size: 0.9rem;
    color: #555;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
