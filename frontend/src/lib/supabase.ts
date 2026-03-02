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
    company_name?: string | null;
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
    experience_level?: string;
    number_of_positions?: number;
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
    description?: string;
    candidate_requirements: string[];
    requirements?: string;
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

// Course types
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';

export interface CourseCategory {
    id: string;
    created_at: string;
    name: string;
    slug: string | null;
    description: string | null;
    icon: string | null;
    color: string;
    order: number;
    is_active: boolean;
}

export interface Course {
    id: string;
    created_at: string;
    updated_at: string;
    title: string;
    slug: string | null;
    description: string | null;
    thumbnail_url: string | null;
    category_id: string | null;
    level: CourseLevel;
    tags: string[];
    duration_minutes: number;
    status: CourseStatus;
    is_featured: boolean;
    author_id: string | null;
    view_count: number;
    // Joined data
    category?: CourseCategory;
    lessons?: CourseLesson[];
}

export interface CourseLesson {
    id: string;
    created_at: string;
    course_id: string;
    title: string;
    description: string | null;
    youtube_url: string;
    order: number;
    duration_minutes: number;
    is_preview: boolean;
}

export const COURSE_LEVELS: Record<CourseLevel, string> = {
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao'
};

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
    draft: 'Bản nháp',
    published: 'Đã xuất bản',
    archived: 'Đã lưu trữ'
};

// MI Question types
export type MIIntelligenceType = 'IA' | 'IE' | 'LO' | 'LI' | 'SP' | 'BO' | 'MU' | 'NA' | 'EX';

export interface MIQuestion {
    id: string;
    created_at: string;
    updated_at: string;
    question_text: string;
    intelligence_type: MIIntelligenceType;
    order: number;
    is_active: boolean;
}

export const MI_INTELLIGENCE_LABELS: Record<MIIntelligenceType, string> = {
    IA: 'Nội tâm (Intrapersonal)',
    IE: 'Giao tiếp (Interpersonal)',
    LO: 'Logic - Toán học (Logical-Mathematical)',
    LI: 'Ngôn ngữ (Linguistic)',
    SP: 'Không gian (Spatial)',
    BO: 'Vận động cơ thể (Bodily-Kinesthetic)',
    MU: 'Âm nhạc (Musical)',
    NA: 'Tự nhiên (Naturalistic)',
    EX: 'Triết học - Hiện sinh (Existential)'
};

// Chat types
export interface Conversation {
    id: string;
    participant1_id: string;
    participant1_type: string;
    participant2_id: string;
    participant2_type: string;
    job_id: string | null;
    application_id?: string | null;
    last_message: string | null;
    last_message_at: string | null;
    last_message_sender_id: string | null;
    status: 'active' | 'archived' | 'closed';
    created_at: string;
    updated_at: string;
    // Joined data
    otherUserName?: string;
    otherUserAvatar?: string | null;
    unreadCount?: number;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    sender_type: string;
    content: string;
    message_type: 'text' | 'image' | 'file' | 'system' | 'audio';
    attachment_url: string | null;
    attachment_name: string | null;
    attachment_size: number | null;
    is_read: boolean;
    is_deleted: boolean;
    created_at: string;
    // Helper
    isSentByMe?: boolean;
}

