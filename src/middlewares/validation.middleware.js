import AsyncHandler from "express-async-handler";

export const validate = (schema) => AsyncHandler(async (req, res, next) => {
    await schema.parseAsync(req.body);

    next();
});
