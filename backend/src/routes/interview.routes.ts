import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Get all interviews for current user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        let query = supabase
            .from('interview_schedules')
            .select(`
        *,
        candidate:candidate_id(*),
        employer:employer_id(*)
      `);

        if (profile?.role === 'employer') {
            query = query.eq('employer_id', userId);
        } else {
            query = query.eq('candidate_id', userId);
        }

        const { data: interviews, error } = await query.order('interview_time', { ascending: true });

        if (error) throw error;

        return res.json({ interviews });
    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        });
    }
});

// Create interview schedule (employer only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.id;
        const { candidate_id, job_id, cv_id, interview_time, job_title } = req.body;

        // Check if user is employer
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (profile?.role !== 'employer') {
            return res.status(403).json({
                success: false,
                message: 'Chỉ nhà tuyển dụng mới có thể tạo lịch phỏng vấn'
            });
        }

        // Check for conflicts
        const { data: conflicts } = await supabase
            .from('interview_schedules')
            .select('id')
            .eq('employer_id', userId)
            .eq('interview_time', interview_time)
            .eq('status', 'scheduled');

        if (conflicts && conflicts.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Đã có lịch phỏng vấn khác vào thời gian này'
            });
        }

        const { data: interview, error } = await supabase
            .from('interview_schedules')
            .insert([
                {
                    candidate_id,
                    job_id,
                    employer_id: userId,
                    cv_id,
                    interview_time,
                    job_title,
                    status: 'scheduled'
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Tạo lịch phỏng vấn thành công!',
            interview
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Update interview status
router.put('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { error } = await supabase
            .from('interview_schedules')
            .update({ status })
            .eq('id', id);

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Cập nhật trạng thái thành công!'
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Update interview evaluation
router.put('/:id/evaluation', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { evaluation } = req.body;

        const { error } = await supabase
            .from('interview_schedules')
            .update({ evaluation })
            .eq('id', id);

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Cập nhật đánh giá thành công!'
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
