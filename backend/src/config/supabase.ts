import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database tables
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
}

export interface CVTemplate {
    id: string;
    user_id: string;
    title: string;
    data: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface InterviewSchedule {
    id: string;
    candidate_id: string;
    job_id: string | null;
    employer_id: string;
    cv_id: string | null;
    interview_time: string;
    job_title: string;
    evaluation: Record<string, any>;
    status: 'scheduled' | 'completed' | 'cancelled';
    created_at: string;
}
