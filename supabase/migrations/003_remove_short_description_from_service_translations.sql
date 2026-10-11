-- =========================================================
-- Migration: 003_remove_short_description_from_service_translations.sql
-- 1. Drop short_description from service_translations
-- =========================================================

ALTER TABLE service_translations DROP COLUMN IF EXISTS short_description;
