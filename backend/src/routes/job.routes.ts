import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Get all active approved jobs (public)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        const { data: jobs, error, count } = await supabase
            .from('jobs')
            .select(`
        *,
        profiles:creator_id (
          id,
          full_name,
          avatar_url,
          metadata
        )
      `, { count: 'exact' })
            .eq('is_active', true)
            .eq('status', 'approved')
            .gt('deadline', new Date().toISOString())
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return res.json({
            jobs,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit)
            }
        });
    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        });
    }
});

// Create job (employer only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { deadline, metadata } = req.body;
        const userId = (req as any).user.id;

        // Check if user is employer
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (profile?.role !== 'employer') {
            return res.status(403).json({
                success: false,
                message: 'Chỉ nhà tuyển dụng mới có thể đăng tin'
            });
        }

        const { data, error } = await supabase
            .from('jobs')
            .insert([
                {
                    creator_id: userId,
                    deadline,
                    metadata,
                    is_active: true,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Đăng tin thành công! Đang chờ duyệt.',
            job: data
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Get job by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: job, error } = await supabase
            .from('jobs')
            .select(`
        *,
        profiles:creator_id (
          id,
          full_name,
          avatar_url,
          email,
          phone,
          metadata
        )
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!job) {
            return res.status(404).json({ error: 'Không tìm thấy công việc' });
        }

        // Increment view count
        await supabase
            .from('jobs')
            .update({ view_count: (job.view_count || 0) + 1 })
            .eq('id', id);

        return res.json({ job });
    } catch (error: any) {
        return res.status(404).json({
            error: error.message
        });
    }
});

// Update job (creator only)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const { deadline, metadata, is_active } = req.body;

        // Check ownership
        const { data: job } = await supabase
            .from('jobs')
            .select('creator_id')
            .eq('id', id)
            .single();

        if (job?.creator_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền chỉnh sửa'
            });
        }

        const updates: any = {};
        if (deadline) updates.deadline = deadline;
        if (metadata) updates.metadata = metadata;
        if (is_active !== undefined) updates.is_active = is_active;

        const { error } = await supabase
            .from('jobs')
            .update(updates)
            .eq('id', id);

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Cập nhật tin thành công!'
        });
    } catch (error: any) {
        return res.status(403).json({
            success: false,
            message: error.message
        });
    }
});

// Delete job (creator only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        // Check ownership
        const { data: job } = await supabase
            .from('jobs')
            .select('creator_id')
            .eq('id', id)
            .single();

        if (job?.creator_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Không có quyền xóa'
            });
        }

        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Xóa tin thành công!'
        });
    } catch (error: any) {
        return res.status(403).json({
            success: false,
            message: error.message
        });
    }
});

// Apply for job
router.post('/:id/apply', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { cv_id } = req.body;
        const userId = (req as any).user.id;

        const { error } = await supabase.rpc('apply_to_job', {
            p_job_id: id,
            p_user_id: userId,
            p_cv_id: cv_id
        });

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Ứng tuyển thành công!'
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Get saved jobs
router.get('/user/saved', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.id;

        const { data, error } = await supabase
            .from('user_job_activities')
            .select(`
        *,
        jobs (
          *,
          profiles:creator_id (
            full_name,
            avatar_url
          )
        )
      `)
            .eq('user_id', userId)
            .eq('activity_type', 'saved');

        if (error) throw error;

        return res.json({ saved_jobs: data });
    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        });
    }
});

// Get applied jobs
router.get('/user/applied', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.id;

        const { data, error } = await supabase
            .from('user_job_activities')
            .select(`
        *,
        jobs (
          *,
          profiles:creator_id (
            full_name,
            avatar_url
          )
        )
      `)
            .eq('user_id', userId)
            .eq('activity_type', 'applied')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.json({ applied_jobs: data });
    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        });
    }
});

// Toggle save job
router.post('/:id/save', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        // Check if activity exists
        const { data: existing } = await supabase
            .from('user_job_activities')
            .select('id')
            .eq('user_id', userId)
            .eq('job_id', id)
            .eq('activity_type', 'saved')
            .maybeSingle();

        if (existing) {
            // Remove
            const { error } = await supabase
                .from('user_job_activities')
                .delete()
                .eq('id', existing.id);

            if (error) throw error;

            return res.json({
                success: true,
                is_saved: false
            });
        } else {
            // Add
            const { error } = await supabase
                .from('user_job_activities')
                .insert({
                    user_id: userId,
                    job_id: id,
                    activity_type: 'saved'
                });

            if (error) throw error;

            return res.json({
                success: true,
                is_saved: true
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
