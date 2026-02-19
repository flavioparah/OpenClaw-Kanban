import express, { type Express } from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  // Serve arquivos estáticos primeiro
  app.use(express.static(distPath));

  // Rota curinga compatível com Express 5
  // Usamos ':path(.*)' para nomear o parâmetro e evitar o erro do path-to-regexp
  app.get("/:path(.*)", (req, res, next) => {
    // Ignora se for uma rota de API
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    // Entrega o index.html para qualquer outra rota (essencial para SPAs)
    res.sendFile(path.resolve(distPath, "index.html"), (err) => {
      if (err) {
        res.status(404).send("Front-end não encontrado. Verifique dist/public.");
      }
    });
  });
}
