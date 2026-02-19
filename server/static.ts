import express, { type Express } from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  // 1. Entrega arquivos físicos (JS, CSS, Imagens) primeiro
  app.use(express.static(distPath));

  // 2. Middleware "Pega-Tudo" Universal
  // Usamos app.use em vez de app.get para não passar pelo motor de Path-to-RegExp
  app.use((req, res, next) => {
    // Se for uma rota de API, ignora e deixa o servidor processar
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    // Para qualquer outra rota, entrega o index.html do front-end
    res.sendFile(path.resolve(distPath, "index.html"), (err) => {
      if (err) {
        // Se o arquivo não existir, o build pode ter falhado
        res.status(404).send("Front-end não encontrado. Verifique se o build gerou a pasta dist/public.");
      }
    });
  });
}
