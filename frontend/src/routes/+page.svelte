<script lang="ts">
  import ChatWidget from '$lib/components/ChatWidget.svelte';
</script>

<svelte:head>
  <title>Spur Shop - AI Support Agent</title>
  <meta name="description" content="Chat with our AI support agent for instant answers about shipping, returns, and more.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<main>
  <div class="hero">
    <div class="content">
      <div class="badge">AI-Powered Support</div>
      <h1>Welcome to <span class="gradient">Spur Shop</span></h1>
      <p>Your one-stop shop for electronics, gadgets, and accessories. Have a question? Our AI support agent is here to help 24/7!</p>
      <div class="features">
        <div class="feature">
          <div class="icon">🚚</div>
          <span>Free Shipping 50+</span>
        </div>
        <div class="feature">
          <div class="icon">↩️</div>
          <span>30-Day Returns</span>
        </div>
        <div class="feature">
          <div class="icon">💳</div>
          <span>Secure Payment</span>
        </div>
      </div>
    </div>
    <div class="decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
</main>

<ChatWidget />

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
    min-height: 100vh;
    color: white;
    overflow-x: hidden;
  }

  main {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  }

  .hero {
    max-width: 600px;
    text-align: center;
    position: relative;
    z-index: 1;
  }

  .badge {
    display: inline-block;
    padding: 8px 16px;
    background: rgba(102, 126, 234, 0.2);
    border: 1px solid rgba(102, 126, 234, 0.3);
    border-radius: 20px;
    font-size: 0.85rem;
    color: #a5b4fc;
    margin-bottom: 24px;
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 20px;
  }

  .gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero p {
    font-size: 1.1rem;
    color: #a0aec0;
    line-height: 1.7;
    margin-bottom: 32px;
  }

  .features {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    font-size: 0.9rem;
    color: #e2e8f0;
    transition: transform 0.2s ease, background 0.2s ease;
  }

  .feature:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.08);
  }

  .feature .icon {
    font-size: 1.2rem;
  }

  .decoration {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
  }

  .circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
  }

  .circle-1 {
    width: 400px;
    height: 400px;
    background: #667eea;
    top: -100px;
    right: -100px;
    animation: float 8s ease-in-out infinite;
  }

  .circle-2 {
    width: 300px;
    height: 300px;
    background: #764ba2;
    bottom: -50px;
    left: -50px;
    animation: float 10s ease-in-out infinite reverse;
  }

  .circle-3 {
    width: 200px;
    height: 200px;
    background: #f093fb;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 6s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(30px, 30px);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 0.5;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  @media (max-width: 600px) {
    h1 {
      font-size: 2rem;
    }

    .hero p {
      font-size: 1rem;
    }

    .features {
      flex-direction: column;
      align-items: center;
    }
  }
</style>
