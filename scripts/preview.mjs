import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

function resolveFile(pathname) {
  let relative;
  try {
    relative = decodeURIComponent(pathname).replace(/^\/+/, "");
  } catch {
    return null;
  }

  const candidates = relative
    ? [relative, `${relative}.html`, path.join(relative, "index.html")]
    : ["index.html"];

  for (const candidate of candidates) {
    const file = path.resolve(root, candidate);
    if (!file.startsWith(`${root}${path.sep}`) || !existsSync(file) || !statSync(file).isFile()) continue;
    return file;
  }
  return path.join(root, "404.html");
}

if (!existsSync(root)) {
  console.error("A pasta out não existe. Execute npm run build antes de npm run preview.");
  process.exit(1);
}

const server = createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  const pathname = new URL(request.url || "/", `http://${request.headers.host || host}`).pathname;
  const file = resolveFile(pathname);
  if (!file) {
    response.writeHead(400).end("Bad Request");
    return;
  }

  const notFound = path.basename(file) === "404.html";
  const extension = path.extname(file);
  response.writeHead(notFound ? 404 : 200, {
    "Content-Type": contentTypes[extension] || "application/octet-stream",
    "Content-Length": statSync(file).size,
  });
  if (request.method === "HEAD") response.end();
  else createReadStream(file).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Prévia estática: http://${host}:${port}`);
});
