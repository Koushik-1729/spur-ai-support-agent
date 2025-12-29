<script lang="ts">
    import { api } from '$lib/api';
    import { onMount } from 'svelte';

    interface Analytics {
        topKeywords: { word: string; count: number }[];
        averageMessagesPerConversation: number;
    }

    let analytics: Analytics | null = null;
    let loading = true;
    let error = '';

    onMount(async () => {
        try {
            analytics = await api.get<Analytics>('/admin/analytics');
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load analytics';
        } finally {
            loading = false;
        }
    });
</script>

<div class="analytics">
    <h1 class="page-title">Analytics</h1>

    {#if loading}
        <div class="loading">Loading analytics...</div>
    {:else if error}
        <div class="error">{error}</div>
    {:else}
        <div class="analytics-grid">
            <div class="card">
                <h2>Average Messages per Conversation</h2>
                <div class="big-number">{analytics?.averageMessagesPerConversation?.toFixed(1) || '0'}</div>
            </div>
            
            <div class="card full-width">
                <h2>Top Query Keywords</h2>
                <div class="keywords-container">
                    {#each analytics?.topKeywords || [] as keyword, i}
                        <div class="keyword-bar">
                            <div class="keyword-info">
                                <span class="rank">#{i + 1}</span>
                                <span class="word">{keyword.word}</span>
                            </div>
                            <div class="bar-wrapper">
                                <div 
                                    class="bar" 
                                    style="width: {Math.min(100, (keyword.count / (analytics?.topKeywords[0]?.count || 1)) * 100)}%"
                                ></div>
                            </div>
                            <span class="count">{keyword.count}</span>
                        </div>
                    {:else}
                        <p class="no-data">No keyword data available yet.</p>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .page-title {
        font-size: 1.875rem;
        font-weight: bold;
        color: #111827;
        margin-bottom: 2rem;
    }

    .loading {
        text-align: center;
        padding: 2rem;
        color: #6b7280;
    }

    .error {
        background-color: #fee2e2;
        color: #991b1b;
        padding: 1rem;
        border-radius: 0.5rem;
    }

    .analytics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .card {
        background: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .card.full-width {
        grid-column: 1 / -1;
    }

    .card h2 {
        font-size: 1rem;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 1rem;
    }

    .big-number {
        font-size: 3rem;
        font-weight: bold;
        color: #667eea;
    }

    .keywords-container {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .keyword-bar {
        display: grid;
        grid-template-columns: 120px 1fr 50px;
        align-items: center;
        gap: 1rem;
    }

    .keyword-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .rank {
        color: #9ca3af;
        font-size: 0.875rem;
        min-width: 24px;
    }

    .word {
        font-weight: 500;
        color: #111827;
    }

    .bar-wrapper {
        background: #e5e7eb;
        border-radius: 4px;
        height: 24px;
        overflow: hidden;
    }

    .bar {
        height: 100%;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 4px;
        transition: width 0.5s ease;
    }

    .count {
        font-weight: 600;
        color: #667eea;
        text-align: right;
    }

    .no-data {
        color: #9ca3af;
        text-align: center;
        padding: 1rem;
    }
</style>
