<script lang="ts">
</script>

<div class="typing-indicator">
  <div class="avatar">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="9" y1="9" x2="9.01" y2="9"/>
      <line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  </div>
  <div class="dots">
    <span></span>
    <span></span>
    <span></span>
  </div>
  <span class="text">Agent is typing</span>
</div>

<style>
  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 18px;
    border-bottom-left-radius: 4px;
    max-width: 180px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    animation: fadeIn 0.3s ease-out;
  }

  .avatar {
    width: 24px;
    height: 24px;
    color: #667eea;
  }

  .avatar svg {
    width: 100%;
    height: 100%;
  }

  .dots {
    display: flex;
    gap: 4px;
  }

  .dots span {
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .dots span:nth-child(1) {
    animation-delay: -0.32s;
  }

  .dots span:nth-child(2) {
    animation-delay: -0.16s;
  }

  .text {
    font-size: 0.85rem;
    color: #666;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0.6);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
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
