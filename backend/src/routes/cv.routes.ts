import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Get all CVs for current user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.id;

        const { data: cvs, error } = await supabase
            .from('cv_templates')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.json({ cvs });
    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        });
    }
});

// Get CV by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const { data: cv, error } = await supabase
            .from('cv_templates')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        return res.json({ cv });
    } catch (error: any) {
        return res.status(404).json({
            error: error.message
        });
    }
});

// Create CV
router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const { title, data } = req.body;

        const { data: cv, error } = await supabase
            .from('cv_templates')
            .insert([
                {
                    user_id: userId,
                    title,
                    data
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Tạo CV thành công!',
            cv
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Update CV
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const { title, data } = req.body;

        const updates: any = { updated_at: new Date().toISOString() };
        if (title) updates.title = title;
        if (data) updates.data = data;

        const { error } = await supabase
            .from('cv_templates')
            .update(updates)
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Cập nhật CV thành công!'
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Delete CV
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const { error } = await supabase
            .from('cv_templates')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Xóa CV thành công!'
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
