import express, { type Express } from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(distPath));

  // No Express 5, usamos '(.*)' em vez de apenas '*' para capturar todas as rotas
  app.get("(.*)", (req, res, next) => {
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
