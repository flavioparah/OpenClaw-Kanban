import express, { type Express } from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

// Definição manual para compatibilidade com ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  // Serve os arquivos estáticos da pasta dist/public
  app.use(express.static(distPath));

  // Rota curinga compatível com Express 5.0
  // Usamos '/(.*)' para capturar qualquer caminho e servir o index.html (SPA)
  app.get("/(.*)", (req, res, next) => {
    // Se for uma chamada de API, não servimos o HTML, passamos para a próxima rota
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    res.sendFile(path.resolve(distPath, "index.html"), (err) => {
      if (err) {
        // Se o arquivo não existir, o build do front-end provavelmente falhou ou está no local errado
        res.status(404).send("Front-end não encontrado. Verifique a pasta dist/public.");
      }
    });
  });
}
