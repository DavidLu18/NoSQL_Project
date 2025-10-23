-- ============================================
-- Couchbase N1QL Indexes for ATS Application
-- ============================================
-- Run these in Couchbase Query Workbench
-- Bucket: ats_bucket, Scope: main
-- ============================================

-- Users Indexes
-- ============================================
CREATE INDEX idx_users_email 
ON `ats_bucket`.main.users(email);

CREATE INDEX idx_users_role 
ON `ats_bucket`.main.users(`role`);

CREATE INDEX idx_users_active 
ON `ats_bucket`.main.users(isActive) 
WHERE isActive = true;

-- Jobs Indexes
-- ============================================
CREATE INDEX idx_jobs_status 
ON `ats_bucket`.main.jobs(`status`);

CREATE INDEX idx_jobs_open 
ON `ats_bucket`.main.jobs(`status`, `type`, experienceLevel, location, createdAt DESC) 
WHERE `status` = 'open';

CREATE INDEX idx_jobs_recruiter 
ON `ats_bucket`.main.jobs(recruiterId, `status`);

CREATE INDEX idx_jobs_search 
ON `ats_bucket`.main.jobs(LOWER(title), LOWER(department), LOWER(location), `status`);

CREATE INDEX idx_jobs_filters 
ON `ats_bucket`.main.jobs(`type`, experienceLevel, `status`, location);

-- Candidates Indexes
-- ============================================
CREATE INDEX idx_candidates_email 
ON `ats_bucket`.main.candidates(email);

CREATE INDEX idx_candidates_source 
ON `ats_bucket`.main.candidates(source);

CREATE INDEX idx_candidates_skills 
ON `ats_bucket`.main.candidates(DISTINCT ARRAY skill FOR skill IN skills END);

CREATE INDEX idx_candidates_experience 
ON `ats_bucket`.main.candidates(experienceYears);

CREATE INDEX idx_candidates_search 
ON `ats_bucket`.main.candidates(
  LOWER(firstName), 
  LOWER(lastName), 
  LOWER(email),
  LOWER(currentTitle),
  LOWER(currentCompany)
);

-- Applications Indexes
-- ============================================
CREATE INDEX idx_applications_tracking_token 
ON `ats_bucket`.main.applications(trackingToken) 
WHERE trackingToken IS NOT NULL;

CREATE INDEX idx_applications_job 
ON `ats_bucket`.main.applications(jobId, `status`);

CREATE INDEX idx_applications_candidate 
ON `ats_bucket`.main.applications(candidateId, `status`);

CREATE INDEX idx_applications_status 
ON `ats_bucket`.main.applications(`status`, appliedAt DESC);

CREATE INDEX idx_applications_source 
ON `ats_bucket`.main.applications(source, `status`);

CREATE INDEX idx_applications_stage 
ON `ats_bucket`.main.applications(jobId, currentStageId);

CREATE INDEX idx_applications_date 
ON `ats_bucket`.main.applications(appliedAt DESC, `status`);

-- Interviews Indexes
-- ============================================
CREATE INDEX idx_interviews_application 
ON `ats_bucket`.main.interviews(applicationId);

CREATE INDEX idx_interviews_job 
ON `ats_bucket`.main.interviews(jobId, `status`);

CREATE INDEX idx_interviews_candidate 
ON `ats_bucket`.main.interviews(candidateId, scheduledDate);

CREATE INDEX idx_interviews_date 
ON `ats_bucket`.main.interviews(scheduledDate, `status`);

CREATE INDEX idx_interviews_interviewer 
ON `ats_bucket`.main.interviews(DISTINCT ARRAY interviewer FOR interviewer IN interviewers END);

CREATE INDEX idx_interviews_status 
ON `ats_bucket`.main.interviews(`status`, scheduledDate DESC);

-- Tasks Indexes
-- ============================================
CREATE INDEX idx_tasks_assignee 
ON `ats_bucket`.main.tasks(assigneeId, `status`);

CREATE INDEX idx_tasks_status 
ON `ats_bucket`.main.tasks(`status`, priority);

CREATE INDEX idx_tasks_due 
ON `ats_bucket`.main.tasks(dueDate, `status`) 
WHERE `status` != 'done' AND `status` != 'cancelled';

CREATE INDEX idx_tasks_creator 
ON `ats_bucket`.main.tasks(createdBy, `status`);

-- Composite Indexes for Common Queries
-- ============================================
CREATE INDEX idx_applications_job_candidate 
ON `ats_bucket`.main.applications(jobId, candidateId, `status`);

CREATE INDEX idx_interviews_job_candidate 
ON `ats_bucket`.main.interviews(jobId, candidateId, scheduledDate);

CREATE INDEX idx_candidates_name 
ON `ats_bucket`.main.candidates(LOWER(firstName), LOWER(lastName));

-- Full Text Search (if Couchbase FTS is enabled)
-- ============================================
-- CREATE FULLTEXT INDEX idx_jobs_fts 
-- ON `ats_bucket`.main.jobs(title, description, requirements, responsibilities);

-- CREATE FULLTEXT INDEX idx_candidates_fts 
-- ON `ats_bucket`.main.candidates(firstName, lastName, currentTitle, currentCompany, skills);

-- Verify Indexes
-- ============================================
SELECT * FROM system:indexes 
WHERE keyspace_id = 'ats_bucket' 
AND state = 'online';

-- ============================================
-- Performance Tips:
-- ============================================
-- 1. Monitor index usage: SELECT * FROM system:indexes_stats
-- 2. Use EXPLAIN to check query plan
-- 3. Update statistics: UPDATE STATISTICS FOR `ats_bucket`.main.jobs
-- 4. Consider partitioned indexes for large datasets
-- 5. Use covering indexes where possible
-- ============================================

