import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Get user profile by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return res.json({ profile });
    } catch (error: any) {
        return res.status(404).json({
            error: error.message
        });
    }
});

// Update profile (authenticated user only)
router.put('/', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const { full_name, phone, avatar_url, metadata } = req.body;

        const updates: any = {};
        if (full_name) updates.full_name = full_name;
        if (phone) updates.phone = phone;
        if (avatar_url) updates.avatar_url = avatar_url;
        if (metadata) updates.metadata = metadata;
        updates.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Cập nhật thông tin thành công!'
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get company followers
router.get('/:id/followers', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error, count } = await supabase
            .from('company_followers')
            .select('*, profiles:follower_id(*)', { count: 'exact' })
            .eq('company_id', id);

        if (error) throw error;

        return res.json({
            followers: data,
            count: count || 0
        });
    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        });
    }
});

// Toggle follow company
router.post('/:id/follow', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        // Check if already following
        const { data: existing } = await supabase
            .from('company_followers')
            .select('id')
            .eq('company_id', id)
            .eq('follower_id', userId)
            .maybeSingle();

        if (existing) {
            // Unfollow
            const { error } = await supabase
                .from('company_followers')
                .delete()
                .eq('id', existing.id);

            if (error) throw error;

            return res.json({
                success: true,
                is_following: false
            });
        } else {
            // Follow
            const { error } = await supabase
                .from('company_followers')
                .insert({
                    company_id: id,
                    follower_id: userId
                });

            if (error) throw error;

            return res.json({
                success: true,
                is_following: true
            });
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
