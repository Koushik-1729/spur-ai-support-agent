<script lang="ts">
  import { onMount } from 'svelte';
  import MessageList from './MessageList.svelte';
  import ChatInput from './ChatInput.svelte';
  import {
    chatStore,
    messages,
    isLoading,
    isTyping,
    error,
    initialized,
  } from '../stores/chat.store.js';

  export let title: string = 'Spur Shop Support';
  export let subtitle: string = 'We typically reply in seconds';

  let isOpen = true;

  onMount(() => {
    chatStore.init();
  });

  function handleSend(e: CustomEvent<string>) {
    chatStore.send(e.detail);
  }

  function handleClearChat() {
    if (confirm('Are you sure you want to clear this conversation?')) {
      chatStore.clearChat();
    }
  }

  function toggleWidget() {
    isOpen = !isOpen;
  }
</script>

<div class="chat-widget" class:minimized={!isOpen}>
  {#if !isOpen}
    <button class="toggle-button" on:click={toggleWidget} aria-label="Open chat">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
    </button>
  {:else}
    <div class="widget-container">
      <header class="chat-header">
        <div class="header-info">
          <div class="avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </div>
          <div class="text">
            <h2>{title}</h2>
            <span class="status">
              <span class="dot"></span>
              {subtitle}
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button 
            class="action-btn" 
            on:click={handleClearChat} 
            title="Clear chat"
            aria-label="Clear chat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
          <button 
            class="action-btn" 
            on:click={toggleWidget} 
            title="Minimize"
            aria-label="Minimize chat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      {#if $error}
        <div class="error-banner">
          <span>{$error}</span>
          <button on:click={() => chatStore.clearError()} aria-label="Dismiss error">×</button>
        </div>
      {/if}

      <MessageList 
        messages={$messages} 
        isTyping={$isTyping} 
        isLoading={$isLoading && !$initialized}
      />

      <ChatInput 
        disabled={$isTyping} 
        on:send={handleSend}
      />
    </div>
  {/if}
</div>

<style>
  .chat-widget {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .chat-widget.minimized {
    width: auto;
    height: auto;
  }

  .toggle-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .toggle-button:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  }

  .toggle-button svg {
    width: 28px;
    height: 28px;
  }

  .widget-container {
    width: 380px;
    height: 600px;
    max-height: calc(100vh - 100px);
    background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
    border-radius: 16px;
    box-shadow: 
      0 10px 40px rgba(0, 0, 0, 0.12),
      0 0 0 1px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .header-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .avatar svg {
    width: 24px;
    height: 24px;
  }

  .text h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    opacity: 0.9;
  }

  .dot {
    width: 8px;
    height: 8px;
    background: #4ade80;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .action-btn svg {
    width: 16px;
    height: 16px;
  }

  .error-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: #fee2e2;
    color: #dc2626;
    font-size: 0.85rem;
  }

  .error-banner button {
    background: none;
    border: none;
    color: inherit;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  @media (max-width: 480px) {
    .chat-widget {
      bottom: 0;
      right: 0;
      left: 0;
    }

    .widget-container {
      width: 100%;
      height: 100vh;
      max-height: 100vh;
      border-radius: 0;
    }

    .chat-widget.minimized {
      bottom: 16px;
      right: 16px;
      left: auto;
    }
  }
</style>
