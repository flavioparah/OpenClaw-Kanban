import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      // Usamos o 'sub' do nosso usuário simulado
      const userId = req.user.claims.sub;
      
      // Tenta buscar o usuário no banco de dados
      let user = await authStorage.getUser(userId);
      
      // Se o usuário não existir no banco ainda (primeiro acesso no Coolify),
      // nós criamos ele automaticamente para evitar erro 500
      if (!user) {
        user = await authStorage.upsertUser({
          id: userId,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          profileImageUrl: req.user.profileImageUrl || "",
        });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      // Retornamos os dados simulados diretamente se o banco falhar, 
      // para o app não travar na tela inicial
      res.json({
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
      });
    }
  });
}
