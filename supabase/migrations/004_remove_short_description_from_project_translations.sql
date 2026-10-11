-- =========================================================
-- Migration: 004_remove_short_description_from_project_translations.sql
-- 1. Drop short_description from project_translations
-- =========================================================

ALTER TABLE project_translations DROP COLUMN IF EXISTS short_description;
