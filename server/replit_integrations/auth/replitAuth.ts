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

  // Garante que o usuário simulado seja mantido na sessão
  passport.serializeUser((user: any, cb) => cb(null, user));
  passport.deserializeUser((user: any, cb) => cb(null, user));

  app.get("/api/login", (req, res) => res.redirect("/"));
  app.get("/api/callback", (req, res) => res.redirect("/"));
  app.get("/api/logout", (req, res) => {
    req.logout(() => res.redirect("/"));
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Simula um usuário logado COMPLETO
  // Adicionamos o campo 'claims' com 'sub' para evitar o erro de 'undefined' no front-end
  const mockUser = {
    id: "admin",
    email: "admin@admin.com",
    firstName: "Admin",
    lastName: "User",
    profileImageUrl: "",
    expires_at: 9999999999,
    claims: {
      sub: "admin", // O ID que o sistema estava procurando
      email: "admin@admin.com",
      first_name: "Admin",
      last_name: "User"
    }
  };

  (req as any).user = mockUser;
  
  // Forçamos o Passport a acreditar que estamos autenticados
  if (typeof req.isAuthenticated !== 'function') {
      req.isAuthenticated = () => true;
  }

  return next(); 
};
