<script lang="ts">
  export let sender: 'user' | 'ai';
  export let text: string;
  export let timestamp: string;

  function formatTime(isoString: string): string {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }
</script>

<div class="message {sender}">
  <div class="bubble">
    <p class="text">{text}</p>
    <span class="time">{formatTime(timestamp)}</span>
  </div>
</div>

<style>
  .message {
    display: flex;
    margin-bottom: 16px;
    animation: fadeIn 0.3s ease-out;
  }

  .message.user {
    justify-content: flex-end;
  }

  .message.ai {
    justify-content: flex-start;
  }

  .bubble {
    max-width: 75%;
    padding: 12px 16px;
    border-radius: 18px;
    position: relative;
  }

  .message.user .bubble {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-bottom-right-radius: 4px;
  }

  .message.ai .bubble {
    background: rgba(255, 255, 255, 0.95);
    color: #1a1a2e;
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .text {
    margin: 0;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .time {
    display: block;
    font-size: 0.7rem;
    margin-top: 6px;
    opacity: 0.7;
  }

  .message.user .time {
    text-align: right;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
