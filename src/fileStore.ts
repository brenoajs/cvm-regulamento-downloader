import { promises as fs } from "node:fs";
import path from "node:path";

export const extractFileName = (
  contentDisposition?: string | null
): string | undefined => {
  if (!contentDisposition) {
    return undefined;
  }
  const match = /filename=([^;]+)/i.exec(contentDisposition);
  if (!match || !match[1]) {
    return undefined;
  }
  return match[1].trim().replace(/^"|"$/g, "");
};

const sanitizeFileName = (fileName: string): string => {
  const base = path.basename(fileName);
  return base.replace(/[^a-zA-Z0-9._-]/g, "_");
};

export type SaveDownloadResult = {
  filePath: string;
  fileName: string;
  relativePath: string;
};

export const saveDownload = async (
  downloadDir: string,
  cnpj: string,
  fileName: string,
  buffer: Buffer
): Promise<SaveDownloadResult> => {
  const safeFileName = sanitizeFileName(fileName);
  const safeCnpj = cnpj.replace(/\D/g, "");
  const targetDir = path.join(downloadDir, safeCnpj);
  await fs.mkdir(targetDir, { recursive: true });
  const filePath = path.join(targetDir, safeFileName);
  await fs.writeFile(filePath, buffer);
  return {
    filePath,
    fileName: safeFileName,
    relativePath: path.join(safeCnpj, safeFileName)
  };
};
