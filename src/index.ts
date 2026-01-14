import path from "node:path";
import express from "express";

import { config } from "./config";
import {
  baixarRegulamento,
  buscarFundosPorCnpj,
  CvmRequestError,
  listarRegulamentos,
  obterRegistroFundo
} from "./cvmClient";
import { extractFileName, saveDownload } from "./fileStore";
import { logger } from "./logger";
import { createRateLimiter } from "./rateLimit";
import {
  isValidCnpjLength,
  normalizeCnpj,
  pickLatestRegulamento,
  pickRegistroResumo
} from "./utils";

const app = express();

app.set("trust proxy", config.trustProxy);
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(
  createRateLimiter({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    trustProxy: config.trustProxy
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const getCnpjFromRequest = (req: express.Request): string | undefined => {
  if (req.body && typeof req.body === "object" && "cnpj" in req.body) {
    const bodyValue = (req.body as { cnpj?: unknown }).cnpj;
    if (typeof bodyValue === "string") {
      return bodyValue;
    }
  }
  const queryValue = req.query.cnpj;
  if (typeof queryValue === "string") {
    return queryValue;
  }
  return undefined;
};

const handleUltimoRegulamento = async (
  req: express.Request,
  res: express.Response
): Promise<void> => {
  const rawCnpj = getCnpjFromRequest(req);
  if (!rawCnpj) {
    res.status(400).json({ error: "cnpj_required" });
    return;
  }

  const cnpj = normalizeCnpj(rawCnpj);
  if (!isValidCnpjLength(cnpj)) {
    res.status(400).json({ error: "cnpj_invalid" });
    return;
  }

  const registros = await buscarFundosPorCnpj(cnpj);
  const registroResumo = pickRegistroResumo(registros);
  if (!registroResumo) {
    res.status(404).json({ error: "fundo_not_found" });
    return;
  }

  const registroFundo = await obterRegistroFundo(registroResumo.id);
  const regulamentos = await listarRegulamentos(registroFundo.id);
  const regulamento = pickLatestRegulamento(regulamentos);

  if (!regulamento || !regulamento.nomeArquivoRegulamento) {
    res.status(404).json({ error: "regulamento_not_found" });
    return;
  }

  const download = await baixarRegulamento(
    registroFundo.id,
    regulamento.nomeArquivoRegulamento
  );
  const contentFileName = extractFileName(download.contentDisposition);
  const fileName = contentFileName ?? regulamento.nomeArquivoRegulamento;
  const saved = await saveDownload(
    config.downloadDir,
    cnpj,
    fileName,
    download.buffer
  );
  const displayRoot = path.basename(config.downloadDir);
  const displayPath = path.join(displayRoot, saved.relativePath);

  logger.info(
    {
      cnpj,
      registroFundoId: registroFundo.id,
      regulamentoId: regulamento.id,
      filePath: saved.filePath
    },
    "regulamento baixado"
  );

  res.json({
    cnpj,
    registroFundoId: registroFundo.id,
    regulamentoId: regulamento.id,
    dataInicioVigencia: regulamento.dataInicioVigencia,
    fileName: saved.fileName,
    filePath: displayPath
  });
};

const asyncHandler = (
  handler: (req: express.Request, res: express.Response) => Promise<void>
) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    handler(req, res).catch(next);
  };
};

app.post("/regulamentos/ultimo", asyncHandler(handleUltimoRegulamento));
app.get("/regulamentos/ultimo", asyncHandler(handleUltimoRegulamento));

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (err instanceof CvmRequestError) {
      logger.warn(
        { status: err.status, url: err.url, body: err.body },
        "cvm request failed"
      );
      res.status(502).json({
        error: "cvm_request_failed",
        status: err.status
      });
      return;
    }

    logger.error({ err }, "unexpected error");
    res.status(500).json({ error: "internal_error" });
  }
);

app.listen(config.port, () => {
  logger.info({ port: config.port }, "server listening");
});
