import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// News categories constant
const NEWS_CATEGORIES = [
    'market_trends',
    'company_news',
    'industry_insights',
    'career_tips',
    'events'
];

// Get categories list
router.get('/categories', (req: Request, res: Response) => {
    return res.json({
        categories: NEWS_CATEGORIES.map(cat => ({
            value: cat,
            label: {
                market_trends: 'Xu hướng thị trường',
                company_news: 'Tin công ty',
                industry_insights: 'Phân tích ngành nghề',
                career_tips: 'Mẹo nghề nghiệp',
                events: 'Sự kiện tuyển dụng'
            }[cat]
        }))
    });
});

// Get all news (public - only published for non-admin)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { category, status, featured, search, limit, offset } = req.query;

        let query = supabase
            .from('career_news')
            .select('*')
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

        // Filter by category
        if (category) {
            query = query.eq('category', category);
        }

        // Filter by status (default to published for public access)
        if (status) {
            query = query.eq('status', status);
        } else {
            query = query.eq('status', 'published');
        }

        // Filter featured
        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }

        // Search by title
        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        // Pagination
        if (limit) {
            query = query.limit(parseInt(limit as string));
        }
        if (offset) {
            query = query.range(
                parseInt(offset as string),
                parseInt(offset as string) + parseInt((limit as string) || '10') - 1
            );
        }

        const { data: news, error, count } = await query;

        if (error) throw error;

        return res.json({
            success: true,
            news,
            count
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get single news by ID or slug
router.get('/:idOrSlug', async (req: Request, res: Response) => {
    try {
        const { idOrSlug } = req.params;

        // Try to find by ID first, then by slug
        let query = supabase.from('career_news').select('*');

        // Check if it's a UUID format
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

        if (isUUID) {
            query = query.eq('id', idOrSlug);
        } else {
            query = query.eq('slug', idOrSlug);
        }

        const { data: news, error } = await query.single();

        if (error) throw error;

        // Fetch related companies if any
        let relatedCompanies: any[] = [];
        if (news.related_company_ids && news.related_company_ids.length > 0) {
            const { data: companies } = await supabase
                .from('profiles')
                .select('id, full_name, email, avatar_url, metadata')
                .in('id', news.related_company_ids)
                .eq('role', 'employer');

            relatedCompanies = companies || [];
        }

        return res.json({
            success: true,
            news: {
                ...news,
                related_companies: relatedCompanies
            }
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: 'Không tìm thấy tin tức'
        });
    }
});

// Increment view count
router.post('/:id/view', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { error } = await supabase.rpc('increment_news_view_count', {
            news_id: id
        });

        // If RPC doesn't exist, fallback to manual increment
        if (error) {
            const { data: news } = await supabase
                .from('career_news')
                .select('view_count')
                .eq('id', id)
                .single();

            if (news) {
                await supabase
                    .from('career_news')
                    .update({ view_count: (news.view_count || 0) + 1 })
                    .eq('id', id);
            }
        }

        return res.json({ success: true });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ============ ADMIN ONLY ROUTES ============

// Middleware to check admin role
const adminMiddleware = async (req: Request, res: Response, next: any) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (error || profile?.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Chỉ Admin mới có quyền thực hiện thao tác này'
            });
        }

        next();
    } catch (error: any) {
        return res.status(403).json({
            success: false,
            message: error.message
        });
    }
};

// Create news (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const {
            title,
            excerpt,
            content,
            cover_image_url,
            category,
            tags,
            related_company_ids,
            status,
            is_featured,
            is_pinned,
            meta_title,
            meta_description
        } = req.body;

        // Validate required fields
        if (!title || !content || !category) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề, nội dung và danh mục là bắt buộc'
            });
        }

        // Validate category
        if (!NEWS_CATEGORIES.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Danh mục không hợp lệ'
            });
        }

        const { data: news, error } = await supabase
            .from('career_news')
            .insert([
                {
                    title,
                    excerpt,
                    content,
                    cover_image_url,
                    category,
                    tags: tags || [],
                    related_company_ids: related_company_ids || [],
                    status: status || 'draft',
                    is_featured: is_featured || false,
                    is_pinned: is_pinned || false,
                    author_id: userId,
                    meta_title,
                    meta_description
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json({
            success: true,
            message: 'Tạo tin tức thành công',
            news
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Update news (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            title,
            excerpt,
            content,
            cover_image_url,
            category,
            tags,
            related_company_ids,
            status,
            is_featured,
            is_pinned,
            meta_title,
            meta_description
        } = req.body;

        // Build update object with only provided fields
        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (excerpt !== undefined) updateData.excerpt = excerpt;
        if (content !== undefined) updateData.content = content;
        if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;
        if (category !== undefined) {
            if (!NEWS_CATEGORIES.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: 'Danh mục không hợp lệ'
                });
            }
            updateData.category = category;
        }
        if (tags !== undefined) updateData.tags = tags;
        if (related_company_ids !== undefined) updateData.related_company_ids = related_company_ids;
        if (status !== undefined) updateData.status = status;
        if (is_featured !== undefined) updateData.is_featured = is_featured;
        if (is_pinned !== undefined) updateData.is_pinned = is_pinned;
        if (meta_title !== undefined) updateData.meta_title = meta_title;
        if (meta_description !== undefined) updateData.meta_description = meta_description;

        const { data: news, error } = await supabase
            .from('career_news')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Cập nhật tin tức thành công',
            news
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Delete news (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Get the news first to delete cover image if exists
        const { data: existingNews } = await supabase
            .from('career_news')
            .select('cover_image_url')
            .eq('id', id)
            .single();

        // Delete cover image from storage if exists
        if (existingNews?.cover_image_url) {
            const urlParts = existingNews.cover_image_url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            if (fileName) {
                await supabase.storage
                    .from('career-news-images')
                    .remove([fileName]);
            }
        }

        const { error } = await supabase
            .from('career_news')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return res.json({
            success: true,
            message: 'Xóa tin tức thành công'
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Get all news for admin (includes drafts)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
    try {
        const { category, status, featured, search, limit, offset } = req.query;

        let query = supabase
            .from('career_news')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }

        if (status) {
            query = query.eq('status', status);
        }

        if (featured === 'true') {
            query = query.eq('is_featured', true);
        }

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        if (limit) {
            query = query.limit(parseInt(limit as string));
        }

        if (offset) {
            query = query.range(
                parseInt(offset as string),
                parseInt(offset as string) + parseInt((limit as string) || '20') - 1
            );
        }

        const { data: news, error, count } = await query;

        if (error) throw error;

        return res.json({
            success: true,
            news,
            count
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
