import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth, requireAdmin, authRateLimiter } from '../middleware/index.js';

export function createAdminRoutes(controller: AdminController): Router {
    const router = Router();

    // POST /admin/login - Admin login (rate limited)
    router.post('/login', authRateLimiter, controller.login);

    // Protected admin routes
    router.use(requireAuth, requireAdmin);

    // GET /admin/dashboard - Dashboard stats
    router.get('/dashboard', controller.getDashboard);

    // GET /admin/conversations - List conversations
    router.get('/conversations', controller.getConversations);

    // GET /admin/conversations/:id - Get conversation details
    router.get('/conversations/:id', controller.getConversation);

    // GET /admin/analytics - Analytics data
    router.get('/analytics', controller.getAnalytics);

    return router;
}
