export interface CVData {
    mcv?: string;
    type?: string;
    title?: string;
    personal_info?: {
        full_name?: string;
        title?: string;
        dob?: string;
        gender?: string;
        phone?: string;
        email?: string;
        address?: string;
        website?: string;
        avatar_url?: string;
    };
    summary?: string;
    experiences?: Array<{
        company?: string;
        duration?: string;
        position?: string;
        description?: string;
    }>;
    education?: Array<{
        school?: string;
        year?: string;
        degree?: string;
    }>;
    projects?: Array<{
        name?: string;
        description?: string;
    }>;
    skills?: Array<{
        name?: string;
        level?: number; // 0-100
    }>;
    activities?: Array<{
        organization?: string;
        duration?: string;
        role?: string;
        description?: string;
    }>;
    awards?: Array<{
        name?: string;
        year?: string;
    }>;
    certifications?: Array<{
        name?: string;
        year?: string;
    }>;
    languages?: Array<{
        name?: string;
        level?: string;
    }>;
    references?: Array<{
        name?: string;
        position?: string;
        phone?: string;
    }>;
}

export interface CVTemplateProps {
    data: CVData;
    onSectionTap?: (section: string) => void;
    isViewOnly?: boolean;
}
