import { Router } from 'express';
import { supabase } from '../config/supabase.js';

const router = Router();

// Sign up with email
router.post('/signup', async (req, res) => {
    try {
        const { email, password, full_name, phone, role } = req.body;

        // Validate input
        if (!email || !password || !full_name || !role) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin'
            });
        }

        // Sign up user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name,
                    phone,
                    role
                }
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Tạo tài khoản thất bại');

        // Ensure profile was created
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: authData.user.id,
                email,
                full_name,
                phone,
                role,
                metadata: {}
            });

        if (profileError) console.warn('Profile creation warning:', profileError);

        return res.status(201).json({
            success: true,
            message: authData.user.email_confirmed_at
                ? 'Đăng ký thành công!'
                : 'Vui lòng kiểm tra email để xác thực tài khoản.',
            user: authData.user
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Sign in with email
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email và mật khẩu'
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        if (!data.user) throw new Error('Đăng nhập thất bại');

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        return res.json({
            success: true,
            message: 'Đăng nhập thành công!',
            user: data.user,
            session: data.session,
            profile
        });
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
});

// Sign out
router.post('/signout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        return res.json({
            success: true,
            message: 'Đăng xuất thành công!'
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get current user profile (requires auth header)
router.get('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) throw new Error('Not authenticated');

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        return res.json({ profile });
    } catch (error: any) {
        return res.status(401).json({
            error: error.message
        });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập email'
            });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/reset-password`
        });

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Vui lòng kiểm tra email để đặt lại mật khẩu'
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
