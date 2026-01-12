-- Kiểm tra xem có jobs nào không
SELECT COUNT(*) as total_jobs FROM jobs;

-- Xem tất cả các status hiện tại
SELECT status, COUNT(*) as count 
FROM jobs 
GROUP BY status;

-- Xem 5 tin gần nhất
SELECT id, title, company_name, status, created_at 
FROM jobs 
ORDER BY created_at DESC 
LIMIT 5;

-- UPDATE một tin để test (thay YOUR_JOB_ID bằng ID thực tế)
-- UPDATE jobs 
-- SET status = 'pending' 
-- WHERE id = 'YOUR_JOB_ID';

-- Hoặc tạo tin mới để test
INSERT INTO jobs (
    id,
    title,
    company_name,
    location,
    salary_min,
    salary_max,
    description,
    requirements,
    status,
    employer_id,
    created_at
) VALUES (
    gen_random_uuid(),
    'Senior Frontend Developer (Pending Test)',
    'NP Technology',
    'Hà Nội',
    15000000,
    25000000,
    'Tuyển dụng Frontend Developer có kinh nghiệm',
    'React, TypeScript, 2+ năm kinh nghiệm',
    'pending',
    (SELECT id FROM profiles WHERE role = 'employer' LIMIT 1),
    NOW()
);

-- Kiểm tra lại
SELECT id, title, company_name, status 
FROM jobs 
WHERE status = 'pending' 
ORDER BY created_at DESC;
