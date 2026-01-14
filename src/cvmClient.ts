import { config } from "./config";
import type {
  DownloadResult,
  RegulamentoFundo,
  RegistroFundo,
  RegistroResumo
} from "./types";

export class CvmRequestError extends Error {
  readonly status: number;
  readonly url: string;
  readonly body?: string;

  constructor(message: string, status: number, url: string, body?: string) {
    super(message);
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

const baseUrl = config.cvmBaseUrl.endsWith("/")
  ? config.cvmBaseUrl
  : `${config.cvmBaseUrl}/`;

const buildUrl = (path: string): string => new URL(path, baseUrl).toString();

const jsonHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json;charset=UTF-8",
  "User-Agent": config.userAgent
};

const fetchJson = async <T>(
  path: string,
  init: RequestInit
): Promise<T> => {
  const url = buildUrl(path);
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.text();
    throw new CvmRequestError(
      `CVM request failed with status ${response.status}`,
      response.status,
      url,
      body
    );
  }
  return (await response.json()) as T;
};

const fetchBinary = async (
  path: string,
  init: RequestInit
): Promise<DownloadResult> => {
  const url = buildUrl(path);
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = await response.text();
    throw new CvmRequestError(
      `CVM download failed with status ${response.status}`,
      response.status,
      url,
      body
    );
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    buffer,
    contentDisposition: response.headers.get("content-disposition"),
    contentType: response.headers.get("content-type")
  };
};

export const buscarFundosPorCnpj = async (
  cnpj: string
): Promise<RegistroResumo[]> => {
  return fetchJson<RegistroResumo[]>(
    "fundos/consultar/obter/registros/por/filtro",
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        filtro: {
          numeroRegistro: cnpj
        }
      })
    }
  );
};

export const obterRegistroFundo = async (
  id: number
): Promise<RegistroFundo> => {
  return fetchJson<RegistroFundo>(`fundos/registrar/obter/consulta/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "User-Agent": config.userAgent
    }
  });
};

export const listarRegulamentos = async (
  registroFundoId: number
): Promise<RegulamentoFundo[]> => {
  return fetchJson<RegulamentoFundo[]>("fundos/regulamento/obter/todos", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({
      registroFundo: {
        id: registroFundoId
      }
    })
  });
};

export const baixarRegulamento = async (
  registroFundoId: number,
  nomeArquivo: string
): Promise<DownloadResult> => {
  return fetchBinary("arquivo/download/regulamento/visualizacao", {
    method: "POST",
    headers: {
      Accept: "application/octet-stream",
      "Content-Type": "application/json;charset=UTF-8",
      "User-Agent": config.userAgent
    },
    body: JSON.stringify({
      registroFundo: {
        id: registroFundoId
      },
      nomeArquivo
    })
  });
};
