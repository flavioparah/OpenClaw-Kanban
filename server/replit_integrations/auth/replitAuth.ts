import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";

// Mock para ignorar a configuração do Replit que trava o deploy
const getOidcConfig = async () => ({});

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 semana
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, 
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "uma-senha-qualquer-segura",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, 
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  app.get("/api/login", (req, res) => res.redirect("/"));
  app.get("/api/callback", (req, res) => res.redirect("/"));
  app.get("/api/logout", (req, res) => {
    req.logout(() => res.redirect("/"));
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Simula um usuário logado para ignorar o bloqueio de login do Replit
  (req as any).user = {
    id: "admin",
    email: "admin@admin.com",
    firstName: "Admin",
    expires_at: 9999999999
  };
  return next(); 
};
