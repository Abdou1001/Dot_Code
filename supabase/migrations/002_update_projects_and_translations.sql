-- =========================================================
-- Migration: 002_update_projects_and_translations.sql
-- 1. Remove short_description from project_translations
-- 2. Update status CHECK constraint on projects table
-- =========================================================

-- 1. Drop short_description column from project_translations
ALTER TABLE project_translations DROP COLUMN IF EXISTS short_description;

-- 2. Update projects status check to include 'hidden'
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('draft', 'published', 'hidden'));
