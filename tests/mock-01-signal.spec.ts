import { test, expect } from "@playwright/test";
import { promises as fs } from "node:fs";
import http from "node:http";
import { AddressInfo } from "node:net";
import path from "node:path";

let server: http.Server;
let baseUrl: string;

const publicDir = path.join(process.cwd(), "public");

const getContentType = (filePath: string): string => {
  const ext = path.extname(filePath);
  if (ext === ".html") {
    return "text/html; charset=utf-8";
  }
  if (ext === ".css") {
    return "text/css; charset=utf-8";
  }
  if (ext === ".js") {
    return "text/javascript; charset=utf-8";
  }
  return "application/octet-stream";
};

const startServer = async (): Promise<string> => {
  server = http.createServer(async (req, res) => {
    const requestPath = (req.url ?? "/").split("?")[0];
    const relativePath = requestPath === "/" ? "index.html" : requestPath.slice(1);
    const resolvedPath = path.resolve(publicDir, relativePath);
    if (!resolvedPath.toLowerCase().startsWith(publicDir.toLowerCase())) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("bad request");
      return;
    }

    try {
      const content = await fs.readFile(resolvedPath);
      res.writeHead(200, { "Content-Type": getContentType(resolvedPath) });
      res.end(content);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("not found");
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
};

test.beforeAll(async () => {
  baseUrl = await startServer();
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("loads base interface", async ({ page }) => {
  await page.goto(baseUrl);
  await expect(page.getByRole("heading", { name: "Signal Desk" })).toBeVisible();
  await expect(page.locator("#cnpj-input")).toBeVisible();
  await expect(page.locator("#download-btn")).toBeVisible();
});

test("requires cnpj before request", async ({ page }) => {
  await page.goto(baseUrl);
  await page.click("#download-btn");
  await expect(page.locator("#status-block")).toContainText("cnpj obrigatorio");
});

test("renders success response", async ({ page }) => {
  await page.goto(baseUrl);

  await page.route("**/regulamentos/ultimo", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        cnpj: "36498670000127",
        registroFundoId: 43563,
        regulamentoId: 135503,
        dataInicioVigencia: "2025-05-14T03:00:00.000Z",
        fileName: "DOC_REGUL_43563_135503_2025_05.pdf",
        filePath: "downloads/36498670000127/DOC_REGUL_43563_135503_2025_05.pdf"
      })
    });
  });

  await page.fill("#cnpj-input", "36498670000127");
  await page.click("#download-btn");

  await expect(page.locator("#status-block")).toContainText("concluido");
  await expect(page.locator("#output")).toContainText("DOC_REGUL_43563_135503_2025_05.pdf");
});

test("renders backend error", async ({ page }) => {
  await page.goto(baseUrl);

  await page.route("**/regulamentos/ultimo", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ error: "cnpj_invalid" })
    });
  });

  await page.fill("#cnpj-input", "123");
  await page.click("#download-btn");

  await expect(page.locator("#status-block")).toContainText("erro");
  await expect(page.locator("#output")).toContainText("cnpj_invalid");
});

test("handles network error", async ({ page }) => {
  await page.goto(baseUrl);

  await page.route("**/regulamentos/ultimo", async (route) => {
    await route.abort();
  });

  await page.fill("#cnpj-input", "36498670000127");
  await page.click("#download-btn");

  await expect(page.locator("#status-block")).toContainText("erro de rede");
  await expect(page.locator("#output")).toContainText("network_error");
});

test("clears interface", async ({ page }) => {
  await page.goto(baseUrl);
  await page.fill("#cnpj-input", "36498670000127");
  await page.click("#clear-btn");

  await expect(page.locator("#cnpj-input")).toHaveValue("");
  await expect(page.locator("#output")).toHaveText("{}");
  await expect(page.locator("#status-block")).toContainText("aguardando");
});
