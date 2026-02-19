import express, { type Express } from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// Definição manual para compatibilidade com ES Modules no Node.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  // Caminho aponta para a pasta onde o Vite gera o front-end
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(distPath));

  // Suporte para Single Page Application (React Router)
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
