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
