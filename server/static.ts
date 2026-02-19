import express, { type Express } from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  // Serve arquivos estáticos (js, css, imagens)
  app.use(express.static(distPath));

  // Em vez de usar strings com '*' ou '(.*)', usamos uma função middleware 
  // que captura tudo o que não foi pego pelo static ou pelas rotas de API.
  app.use((req, res, next) => {
    // Se a requisição for para a API, deixa passar para as rotas do servidor
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    // Para qualquer outra rota (navegação do usuário), entrega o index.html
    res.sendFile(path.resolve(distPath, "index.html"), (err) => {
      if (err) {
        // Se o arquivo não existir, retorna 404
        res.status(404).send("Front-end não encontrado. Verifique se o build foi concluído com sucesso.");
      }
    });
  });
}
