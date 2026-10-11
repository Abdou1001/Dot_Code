export const CACHE_KEYS = {
    // Projects
    PROJECTS: "projects",
    PROJECTS_LIST: (page, limit) => `projects:page:${page}:limit:${limit}`,
    PROJECT: (slug) => `project:${slug}`,
    FEATURED_PROJECTS: "projects:featured",

    // Categories
    CATEGORIES: "categories",
    CATEGORY: (id) => `category:${id}`,

    // Technologies
    TECHNOLOGIES: "technologies",
    TECHNOLOGY: (id) => `technology:${id}`,

    // Services
    SERVICES: "services",
    SERVICE: (id) => `service:${id}`,

    // Testimonials
    TESTIMONIALS: "testimonials",
    TESTIMONIAL: (id) => `testimonial:${id}`,

    // Dashboard
    DASHBOARD: "dashboard-statistics",
};

export const CACHE_TTL = {
    PROJECTS: 86400, // 24 hours
    CATEGORIES: 86400, // 24 hours
    TECHNOLOGIES: 86400, // 24 hours
    SERVICES: 86400, // 24 hours
    TESTIMONIALS: 86400, // 24 hours
    DASHBOARD: 300, // 5 minutes
};
