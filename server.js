import express from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

console.log("🔥 Automation Super-Brain V2 + UI loaded");

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });

// middleware
app.use(express.json({ limit: "5mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200
  })
);

// ---------------- UI ----------------
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Automation Super-Brain</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #0f172a;
      color: #e5e7eb;
      padding: 40px;
    }
    h1 { color: #38bdf8; }
    textarea, input {
      width: 100%;
      margin-top: 10px;
      padding: 12px;
      background: #020617;
      color: #e5e7eb;
      border: 1px solid #334155;
      border-radius: 6px;
    }
    button {
      margin-top: 20px;
      padding: 12px 20px;
      background: #38bdf8;
      color: #020617;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
    }
    pre {
      background: #020617;
      padding: 15px;
      margin-top: 20px;
      border-radius: 6px;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>

<h1>Automation Super-Brain</h1>

<label>Describe your automation:</label>
<textarea id="text" rows="6"></textarea>

<label>Upload screenshots / diagrams (optional):</label>
<input type="file" id="files" multiple />

<button onclick="submitForm()">Generate Automation</button>

<pre id="output"></pre>

<script>
async function submitForm() {
  const formData = new FormData();
  formData.append("text", document.getElementById("text").value);

  const files = document.getElementById("files").files;
  for (let f of files) {
    formData.append("files", f);
  }

  document.getElementById("output").textContent = "Processing...";

  const res = await fetch("/design", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  document.getElementById("output").textContent =
    JSON.stringify(data, null, 2);
}
</script>

</body>
</html>
`);
});

// ---------------- HEALTH ----------------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "automation-super-brain-v2",
    port: PORT,
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

// ---------------- AUTH (OPTIONAL) ----------------
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

// ---------------- CORE API ----------------
app.post("/design", optionalAuth, upload.any(), (req, res) => {
  const textInput = req.body?.text || null;
  const files = req.files || [];

  res.json({
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

// ---------------- CATCH ALL ----------------
app.use((req, res) => {
  res.status(200).send("Automation Super-Brain running.");
});

// start
app.listen(PORT, () => {
  console.log(`🚀 Super-Brain V2 + UI listening on port ${PORT}`);
});
