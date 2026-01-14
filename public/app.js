const downloadBtn = document.getElementById("download-btn");
const clearBtn = document.getElementById("clear-btn");
const cnpjInput = document.getElementById("cnpj-input");
const output = document.getElementById("output");
const statusBlock = document.getElementById("status-block");

const apiBase = document.body.dataset.apiBase || "";
const endpoint = `${apiBase.replace(/\/$/, "")}/regulamentos/ultimo`;

const createStatusRow = (label, value) => {
  const row = document.createElement("div");
  const strong = document.createElement("strong");
  strong.textContent = `${label}:`;
  row.appendChild(strong);
  row.append(` ${value ?? "-"}`);
  return row;
};

const setStatus = (status, fileName, filePath) => {
  statusBlock.replaceChildren(
    createStatusRow("Status", status),
    createStatusRow("Último arquivo", fileName),
    createStatusRow("Pasta", filePath)
  );
};

const formatJson = (data) => JSON.stringify(data, null, 2);

const setLoading = (isLoading) => {
  downloadBtn.disabled = isLoading;
  clearBtn.disabled = isLoading;
};

downloadBtn.addEventListener("click", async () => {
  const cnpj = cnpjInput.value.trim();
  if (!cnpj) {
    setStatus("cnpj obrigatorio", "-", "-");
    return;
  }

  setLoading(true);
  setStatus("baixando...", "-", "-");
  output.textContent = "{\n  \"loading\": true\n}";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cnpj })
    });
    const data = await response.json();
    output.textContent = formatJson(data);
    if (!response.ok) {
      setStatus("erro", "-", "-");
      return;
    }
    setStatus("concluido", data.fileName, data.filePath);
  } catch (error) {
    output.textContent = formatJson({ error: "network_error" });
    setStatus("erro de rede", "-", "-");
  } finally {
    setLoading(false);
  }
});

clearBtn.addEventListener("click", () => {
  cnpjInput.value = "";
  output.textContent = "{}";
  setStatus("aguardando", "-", "-");
});

cnpjInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    downloadBtn.click();
  }
});
