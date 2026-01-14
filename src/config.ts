import path from "node:path";

export type AppConfig = {
  port: number;
  cvmBaseUrl: string;
  downloadDir: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  trustProxy: boolean;
  userAgent: string;
};

const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (!value) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no"].includes(normalized)) {
    return false;
  }
  return fallback;
};

export const config: AppConfig = {
  port: toNumber(process.env.PORT, 3000),
  cvmBaseUrl: process.env.CVM_BASE_URL ?? "https://web.cvm.gov.br/app/fundosweb",
  downloadDir:
    process.env.DOWNLOAD_DIR ?? path.join(process.cwd(), "downloads"),
  rateLimitWindowMs: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 60000),
  rateLimitMax: toNumber(process.env.RATE_LIMIT_MAX, 10),
  trustProxy: toBoolean(process.env.TRUST_PROXY, false),
  userAgent: process.env.USER_AGENT ?? "cvm-proxy/0.1.0"
};
