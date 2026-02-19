import * as client from "openid-client";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";

// Mock de configuração para não quebrar o código original
const getOidcConfig = async () => ({});

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true, // Alterado para true para facilitar o deploy inicial
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
      secure: false, // Mude para false se não tiver HTTPS configurado ainda no Coolify
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

  // Rotas de login/logout desativadas ou simplificadas
  app.get("/api/login", (req, res) => res.redirect("/"));
  app.get("/api/callback", (req, res) => res.redirect("/"));
  app.get("/api/logout", (req, res) => {
    req.logout(() => res.redirect("/"));
  });
}

// O "PULO DO GATO": Esta função agora sempre deixa você passar
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Simulamos um usuário logado para o sistema não dar erro 401
  (req as any).user = {
    id: "admin",
    email: "admin@admin.com",
    firstName: "Admin",
    expires_at: 9999999999
  };
  return next(); 
};
