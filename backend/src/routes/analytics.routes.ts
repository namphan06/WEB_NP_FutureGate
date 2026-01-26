import express, { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/analytics/overview
 * Get overview statistics with time period filter
 */
router.get('/overview', async (req: Request, res: Response) => {
    try {
        const days = parseInt(req.query.days as string) || 7;
        const periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - days);

        // Get total users and new users
        const { data: allUsers, error: usersError } = await supabase
            .from('profiles')
            .select('id, role, created_at');

        if (usersError) throw usersError;

        const totalUsers = allUsers?.length || 0;
        const newUsers = allUsers?.filter(u =>
            new Date(u.created_at) > periodStart
        ).length || 0;

        // Get total jobs and new jobs
        const { data: allJobs, error: jobsError } = await supabase
            .from('jobs')
            .select('id, status, created_at, deadline');

        if (jobsError) throw jobsError;

        const totalJobs = allJobs?.length || 0;
        const newJobs = allJobs?.filter(j =>
            new Date(j.created_at) > periodStart
        ).length || 0;

        // Get applications from jobs
        let totalApplications = 0;
        let newApplications = 0;
        let acceptedApplications = 0;

        const { data: jobsWithApplicants, error: applicantsError } = await supabase
            .from('jobs')
            .select('applicants');

        if (applicantsError) throw applicantsError;

        jobsWithApplicants?.forEach(job => {
            const applicants = job.applicants || [];
            totalApplications += applicants.length;

            applicants.forEach((app: any) => {
                if (app.applied_at && new Date(app.applied_at) > periodStart) {
                    newApplications++;
                }
                if (app.status?.toLowerCase() === 'accepted') {
                    acceptedApplications++;
                }
            });
        });

        const applicationSuccessRate = totalApplications > 0
            ? (acceptedApplications / totalApplications * 100)
            : 0;

        // Get interviews
        const { data: allInterviews, error: interviewsError } = await supabase
            .from('interview_schedules')
            .select('id, created_at');

        if (interviewsError) throw interviewsError;

        const totalInterviews = allInterviews?.length || 0;
        const newInterviews = allInterviews?.filter(i =>
            new Date(i.created_at) > periodStart
        ).length || 0;

        console.log('📊 Analytics Debug:', {
            totalUsers,
            newUsers,
            totalJobs,
            newJobs,
            totalApplications,
            totalInterviews,
            allUsersCount: allUsers?.length,
            allInterviewsCount: allInterviews?.length
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                newUsers,
                totalJobs,
                newJobs,
                totalApplications,
                newApplications,
                totalInterviews,
                newInterviews,
                applicationSuccessRate: parseFloat(applicationSuccessRate.toFixed(2))
            }
        });

    } catch (error: any) {
        console.error('Error getting overview stats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get overview statistics'
        });
    }
});

/**
 * GET /api/analytics/users-trend
 * Get users trend data grouped by day
 */
router.get('/users-trend', async (req: Request, res: Response) => {
    try {
        const days = parseInt(req.query.days as string) || 7;
        const periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - days);

        const { data: users, error } = await supabase
            .from('profiles')
            .select('created_at')
            .gte('created_at', periodStart.toISOString());

        if (error) throw error;

        const grouped = groupByDay(users || [], 'created_at', days);

        res.json({
            success: true,
            data: grouped
        });

    } catch (error: any) {
        console.error('Error getting users trend:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get users trend'
        });
    }
});

/**
 * GET /api/analytics/jobs-trend
 * Get jobs trend data grouped by day
 */
router.get('/jobs-trend', async (req: Request, res: Response) => {
    try {
        const days = parseInt(req.query.days as string) || 7;
        const periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - days);

        const { data: jobs, error } = await supabase
            .from('jobs')
            .select('created_at')
            .gte('created_at', periodStart.toISOString());

        if (error) throw error;

        const grouped = groupByDay(jobs || [], 'created_at', days);

        res.json({
            success: true,
            data: grouped
        });

    } catch (error: any) {
        console.error('Error getting jobs trend:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get jobs trend'
        });
    }
});

/**
 * GET /api/analytics/applications-trend
 * Get applications trend data grouped by day
 */
router.get('/applications-trend', async (req: Request, res: Response) => {
    try {
        const days = parseInt(req.query.days as string) || 7;
        const periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - days);

        const { data: jobs, error } = await supabase
            .from('jobs')
            .select('applicants');

        if (error) throw error;

        // Extract all applications
        const applications: any[] = [];
        jobs?.forEach(job => {
            const applicants = job.applicants || [];
            applicants.forEach((app: any) => {
                if (app.applied_at) {
                    applications.push({ created_at: app.applied_at });
                }
            });
        });

        // Filter by period
        const filteredApplications = applications.filter(app =>
            new Date(app.created_at) > periodStart
        );

        const grouped = groupByDay(filteredApplications, 'created_at', days);

        res.json({
            success: true,
            data: grouped
        });

    } catch (error: any) {
        console.error('Error getting applications trend:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get applications trend'
        });
    }
});

/**
 * GET /api/analytics/users-distribution
 * Get users distribution by role
 */
router.get('/users-distribution', async (req: Request, res: Response) => {
    try {
        const { data: users, error } = await supabase
            .from('profiles')
            .select('role');

        if (error) throw error;

        const distribution: Record<string, number> = {};
        users?.forEach(user => {
            const role = user.role || 'candidate';
            distribution[role] = (distribution[role] || 0) + 1;
        });

        res.json({
            success: true,
            data: distribution
        });

    } catch (error: any) {
        console.error('Error getting users distribution:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get users distribution'
        });
    }
});

/**
 * GET /api/analytics/jobs-distribution
 * Get jobs distribution by status
 */
router.get('/jobs-distribution', async (req: Request, res: Response) => {
    try {
        const { data: jobs, error } = await supabase
            .from('jobs')
            .select('status, deadline');

        if (error) throw error;

        const distribution: Record<string, number> = { active: 0, expired: 0 };
        const now = new Date();

        jobs?.forEach(job => {
            const deadline = job.deadline ? new Date(job.deadline) : null;
            const isExpired = deadline && deadline < now;
            const status = isExpired ? 'expired' : 'active';
            distribution[status]++;
        });

        res.json({
            success: true,
            data: distribution
        });

    } catch (error: any) {
        console.error('Error getting jobs distribution:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get jobs distribution'
        });
    }
});

// Helper function to group data by day
function groupByDay(items: any[], dateField: string, days: number): { day: string; count: number }[] {
    const grouped: Record<string, number> = {};
    const now = new Date();

    // Initialize all days with 0
    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - i - 1));
        const key = `${date.getMonth() + 1}/${date.getDate()}`;
        grouped[key] = 0;
    }

    // Count items by day
    items.forEach(item => {
        const date = new Date(item[dateField]);
        const key = `${date.getMonth() + 1}/${date.getDate()}`;
        if (grouped.hasOwnProperty(key)) {
            grouped[key]++;
        }
    });

    return Object.entries(grouped).map(([day, count]) => ({ day, count }));
}

export default router;
