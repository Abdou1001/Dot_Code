import { supabase } from "../../config/supabase.js";
import AsyncHandler from "express-async-handler";
import ApiError from "../../utils/ApiError.js";
import { sendSuccess } from "../../utils/response.js";
import { getCache, setCache } from "../../services/cache.service.js";
import { CACHE_KEYS, CACHE_TTL } from "../../config/cache.js";

// Helper to count and sort top items
const getTopFrequencies = (items, limit = 10) => {
    const counts = {};
    for (const item of items) {
        if (!item) continue;
        counts[item] = (counts[item] || 0) + 1;
    }

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([key, count]) => ({ item: key, count }));
};

// @Desc Get visitor analytics & summaries for the admin dashboard
// @Route GET /api/visitor-events/dashboard
// @Access Private (Admin only)
export const getVisitorAnalytics = AsyncHandler(async (req, res, next) => {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    const cacheKey = `${CACHE_KEYS.DASHBOARD}:visitor-events:${days}`;

    // 1. Check Redis cache
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
        return sendSuccess(res, {
            statusCode: 200,
            message: "Visitor analytics retrieved successfully",
            results: cachedData,
        });
    }

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // 2. Database aggregated counts
    const [totalResult, todayResult, eventsResult] = await Promise.all([
        supabase
            .from("visitor_events")
            .select("*", { count: "exact", head: true })
            .gte("created_at", since),
        supabase
            .from("visitor_events")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayStart.toISOString()),
        supabase
            .from("visitor_events")
            .select("session_id, page_path, referrer, device_type, country, created_at")
            .gte("created_at", since)
            .order("created_at", { ascending: false })
            .limit(5000),
    ]);

    if (totalResult.error || eventsResult.error) {
        return next(new ApiError("Failed to fetch analytics data", 500));
    }

    const totalViews = totalResult.count || 0;
    const todayViews = todayResult.count || 0;
    const rows = eventsResult.data || [];

    // 3. Aggregate dimensions
    const uniqueSessions = new Set();
    const pagePaths = [];
    const referrers = [];
    const deviceCounts = {};
    const countries = [];
    const dailyMap = {};

    for (const row of rows) {
        if (row.session_id) uniqueSessions.add(row.session_id);
        if (row.page_path) pagePaths.push(row.page_path);
        if (row.referrer) referrers.push(row.referrer);
        if (row.country) countries.push(row.country);

        const dev = row.device_type || "unknown";
        deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;

        if (row.created_at) {
            const dateStr = row.created_at.slice(0, 10);
            dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;
        }
    }

    const uniqueVisitors = uniqueSessions.size;
    const avgPagesPerSession = uniqueVisitors > 0
        ? Number((rows.length / uniqueVisitors).toFixed(2))
        : 0;

    const dailyTrends = Object.entries(dailyMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count }));

    const analyticsData = {
        timeframe: {
            days,
            since,
        },
        overview: {
            total_views: totalViews,
            today_views: todayViews,
            unique_visitors: uniqueVisitors,
            avg_pages_per_session: avgPagesPerSession,
        },
        top_pages: getTopFrequencies(pagePaths, 10),
        device_breakdown: Object.entries(deviceCounts).map(([device, count]) => ({ device, count })),
        top_referrers: getTopFrequencies(referrers, 10),
        top_countries: getTopFrequencies(countries, 10),
        daily_trends: dailyTrends,
    };

    // 4. Cache in Redis
    await setCache(cacheKey, analyticsData, CACHE_TTL.DASHBOARD);

    return sendSuccess(res, {
        statusCode: 200,
        message: "Visitor analytics retrieved successfully",
        results: analyticsData,
    });
});
