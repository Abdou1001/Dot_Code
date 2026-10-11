// utils/pagination.js

// @Desc Create pagination data for Supabase
export const paginate = (req) => {

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 20;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    return {
        page,
        limit,
        from,
        to,
    };

};


// @Desc Create pagination response
export const paginationResult = (
    page,
    limit,
    count
) => {

    const totalPages = Math.ceil(count / limit);

    return {
        page,
        limit,

        totalResults: count,
        totalPages,

        nextPage:
            page < totalPages
                ? page + 1
                : null,

        prevPage:
            page > 1
                ? page - 1
                : null,
    };
};