import cors from "cors";
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { adminRouter } from "./routes/admin.js";
import { chatRouter } from "./routes/chat.js";
import { interviewRouter } from "./routes/interview.js";
import { resumeRouter } from "./routes/resume.js";
import { userRouter } from "./routes/users.js";
import { createRepository } from "./storage/repository.js";

const app = express();
const port = Number(process.env.PORT || 10000);
const repository = await createRepository();

app.locals.repository = repository;

app.use(helmet());
const allowedOrigins = (process.env.CLIENT_ORIGIN || process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "haven-ai-counsellor" });
});

app.use("/api/users", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/admin", adminRouter);
app.use("/chat", chatRouter);
app.use("/career-recommendations", userRouter);
app.use("/resume", resumeRouter);
app.use("/interview", interviewRouter);
app.use("/admin", adminRouter);

app.use((error, _request, response, _next) => {
  const status = error.status || 500;
  response.status(status).json({
    message: error.message || "Unexpected server error",
    status
  });
});

app.listen(port, () => {
  console.log(`Haven AI Counsellor API running on port ${port}`);
});
