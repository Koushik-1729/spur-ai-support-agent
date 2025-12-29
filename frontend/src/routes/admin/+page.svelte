<script lang="ts">
    import { api } from '$lib/api';
    import { onMount } from 'svelte';

    interface DashboardStats {
        totalConversations: number;
        totalMessages: number;
        userMessages: number;
        aiMessages: number;
    }

    interface Analytics {
        topKeywords: { word: string; count: number }[];
        averageMessagesPerConversation: number;
    }

    let stats: DashboardStats | null = null;
    let analytics: Analytics | null = null;
    let loading = true;
    let error = '';

    onMount(async () => {
        try {
            const [dashboardRes, analyticsRes] = await Promise.all([
                api.get<{ stats: DashboardStats }>('/admin/dashboard'),
                api.get<Analytics>('/admin/analytics')
            ]);
            
            stats = dashboardRes.stats;
            analytics = analyticsRes;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load dashboard data';
        } finally {
            loading = false;
        }
    });
</script>

<div class="dashboard">
    <h1 class="page-title">Dashboard</h1>

    {#if loading}
        <div class="loading">Loading stats...</div>
    {:else if error}
        <div class="error">{error}</div>
    {:else}
        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Conversations</div>
                <div class="stat-value">{stats?.totalConversations}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Messages</div>
                <div class="stat-value">{stats?.totalMessages}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Avg Msgs/Conv</div>
                <div class="stat-value">{analytics?.averageMessagesPerConversation}</div>
            </div>
             <div class="stat-card">
                <div class="stat-label">User vs AI</div>
                <div class="stat-value small">User: {stats?.userMessages} | AI: {stats?.aiMessages}</div>
            </div>
        </div>

        <!-- Keyword Analytics -->
        <div class="section">
            <h2>Top Query Keywords</h2>
            <div class="keywords-list">
                {#each analytics?.topKeywords || [] as keyword}
                    <div class="keyword-item">
                        <span class="word">{keyword.word}</span>
                        <span class="count">{keyword.count}</span>
                    </div>
                {/each}
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
        margin-bottom: 1rem;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .stat-label {
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 0.5rem;
    }

    .stat-value {
        font-size: 2rem;
        font-weight: bold;
        color: #111827;
    }

    .stat-value.small {
        font-size: 1.25rem;
        color: #4b5563;
    }

    .section {
        background: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    h2 {
        font-size: 1.25rem;
        font-weight: high;
        color: #111827;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .keywords-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
    }

    .keyword-item {
        background-color: #eff6ff;
        color: #1e40af;
        padding: 0.5rem 1rem;
        border-radius: 9999px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .keyword-item .count {
        background-color: #dbeafe;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
    }
</style>
