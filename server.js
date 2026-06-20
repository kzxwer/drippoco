const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

const allowedOrigins = ["https://kzxwer.github.io", "http://localhost:3000"];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "drippoco-api" });
});

app.post("/api/send-message", async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  if (!SLACK_WEBHOOK_URL) {
    return res.status(500).json({ error: "Slack webhook not configured" });
  }

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message.trim() }),
    });

    if (response.ok) {
      return res.json({ success: true, message: "Message sent" });
    } else {
      return res.status(response.status).json({ error: "Failed to send" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
