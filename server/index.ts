import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { interviewRouter } from "./routes/interview";
import { speechRouter } from "./routes/speech";
import { codeRouter } from "./routes/code";
import { setupSocketHandlers } from "./socket/handlers";

dotenv.config({ path: ".env.local" });

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Middleware
app.use(cors({
  origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/interview", interviewRouter);
app.use("/api/speech", speechRouter);
app.use("/api/code", codeRouter);

// Socket.IO
setupSocketHandlers(io);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO ready`);
});

export { io };
