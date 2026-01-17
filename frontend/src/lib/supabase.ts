import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions
export interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    role: 'candidate' | 'employer' | 'school' | 'admin';
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface JobMetadata {
    title: string;
    working_regions: string[];
    experience_required: string;
    fields: string[];
    requirements_tags: string[];
    salary: {
        min?: number;
        max?: number;
        currency: string;
        is_negotiable: boolean;
        type: 'monthly' | 'hourly' | 'yearly';
    };
    employment_types: string[];
    work_locations: string[];
    job_description: string[];
    candidate_requirements: string[];
    benefits: string[];
}

export interface Job {
    id: string;
    created_at: string;
    updated_at: string;
    creator_id: string;
    is_active: boolean;
    deadline: string;
    metadata: JobMetadata;
    applicants: any[];
    view_count: number;
    status: 'pending' | 'approved' | 'rejected' | 'closed';
    profiles?: Profile;
}

// Career News types
export type NewsCategory = 'market_trends' | 'company_news' | 'industry_insights' | 'career_tips' | 'events';
export type NewsStatus = 'draft' | 'published' | 'archived';

export interface CareerNews {
    id: string;
    created_at: string;
    updated_at: string;
    title: string;
    slug: string | null;
    excerpt: string | null;
    content: string;
    cover_image_url: string | null;
    category: NewsCategory;
    tags: string[];
    related_company_ids: string[];
    status: NewsStatus;
    is_featured: boolean;
    is_pinned: boolean;
    author_id: string | null;
    view_count: number;
    meta_title: string | null;
    meta_description: string | null;
    // Joined data
    related_companies?: Profile[];
}

export const NEWS_CATEGORIES: Record<NewsCategory, string> = {
    market_trends: 'Xu hướng thị trường',
    company_news: 'Tin công ty',
    industry_insights: 'Phân tích ngành nghề',
    career_tips: 'Mẹo nghề nghiệp',
    events: 'Sự kiện tuyển dụng'
};

export const NEWS_STATUS_LABELS: Record<NewsStatus, string> = {
    draft: 'Bản nháp',
    published: 'Đã xuất bản',
    archived: 'Đã lưu trữ'
};
