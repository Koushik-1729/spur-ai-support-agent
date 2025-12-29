<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let disabled: boolean = false;
  export let placeholder: string = 'Type your message...';

  let message = '';
  const dispatch = createEventDispatcher<{ send: string }>();

  function handleSubmit() {
    if (message.trim() && !disabled) {
      dispatch('send', message.trim());
      message = '';
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }
</script>

<form class="chat-input" on:submit|preventDefault={handleSubmit}>
  <div class="input-wrapper">
    <input
      type="text"
      bind:value={message}
      on:keydown={handleKeydown}
      {placeholder}
      {disabled}
      maxlength="5000"
      autocomplete="off"
    />
    <button 
      type="submit" 
      disabled={disabled || !message.trim()}
      aria-label="Send message"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    </button>
  </div>
</form>

<style>
  .chat-input {
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.95);
    border-top: 1px solid rgba(0, 0, 0, 0.06);
  }

  .input-wrapper {
    display: flex;
    gap: 12px;
    background: #f5f5f7;
    border-radius: 24px;
    padding: 4px 4px 4px 16px;
    transition: box-shadow 0.2s ease;
  }

  .input-wrapper:focus-within {
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 0.95rem;
    color: #1a1a2e;
    outline: none;
  }

  input::placeholder {
    color: #999;
  }

  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  button {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  button:hover:not(:disabled) {
    transform: scale(1.05);
  }

  button:active:not(:disabled) {
    transform: scale(0.95);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button svg {
    width: 18px;
    height: 18px;
  }
</style>
