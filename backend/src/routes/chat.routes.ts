import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Get all conversations for current user
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const userId = (req as any).user.id;

        const { data: conversations, error } = await supabase
            .from('conversations')
            .select('*')
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
            .order('last_message_at', { ascending: false });

        if (error) throw error;

        return res.json({ conversations });
    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        });
    }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return res.json({ messages });
    } catch (error: any) {
        return res.status(500).json({
            error: error.message
        });
    }
});

// Send message
router.post('/conversations/:id/messages', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const { content, message_type, attachment_url, attachment_name, attachment_size } = req.body;

        const { data: message, error } = await supabase
            .from('messages')
            .insert([
                {
                    conversation_id: id,
                    sender_id: userId,
                    content,
                    message_type: message_type || 'text',
                    attachment_url,
                    attachment_name,
                    attachment_size
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Update conversation last message
        await supabase
            .from('conversations')
            .update({
                last_message: content,
                last_message_at: new Date().toISOString(),
                last_message_sender_id: userId
            })
            .eq('id', id);

        return res.status(201).json({
            success: true,
            message: message
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Mark messages as read
router.put('/conversations/:id/read', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', id)
            .neq('sender_id', userId);

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Đã đánh dấu đã đọc'
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
