import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = (() => {
  try {
    const database = new Database("aetheris_v2.db");
    database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        credits INTEGER DEFAULT 10,
        plan TEXT DEFAULT 'free',
        stripe_customer_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        prompt TEXT,
        config TEXT,
        layout TEXT,
        status TEXT DEFAULT 'completed',
        preview_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS project_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        layout TEXT,
        config TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(project_id) REFERENCES projects(id)
      );
      CREATE TABLE IF NOT EXISTS deployments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        subdomain TEXT UNIQUE,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(project_id) REFERENCES projects(id)
      );
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS white_label (
        user_id INTEGER PRIMARY KEY,
        brand_name TEXT,
        logo_url TEXT,
        primary_color TEXT,
        custom_domain TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id INTEGER PRIMARY KEY,
        theme TEXT DEFAULT 'dark',
        notifications_enabled INTEGER DEFAULT 1,
        api_key_custom TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
      CREATE TABLE IF NOT EXISTS template_prompts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        simple_prompt TEXT,
        medium_prompt TEXT,
        complex_prompt TEXT
      );
    `);
    
    // Seed template prompts if empty
    const count = database.prepare("SELECT COUNT(*) as count FROM template_prompts").get() as { count: number };
    if (count.count === 0) {
      const insert = database.prepare("INSERT INTO template_prompts (category, simple_prompt, medium_prompt, complex_prompt) VALUES (?, ?, ?, ?)");
      insert.run("E-commerce", 
        "Crie um e-commerce simples de roupas com grid de produtos e carrinho.",
        "Desenvolva um e-commerce moderno com filtros avançados, busca em tempo real e checkout responsivo.",
        "Construa um marketplace ultra-detalhado com design 3D interativo para visualização de produtos, sistema de leilão e dashboard de vendedor completo."
      );
      insert.run("SaaS", 
        "Landing page simples para um software de gestão com lista de recursos.",
        "Site SaaS completo com página de preços, blog, FAQ e área de login simulada.",
        "Plataforma SaaS futurista com visualizações de dados complexas usando D3.js, animações de scroll imersivas e design system personalizado."
      );
    }
    return database;
  } catch (e) {
    console.error("Database initialization failed. Running in-memory mode.", e);
    // Fallback to in-memory if file system is read-only (common in serverless)
    return new Database(":memory:");
  }
})();

export const app = express();
const PORT = 3000;

app.use(express.json());

  // SaaS Plan Configuration
  const PLANS = {
    free: { credits: 10, projects: 3, features: ['basic_editor'] },
    pro: { credits: 100, projects: 20, features: ['basic_editor', 'white_label', 'custom_domain'] },
    enterprise: { credits: 9999, projects: 9999, features: ['basic_editor', 'white_label', 'custom_domain', 'priority_support'] }
  };

  // Middleware to log activity
  const logActivity = (userId: number, action: string, details: string) => {
    try {
      db.prepare("INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)")
        .run(userId, action, details);
    } catch (e) {
      console.error("Failed to log activity:", e);
    }
  };

  // Auth Endpoints
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      logActivity(user.id, "LOGIN", "Usuário realizou login no sistema.");
      res.json({ success: true, user });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { email, password } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO users (email, password, credits, plan) VALUES (?, ?, ?, ?)");
      const info = stmt.run(email, password, PLANS.free.credits, 'free');
      logActivity(Number(info.lastInsertRowid), "REGISTER", "Nova conta criada com plano Free.");
      res.json({ success: true, userId: info.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Email already exists" });
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
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
      if (!user) return res.status(404).json({ error: "User not found" });

      // Check project limit
      const projectCount = db.prepare("SELECT COUNT(*) as count FROM projects WHERE user_id = ?").get(userId) as { count: number };
      const planLimits = PLANS[user.plan as keyof typeof PLANS];
      
      if (projectCount.count >= planLimits.projects) {
        return res.status(403).json({ error: `Limite de projetos atingido para o plano ${user.plan}.` });
      }

      if (user.credits < 1) {
        return res.status(403).json({ error: "Créditos insuficientes" });
      }

      const transaction = db.transaction(() => {
        db.prepare("UPDATE users SET credits = credits - 1 WHERE id = ?").run(userId);
        const stmt = db.prepare("INSERT INTO projects (user_id, name, prompt, config, layout) VALUES (?, ?, ?, ?, ?)");
        const info = stmt.run(userId, name, prompt, JSON.stringify(config), JSON.stringify([]));
        return info.lastInsertRowid;
      });

      const projectId = transaction();
      logActivity(userId, "PROJECT_CREATE", `Projeto "${name}" criado.`);
      res.json({ success: true, projectId });
    } catch (e) {
      console.error("Error creating project:", e);
      res.status(500).json({ error: "Erro ao criar projeto" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Aetheris AI Engine Online" });
  });

  // White Label Endpoints
  app.get("/api/white-label/:userId", (req, res) => {
    const userId = req.params.userId;
    const data = db.prepare("SELECT * FROM white_label WHERE user_id = ?").get(userId);
    res.json(data || { brand_name: "Aetheris AI", primary_color: "#00f5ff" });
  });

  app.post("/api/white-label", (req, res) => {
    const { userId, brandName, logoUrl, primaryColor, customDomain } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO white_label (user_id, brand_name, logo_url, primary_color, custom_domain)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, brandName, logoUrl, primaryColor, customDomain);
    res.json({ success: true });
  });

  // Settings Endpoints
  app.get("/api/settings/:userId", (req, res) => {
    const userId = req.params.userId;
    const data = db.prepare("SELECT * FROM user_settings WHERE user_id = ?").get(userId);
    res.json(data || { theme: "dark", notifications_enabled: 1 });
  });

  app.post("/api/settings", (req, res) => {
    const { userId, theme, notificationsEnabled, apiKeyCustom } = req.body;
    db.prepare(`
      INSERT OR REPLACE INTO user_settings (user_id, theme, notifications_enabled, api_key_custom)
      VALUES (?, ?, ?, ?)
    `).run(userId, theme, notificationsEnabled ? 1 : 0, apiKeyCustom);
    res.json({ success: true });
  });

  // Template Prompts Endpoints
  app.get("/api/template-prompts", (req, res) => {
    try {
      const data = db.prepare("SELECT * FROM template_prompts").all();
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  // Project Editor Endpoints
  app.post("/api/projects/:id/layout", (req, res) => {
    const projectId = req.params.id;
    const { layout, config } = req.body;
    
    try {
      // Save current to versions first
      const current = db.prepare("SELECT layout, config FROM projects WHERE id = ?").get(projectId) as any;
      if (current) {
        db.prepare("INSERT INTO project_versions (project_id, layout, config) VALUES (?, ?, ?)")
          .run(projectId, current.layout, current.config);
      }

      // Update project
      db.prepare("UPDATE projects SET layout = ?, config = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(JSON.stringify(layout), JSON.stringify(config), projectId);
      
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Failed to save layout" });
    }
  });

  app.get("/api/projects/:id/versions", (req, res) => {
    const projectId = req.params.id;
    const versions = db.prepare("SELECT * FROM project_versions WHERE project_id = ? ORDER BY created_at DESC").all(projectId);
    res.json(versions);
  });

  // Deployment Endpoints
  app.post("/api/deploy", (req, res) => {
    const { projectId, subdomain } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO deployments (project_id, subdomain) VALUES (?, ?)");
      const info = stmt.run(projectId, subdomain);
      res.json({ success: true, deploymentId: info.lastInsertRowid, url: `https://${subdomain}.aetheris.ai` });
    } catch (e) {
      res.status(400).json({ error: "Subdomain already taken" });
    }
  });

  // Activity Logs
  app.get("/api/activity/:userId", (req, res) => {
    const logs = db.prepare("SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50").all(req.params.userId);
    res.json(logs);
  });

  // Stripe Webhook (Skeleton)
  app.post("/api/stripe/webhook", (req, res) => {
    const event = req.body;
    // Handle subscription events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const plan = session.metadata.plan;
      
      db.prepare("UPDATE users SET plan = ?, credits = credits + ? WHERE id = ?")
        .run(plan, PLANS[plan as keyof typeof PLANS].credits, userId);
      
      logActivity(Number(userId), "SUBSCRIPTION_UPGRADE", `Plano atualizado para ${plan}.`);
    }
    res.json({ received: true });
  });

  // Admin Endpoints
  app.get("/api/admin/stats", (req, res) => {
    const stats = {
      totalUsers: db.prepare("SELECT COUNT(*) as count FROM users").get(),
      totalProjects: db.prepare("SELECT COUNT(*) as count FROM projects").get(),
      recentLogs: db.prepare("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10").all()
    };
    res.json(stats);
  });

  // Prompt Improvement Simulation (with 100 uses limit)
  const promptImprovementCounts = new Map<string, number>();

  app.post("/api/improve-prompt", (req, res) => {
    const { userId, prompt } = req.body;
    const count = promptImprovementCounts.get(userId) || 0;
    
    if (count >= 100) {
      return res.status(403).json({ error: "Limite de 100 melhorias de prompt atingido." });
    }

    promptImprovementCounts.set(userId, count + 1);
    
    // Simulate improvement
    const improved = `[OTIMIZADO POR IA] ${prompt}. Adicione design system ultra-moderno, animações de entrada motion.js e otimização de performance LCP.`;
    res.json({ improved, remaining: 100 - (count + 1) });
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

async function init() {
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

  if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Aetheris AI running on http://localhost:${PORT}`);
    });
  }
}

init();

export default app;
