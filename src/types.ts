export type RegistroResumo = {
  id: number;
  numeroRegistro?: number | string;
  dataRegistro?: string;
  codigoCVM?: number;
};

export type RegistroFundo = {
  id: number;
  registro?: {
    id?: number;
  };
};

export type RegulamentoFundo = {
  id: number;
  dataInicioVigencia?: string;
  nomeArquivoRegulamento?: string;
  ativo?: boolean;
};

export type DownloadResult = {
  buffer: Buffer;
  contentDisposition?: string | null;
  contentType?: string | null;
};
