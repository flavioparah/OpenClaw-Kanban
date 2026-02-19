import express, { type Express } from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// Em ES Modules, precisamos definir o __dirname manualmente assim:
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  // Ajustando o caminho para encontrar a pasta public dentro de dist
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(distPath));

  // Rota curinga para garantir que o React Router funcione (SPA)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.resolve(distPath, "index.html"), (err) => {
      if (err) {
        res.status(404).send("Front-end não encontrado. Verifique se o build foi executado.");
      }
    });
  });
}
