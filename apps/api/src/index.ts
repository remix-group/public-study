import express from "express";
import { sessionRouter } from "./routes/session.js";
import { learningRouter } from "./routes/learning.js";
import { authRouter } from "./routes/auth.js";
import { editorialRouter } from "./routes/editorial.js";
import { knowledgeRouter } from "./routes/knowledge.js";
import { securityHeaders } from "./security/request-protection.js";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.disable("x-powered-by");
app.use(securityHeaders);
// The web client is served through the same origin (Vite proxy in development,
// Nginx in deployment), therefore no permissive CORS policy is required.
app.use(express.json({ limit: "256kb" }));

// Routes
app.use("/api/sessions", sessionRouter);
app.use("/api/learning", learningRouter);
app.use("/api/auth", authRouter);
app.use("/api/editorial", editorialRouter);
app.use("/api/knowledge", knowledgeRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled Error:", err instanceof Error ? err.message : err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`[API] Server is running on port ${port}`);
});
