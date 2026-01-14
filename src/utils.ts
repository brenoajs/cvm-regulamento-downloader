import type { RegulamentoFundo, RegistroResumo } from "./types";

export const normalizeCnpj = (input: string): string =>
  input.replace(/\D/g, "");

export const isValidCnpjLength = (cnpj: string): boolean => cnpj.length === 14;

const toDateValue = (value?: string): number => {
  if (!value) {
    return 0;
  }
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
};

export const pickRegistroResumo = (
  registros: RegistroResumo[]
): RegistroResumo | undefined => {
  if (registros.length === 0) {
    return undefined;
  }
  return [...registros].sort((a, b) => {
    const dateDiff = toDateValue(b.dataRegistro) - toDateValue(a.dataRegistro);
    if (dateDiff !== 0) {
      return dateDiff;
    }
    return (b.id ?? 0) - (a.id ?? 0);
  })[0];
};

export const pickLatestRegulamento = (
  regulamentos: RegulamentoFundo[]
): RegulamentoFundo | undefined => {
  if (regulamentos.length === 0) {
    return undefined;
  }
  const withDate = regulamentos.filter((regulamento) =>
    Boolean(regulamento.dataInicioVigencia)
  );
  const active = withDate.filter((regulamento) => regulamento.ativo === true);
  const candidates = active.length > 0 ? active : withDate.length > 0 ? withDate : regulamentos;

  return [...candidates].sort((a, b) => {
    const dateDiff =
      toDateValue(b.dataInicioVigencia) - toDateValue(a.dataInicioVigencia);
    if (dateDiff !== 0) {
      return dateDiff;
    }
    return (b.id ?? 0) - (a.id ?? 0);
  })[0];
};
