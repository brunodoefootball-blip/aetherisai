import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("aetheris_v2.db");

// Initialize DB with expanded schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    credits INTEGER DEFAULT 5,
    plan TEXT DEFAULT 'free',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    prompt TEXT,
    config TEXT,
    status TEXT DEFAULT 'completed',
    preview_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Endpoints
  app.post("/api/auth/register", (req, res) => {
    const { email, password } = req.body;
    console.log(`Register attempt: ${email}`);
    try {
      // Start with 10 credits instead of 5
      const stmt = db.prepare("INSERT INTO users (email, password, credits) VALUES (?, ?, ?)");
      const info = stmt.run(email, password, 10);
      console.log(`User registered: ${email} (ID: ${info.lastInsertRowid})`);
      res.json({ success: true, userId: info.lastInsertRowid });
    } catch (e) {
      console.error(`Registration error for ${email}:`, e);
      res.status(400).json({ error: "Email already exists or invalid data" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt: ${email}`);
    try {
      const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
      if (user) {
        console.log(`Login successful: ${email}`);
        res.json({ success: true, user });
      } else {
        console.log(`Login failed: ${email} (Invalid credentials)`);
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (e) {
      console.error(`Login error for ${email}:`, e);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Project Endpoints
  app.get("/api/projects/:userId", (req, res) => {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const projects = db.prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?")
        .all(userId, limit, offset);
      
      const total = db.prepare("SELECT COUNT(*) as count FROM projects WHERE user_id = ?")
        .get(userId) as { count: number };

      res.json({
        projects,
        total: total.count,
        limit,
        offset
      });
    } catch (e) {
      console.error("Error fetching projects:", e);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", (req, res) => {
    const { userId, name, prompt, config } = req.body;
    
    try {
      // Check credits
      const user = db.prepare("SELECT credits FROM users WHERE id = ?").get(userId) as { credits: number };
      if (!user || user.credits < 1) {
        return res.status(403).json({ error: "Créditos insuficientes" });
      }

      // Start transaction
      const transaction = db.transaction(() => {
        // Deduct credit
        db.prepare("UPDATE users SET credits = credits - 1 WHERE id = ?").run(userId);
        
        // Create project
        const stmt = db.prepare("INSERT INTO projects (user_id, name, prompt, config) VALUES (?, ?, ?, ?)");
        const info = stmt.run(userId, name, prompt, JSON.stringify(config));
        return info.lastInsertRowid;
      });

      const projectId = transaction();
      res.json({ success: true, projectId });
    } catch (e) {
      console.error("Error creating project:", e);
      res.status(500).json({ error: "Erro ao criar projeto" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Aetheris AI Engine Online" });
  });

  app.post("/api/generate-preview", async (req, res) => {
    const { prompt } = req.body;
    // Simulate generation delay and steps
    res.json({
      steps: [
        "Analyzing requirements...",
        "Generating design system...",
        "Building React components...",
        "Configuring Express backend...",
        "Optimizing SEO and Copy...",
        "Injecting 3D elements...",
        "Finalizing deployment package..."
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aetheris AI running on http://localhost:${PORT}`);
  });
}

startServer();
