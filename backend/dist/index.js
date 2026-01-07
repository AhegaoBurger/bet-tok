import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { polymarket } from "./routes/polymarket.js";
const app = new Hono();
// Middleware
app.use("*", logger());
app.use("*", cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
// Health check
app.get("/health", (c) => c.json({ status: "ok" }));
// API routes
app.route("/api", polymarket);
// 404 handler
app.notFound((c) => c.json({ error: "Not found" }, 404));
// Error handler
app.onError((err, c) => {
    console.error("Server error:", err);
    return c.json({ error: "Internal server error" }, 500);
});
const port = process.env.PORT || 3001;
console.log(`Server starting on port ${port}...`);
export default {
    port,
    fetch: app.fetch,
};
//# sourceMappingURL=index.js.map