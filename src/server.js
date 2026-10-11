import "./config/env.js";
import app from "./app.js";

const PORT = process.env.PORT || 5175;

const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
    console.error(`unhandledRejection => ${err.name} || ${err.message}`);

    server.close(() => {
        console.error("shutting down...");
        process.exit(1);
    });
});
