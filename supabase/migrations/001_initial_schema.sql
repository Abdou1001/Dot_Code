-- =========================================================
-- Portfolio Database - Supabase / PostgreSQL
-- =========================================================

-- =========================================================
-- 1. USERS
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role VARCHAR(30) NOT NULL DEFAULT 'admin'
        CHECK (role = 'admin'),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Email verification
    email_verified_at TIMESTAMPTZ,

    email_otp_hash TEXT,
    email_otp_expires_at TIMESTAMPTZ,

    -- Password reset
    password_reset_otp_hash TEXT,
    password_reset_otp_expires_at TIMESTAMPTZ,
    password_reset_verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 2. CATEGORIES
-- =========================================================

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 3. PROJECTS
-- =========================================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(200) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'hidden')),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    live_url TEXT,
    github_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 4. PROJECT TRANSLATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS project_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL CHECK (locale IN ('ar', 'en')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    role TEXT,
    challenge TEXT,
    solution TEXT,
    result TEXT,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, locale)
);

-- =========================================================
-- 5. PROJECT IMAGES
-- =========================================================

CREATE TABLE IF NOT EXISTS project_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 6. TECHNOLOGIES
-- =========================================================

CREATE TABLE IF NOT EXISTS technologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 7. PROJECT TECHNOLOGIES
-- =========================================================

CREATE TABLE IF NOT EXISTS project_technologies (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, technology_id)
);

-- =========================================================
-- 8. PROJECT CATEGORIES
-- =========================================================

CREATE TABLE IF NOT EXISTS project_categories (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, category_id)
);

-- =========================================================
-- 9. SERVICES
-- =========================================================

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(150) NOT NULL UNIQUE,
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 10. SERVICE TRANSLATIONS
-- =========================================================

CREATE TABLE IF NOT EXISTS service_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    locale VARCHAR(5) NOT NULL CHECK (locale IN ('ar', 'en')),
    title VARCHAR(200) NOT NULL,
    short_description TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (service_id, locale)
);

-- =========================================================
-- 11. MESSAGES
-- =========================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'read', 'replied', 'archived')),
    ip_hash TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 12. TESTIMONIALS
-- =========================================================

CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name VARCHAR(150) NOT NULL,
    client_role VARCHAR(150),
    company VARCHAR(150),
    client_image TEXT,
    rating SMALLINT CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
    testimonial TEXT NOT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 13. VISITOR EVENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS visitor_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    page_path TEXT NOT NULL,
    referrer TEXT,
    device_type VARCHAR(30),
    country VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_published_featured
    ON projects(sort_order, created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_projects_published_featured_true
    ON projects(sort_order, created_at DESC) WHERE status = 'published' AND featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_project_translations_locale ON project_translations(locale);
CREATE INDEX IF NOT EXISTS idx_project_images_project_sort ON project_images(project_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_project_technologies_technology ON project_technologies(technology_id);
CREATE INDEX IF NOT EXISTS idx_project_categories_category ON project_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_services_active_sort ON services(sort_order) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_service_translations_locale ON service_translations(locale);
CREATE INDEX IF NOT EXISTS idx_messages_status_created ON messages(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_published_sort
    ON testimonials(sort_order, created_at DESC) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_visitor_events_created_at ON visitor_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_events_session ON visitor_events(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_events_page ON visitor_events(page_path, created_at DESC);

-- =========================================================
-- UPDATED_AT FUNCTION AND TRIGGERS
-- =========================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_translations_updated_at BEFORE UPDATE ON project_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_technologies_updated_at BEFORE UPDATE ON technologies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_translations_updated_at BEFORE UPDATE ON service_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_events ENABLE ROW LEVEL SECURITY;

-- Public read access is limited to data visible on the published site.
CREATE POLICY "Public can read published projects" ON projects
    FOR SELECT TO anon, authenticated
    USING (status = 'published');

CREATE POLICY "Public can read translations of published projects" ON project_translations
    FOR SELECT TO anon, authenticated
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_translations.project_id
          AND projects.status = 'published'
    ));

CREATE POLICY "Public can read images of published projects" ON project_images
    FOR SELECT TO anon, authenticated
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_images.project_id
          AND projects.status = 'published'
    ));

CREATE POLICY "Public can read active technologies" ON technologies
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);

CREATE POLICY "Public can read technologies of published projects" ON project_technologies
    FOR SELECT TO anon, authenticated
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_technologies.project_id
          AND projects.status = 'published'
    ));

CREATE POLICY "Public can read active categories" ON categories
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);

CREATE POLICY "Public can read categories of published projects" ON project_categories
    FOR SELECT TO anon, authenticated
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_categories.project_id
          AND projects.status = 'published'
    ));

CREATE POLICY "Public can read active services" ON services
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);

CREATE POLICY "Public can read translations of active services" ON service_translations
    FOR SELECT TO anon, authenticated
    USING (EXISTS (
        SELECT 1 FROM services
        WHERE services.id = service_translations.service_id
          AND services.is_active = TRUE
    ));

CREATE POLICY "Public can read published testimonials" ON testimonials
    FOR SELECT TO anon, authenticated
    USING (is_published = TRUE);

-- users, messages, and visitor_events intentionally have no public policies.
-- No public INSERT, UPDATE, or DELETE policies are created for any table.
