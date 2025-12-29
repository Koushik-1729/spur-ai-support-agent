<script lang="ts">
    import { auth } from '$lib/stores/auth.store';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    onMount(() => {
        if (!$auth.isAuthenticated) {
            goto('/login');
        }
    });

    function handleLogout() {
        auth.logout();
        goto('/login');
    }
</script>

<div class="admin-layout">
    <aside class="sidebar">
        <div class="logo">Spur Admin</div>
        <nav>
            <a href="/admin" class:active={$page.url.pathname === '/admin'}>
                <span class="nav-icon">📊</span> Dashboard
            </a>
            <a href="/admin/conversations" class:active={$page.url.pathname.startsWith('/admin/conversations')}>
                <span class="nav-icon">💬</span> Conversations
            </a>
            <a href="/admin/analytics" class:active={$page.url.pathname === '/admin/analytics'}>
                <span class="nav-icon">📈</span> Analytics
            </a>
        </nav>
        <div class="user-info">
            <span class="email">{$auth.user?.email}</span>
            <button on:click={handleLogout} class="logout-btn">Logout</button>
        </div>
    </aside>

    <main class="content">
        <slot />
    </main>
</div>

<style>
    .admin-layout {
        display: flex;
        min-height: 100vh;
    }

    .sidebar {
        width: 250px;
        background-color: #1f2937;
        color: white;
        display: flex;
        flex-direction: column;
        padding: 1.5rem;
    }

    .logo {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #374151;
    }

    nav {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        flex: 1;
    }

    nav a {
        color: #9ca3af;
        text-decoration: none;
        padding: 0.75rem 1rem;
        border-radius: 4px;
        transition: all 0.2s;
    }

    nav a:hover, nav a.active {
        background-color: #374151;
        color: white;
    }

    .user-info {
        border-top: 1px solid #374151;
        padding-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .email {
        font-size: 0.875rem;
        color: #9ca3af;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .logout-btn {
        background: none;
        border: 1px solid #4b5563;
        color: #d1d5db;
        padding: 0.5rem;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .logout-btn:hover {
        background-color: #374151;
        color: white;
    }

    .content {
        flex: 1;
        background-color: #f3f4f6;
        padding: 2rem;
        overflow-y: auto;
    }
</style>
