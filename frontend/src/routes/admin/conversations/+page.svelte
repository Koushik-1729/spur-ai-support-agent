<script lang="ts">
    import { api } from '$lib/api';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    interface Conversation {
        id: string;
        createdAt: string;
        messageCount: number;
    }

    let conversations: Conversation[] = [];
    let loading = true;
    let error = '';
    let page = 1;
    let totalPages = 1;

    async function loadConversations(pageNum: number) {
        loading = true;
        try {
            const res = await api.get<{ conversations: Conversation[], pagination: any }>(`/admin/conversations`, {
                page: pageNum.toString()
            });
            conversations = res.conversations;
            totalPages = res.pagination.totalPages;
            page = pageNum;
        } catch (err) {
            error = err instanceof Error ? err.message : 'Failed to load conversations';
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadConversations(1);
    });

    function formatDate(isoString: string) {
        return new Date(isoString).toLocaleString();
    }
</script>

<div class="conversations-page">
    <div class="header">
        <h1>Conversations</h1>
    </div>

    {#if loading && conversations.length === 0}
        <div class="loading">Loading...</div>
    {:else if error}
        <div class="error">{error}</div>
    {:else}
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Created At</th>
                        <th>Messages</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each conversations as conv}
                        <tr>
                            <td class="id-col" title={conv.id}>{conv.id}</td>
                            <td>{formatDate(conv.createdAt)}</td>
                            <td>{conv.messageCount}</td>
                            <td>
                                <a href="/admin/conversations/{conv.id}" class="view-btn">View</a>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="pagination">
            <button disabled={page === 1} on:click={() => loadConversations(page - 1)}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} on:click={() => loadConversations(page + 1)}>Next</button>
        </div>
    {/if}
</div>

<style>
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    h1 {
        font-size: 1.875rem;
        font-weight: bold;
        color: #111827;
        margin: 0;
    }

    .table-container {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
    }

    th {
        background-color: #f9fafb;
        padding: 0.75rem 1.5rem;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        color: #6b7280;
        border-bottom: 1px solid #e5e7eb;
    }

    td {
        padding: 1rem 1.5rem;
        color: #374151;
        border-bottom: 1px solid #e5e7eb;
    }

    tr:last-child td {
        border-bottom: none;
    }

    .id-col {
        font-family: monospace;
        color: #6b7280;
    }

    .view-btn {
        background-color: #dbeafe;
        color: #2563eb;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
        text-decoration: none;
    }

    .view-btn:hover {
        background-color: #bfdbfe;
    }

    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 2rem;
    }

    button {
        padding: 0.5rem 1rem;
        border: 1px solid #d1d5db;
        background: white;
        border-radius: 0.375rem;
        cursor: pointer;
    }

    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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
