import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.env.BASE || "http://127.0.0.1:3000";
const candidates = [
  process.env.EDGE_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);
const browser = candidates.find((candidate) => fs.existsSync(candidate));
if (!browser) {
  console.error("Edge ou Chrome não encontrado. Defina EDGE_PATH.");
  process.exit(2);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const port = 9800 + Math.floor(Math.random() * 100);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "light-login-smoke-"));
const child = spawn(
  browser,
  ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars", "about:blank"],
  { stdio: ["ignore", "ignore", "pipe"] },
);
let browserError = "";
child.stderr.on("data", (chunk) => { browserError += chunk.toString(); });

let cleaned = false;
function cleanup() {
  if (cleaned) return;
  cleaned = true;
  try { child.kill(); } catch {}
  setTimeout(() => {
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch {}
  }, 500);
}
process.on("exit", cleanup);

let ready = false;
for (let attempt = 0; attempt < 60; attempt += 1) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`);
    if (response.ok) { ready = true; break; }
  } catch {}
  if (child.exitCode !== null) break;
  await sleep(250);
}
if (!ready) {
  cleanup();
  console.error("O navegador não iniciou a porta de depuração.");
  if (browserError.trim()) console.error(browserError.trim().slice(0, 600));
  process.exit(2);
}

const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));

let id = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  } else if (message.method) {
    events.push(message);
  }
});

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const messageId = ++id;
  pending.set(messageId, { resolve, reject });
  ws.send(JSON.stringify({ id: messageId, method, params }));
});
const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || "Erro no navegador");
  return result.result.value;
};
const click = async (selector) => {
  const point = await evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return null; const box = element.getBoundingClientRect(); return { x: box.left + box.width / 2, y: box.top + box.height / 2 }; })()`);
  if (!point) throw new Error(`Elemento ausente: ${selector}`);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
};

let failures = 0;
let checks = 0;
function check(name, condition, detail = "") {
  checks += 1;
  if (!condition) failures += 1;
  console.log(`${condition ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

try {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: BASE });
  await sleep(1800);

  const initial = await evaluate(`(() => ({
    title: document.title,
    light: document.querySelector('main')?.classList.contains('light-on'),
    pressed: document.querySelector('.pull-switch')?.getAttribute('aria-pressed'),
    og: document.querySelector('meta[property="og:image"]')?.content,
    switchLabel: document.querySelector('.pull-switch')?.getAttribute('aria-label')
  }))()`);
  check("título e interface carregam", initial.title === "Light — Login Experience" && initial.light === true);
  check("cordão começa acessível e ligado", initial.pressed === "true" && initial.switchLabel === "Apagar o abajur");
  check("Open Graph usa o domínio público", initial.og === "https://light-login-x7rg.contato-rgsantos.workers.dev/og-v3.png", initial.og);

  await click(".pull-switch");
  await sleep(750);
  const off = await evaluate(`({ light: document.querySelector('main').classList.contains('light-on'), pressed: document.querySelector('.pull-switch').getAttribute('aria-pressed'), hidden: document.querySelector('.login-wrap').getAttribute('aria-hidden') })`);
  check("cordão apaga luz e retira formulário", off.light === false && off.pressed === "false" && off.hidden === "true");

  await click(".pull-switch");
  await sleep(750);
  check("cordão reacende a interface", await evaluate(`document.querySelector('main').classList.contains('light-on') && document.querySelector('.pull-switch').getAttribute('aria-pressed') === 'true'`));

  await click('input[name="email"]');
  await send("Input.insertText", { text: "teste@example.com" });
  await click('input[name="password"]');
  await send("Input.insertText", { text: "123456" });
  await click(".submit-button");
  await sleep(500);
  const submitted = await evaluate(`({ ok: document.querySelector('form').classList.contains('is-authenticated'), message: document.querySelector('[role=status]').textContent.trim() })`);
  check("formulário demonstra sucesso local", submitted.ok && submitted.message === "Acesso realizado.", submitted.message);

  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send("Page.reload", { ignoreCache: true });
  await sleep(1600);
  const mobile = await evaluate(`(() => {
    const button = document.querySelector('.pull-switch').getBoundingClientRect();
    const form = document.querySelector('.login-card').getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      buttonVisible: button.right > 0 && button.left < innerWidth && button.bottom > 0 && button.top < innerHeight,
      formVisible: form.right > 0 && form.left < innerWidth && form.bottom > 0 && form.top < innerHeight
    };
  })()`);
  check("layout móvel sem rolagem horizontal", mobile.overflow <= 0, `overflow=${mobile.overflow}`);
  check("cordão e formulário visíveis no celular", mobile.buttonVisible && mobile.formVisible);

  const browserErrors = events.filter((event) =>
    event.method === "Runtime.exceptionThrown" ||
    (event.method === "Log.entryAdded" && event.params.entry.level === "error"),
  );
  check("sem exceções no navegador", browserErrors.length === 0, `erros=${browserErrors.length}`);

  console.log(`\n${failures ? "FALHOU" : "OK"}  ${checks - failures}/${checks} verificações`);
} catch (error) {
  failures += 1;
  console.error("ERRO na verificação:", error.stack || error);
} finally {
  try { ws.close(); } catch {}
  cleanup();
  process.exitCode = failures ? 1 : 0;
}
