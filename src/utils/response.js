export const sendSuccess = (res, {
    statusCode = 200,
    message,
    results,
    pagination,
} = {}) => {
    const response = {
        status: "success",
        message,
    };

    if (pagination) response.pagination = pagination;
    if (results !== undefined) response.results = results;

    return res.status(statusCode).json(response);
};
