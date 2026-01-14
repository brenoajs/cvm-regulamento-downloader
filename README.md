# cvm-regulamento-downloader

Servico em Node.js + TypeScript que consulta a CVM para localizar o regulamento mais recente de um fundo (por CNPJ), baixa o PDF e salva em disco. Inclui um frontend estatico servido pelo proprio backend.

## O que faz

- Normaliza o CNPJ informado (remove caracteres nao numericos).
- Consulta a CVM para obter o registro do fundo.
- Lista regulamentos e escolhe o mais recente (prioriza registros ativos com data).
- Faz download do PDF do regulamento e grava em `downloads/<cnpj>`.
- Retorna JSON com metadados do arquivo salvo.

## Requisitos

- Node 18+

## Como rodar

```bash
npm install
npm run build
npm start
```

Abra `http://localhost:3000/` para usar o frontend.

## Frontend

- Arquivos estaticos em `public/`.
- O frontend chama `POST /regulamentos/ultimo`.
- Para usar a API em outro host, ajuste `data-api-base` em `public/index.html`.

Exemplo:

```html
<body data-api-base="http://localhost:3000">
```

## API

- `GET /health`
  - Retorna status basico.

- `POST /regulamentos/ultimo`
  - Body: `{ "cnpj": "36498670000127" }`
  - Baixa o regulamento mais recente e salva em disco.

- `GET /regulamentos/ultimo?cnpj=36498670000127`
  - Mesmo comportamento do POST.

Resposta de exemplo:

```json
{
  "cnpj": "36498670000127",
  "registroFundoId": 43563,
  "regulamentoId": 135503,
  "dataInicioVigencia": "2025-05-14T03:00:00.000Z",
  "fileName": "DOC_REGUL_43563_135503_2025_05.pdf",
  "filePath": "downloads/36498670000127/DOC_REGUL_43563_135503_2025_05.pdf"
}
```

Obs: o separador de caminho depende do sistema operacional.

Erros comuns:

- `400 cnpj_required` (CNPJ nao informado)
- `400 cnpj_invalid` (CNPJ com tamanho invalido)
- `404 fundo_not_found` (nenhum fundo encontrado)
- `404 regulamento_not_found` (nenhum regulamento encontrado)
- `429 rate_limit_exceeded` (limite de taxa atingido)
- `502 cvm_request_failed` (falha ao consultar CVM)

## Armazenamento

- Caminho padrao: `./downloads/<cnpj>`.
- Nome do arquivo e sanitizado antes de salvar.
- Nao ha limpeza automatica de arquivos.

## Variaveis de ambiente

- `PORT` (default `3000`)
- `CVM_BASE_URL` (default `https://web.cvm.gov.br/app/fundosweb`)
- `DOWNLOAD_DIR` (default `./downloads`)
- `RATE_LIMIT_WINDOW_MS` (default `60000`)
- `RATE_LIMIT_MAX` (default `10`)
- `TRUST_PROXY` (default `false`)
- `USER_AGENT` (default `cvm-proxy/0.1.0`)

## Testes

Testes de frontend usam Playwright.

```bash
npx playwright install
npm run test
```
