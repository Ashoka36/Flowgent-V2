import express from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

// DEBUG CONFIRMATION (VISIBLE IN RENDER LOGS)
console.log("🔥 Automation Super-Brain V2 server.js loaded");

// APP SETUP
const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });

// MIDDLEWARE
app.use(express.json({ limit: "5mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
  })
);

// ROOT (BROWSER-SAFE)
app.get("/", (req, res) => {
  res.status(200).send(
    "Automation Super-Brain V2 is running. Use /health or POST /design"
  );
});

// HEALTH (RENDER + DEBUG)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "automation-super-brain-v2",
    port: PORT,
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// OPTIONAL AUTH (AUTO-DISABLED IF ENVS MISSING)
function optionalAuth(req, res, next) {
  if (!process.env.OWNER_EMAIL || !process.env.JWT_SECRET) {
    return next();
  }

  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.email !== process.env.OWNER_EMAIL) {
      return res.status(403).json({ error: "Not authorized" });
    }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// LOGIN (ONLY ACTIVE IF AUTH ENABLED)
app.post("/login", (req, res) => {
  if (!process.env.OWNER_EMAIL || !process.env.JWT_SECRET) {
    return res.status(400).json({ error: "Auth not enabled" });
  }

  const { email } = req.body;
  if (email !== process.env.OWNER_EMAIL) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "15m"
  });

  res.json({ token });
});

// CORE AUTOMATION ENDPOINT
app.post("/design", optionalAuth, upload.any(), (req, res) => {
  const textInput = req.body?.text || null;
  const files = req.files || [];

  res.status(200).json({
    received: {
      text: textInput,
      files: files.map(f => ({
        name: f.originalname,
        size: f.size,
        type: f.mimetype
      }))
    },
    output: {
      human_logic: "Trigger → Action → Condition",
      n8n_blueprint: "Node-based workflow",
      zapier_equivalent: "Zap-based workflow",
      architecture_notes: "Limits, retries, risks"
    }
  });
});

// CATCH-ALL (FAIL-PROOF, NO 404 EVER)
app.use((req, res) => {
  res.status(200).send(
    "Automation Super-Brain V2 active. Valid endpoints: /health, POST /design"
  );
});

// START
app.listen(PORT, () => {
  console.log(`🚀 Super-Brain V2 listening on port ${PORT}`);
});