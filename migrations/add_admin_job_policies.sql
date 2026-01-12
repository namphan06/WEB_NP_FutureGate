-- Migration: Allow admin to view all jobs for approval
-- This fixes the issue where admin cannot see pending jobs due to RLS

-- Option 1: Add admin read policy to jobs table
CREATE POLICY "Admins can read all jobs"
ON jobs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Option 2: Add admin read policy to school_partnership_jobs table
CREATE POLICY "Admins can read all partnership jobs"
ON school_partnership_jobs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Option 3: Add admin update policy for jobs (to approve/reject)
CREATE POLICY "Admins can update job status"
ON jobs
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Option 4: Add admin update policy for partnership jobs
CREATE POLICY "Admins can update partnership job admin_status"
ON school_partnership_jobs
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Verify policies
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('jobs', 'school_partnership_jobs')
ORDER BY tablename, policyname;
