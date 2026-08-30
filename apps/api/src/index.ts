import express from "express";
import cors from "cors";
import { sessionRouter } from "./routes/session.js";
import { learningRouter } from "./routes/learning.js";
import { authRouter } from "./routes/auth.js";
import { editorialRouter } from "./routes/editorial.js";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/sessions", sessionRouter);
app.use("/api/learning", learningRouter);
app.use("/api/auth", authRouter);
app.use("/api/editorial", editorialRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`[API] Server is running on port ${port}`);
});
