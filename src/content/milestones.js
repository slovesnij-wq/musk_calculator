import csvText from "./milestones.csv?raw";

export const RATE_USD_PER_SECOND = 10717;

const SECONDS_FORMATTER = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (char === '"') {
      const next = text[i + 1];
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
};

const normalizeHeader = (value) => value.replace(/^\ufeff/, "").trim();

const normalizeNumber = (value) => value.replace(/[\s\u00a0\u202f]/g, "");

const parseAmount = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const compact = normalizeNumber(raw).replace(/[^\d.,-]/g, "");
  if (!compact) return null;

  const hasComma = compact.includes(",");
  const hasDot = compact.includes(".");
  let normalized = compact;

  if (hasComma && hasDot) {
    normalized = normalized.replace(/,/g, "");
  } else if (hasComma) {
    normalized = normalized.replace(/,/g, ".");
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseSeconds = (value) => {
  if (!value) return null;
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatSeconds = (value) => {
  if (!Number.isFinite(value)) return "";
  return SECONDS_FORMATTER.format(value);
};

const parseMilestones = (csv) => {
  const rows = parseCsv(csv).filter((row) => row.some((cell) => cell.trim() !== ""));
  if (rows.length === 0) return [];

  const headers = rows.shift().map(normalizeHeader);
  const headerIndex = Object.fromEntries(headers.map((header, index) => [header, index]));

  const getIndex = (candidates, fallback) => {
    for (const name of candidates) {
      if (headerIndex[name] !== undefined) {
        return headerIndex[name];
      }
    }
    return fallback;
  };

  const idIndex = getIndex(["№", "#", "id"], 0);
  const subjectIndex = getIndex(["Предмет"], 1);
  const rubIndex = getIndex(["Стоимость, руб"], 2);
  const usdIndex = getIndex(["Стоимость, $"], 3);
  const secondsIndex = getIndex(["Секунд зарабатывает маск"], 4);

  return rows
    .map((row, rowIndex) => {
      const idRaw = row[idIndex] ?? "";
      const idParsed = Number.parseInt(idRaw, 10);
      const label = (row[subjectIndex] ?? "").trim();
      const rubRaw = (row[rubIndex] ?? "").trim();
      const usdRaw = (row[usdIndex] ?? "").trim();
      const secondsLabelRaw = (row[secondsIndex] ?? "").trim();
      const usdValue = parseAmount(usdRaw);
      const secondsFromCsv = parseSeconds(secondsLabelRaw);
      const secondsFromUsd =
        Number.isFinite(usdValue) && RATE_USD_PER_SECOND > 0
          ? usdValue / RATE_USD_PER_SECOND
          : null;
      const seconds = Number.isFinite(secondsFromUsd) ? secondsFromUsd : secondsFromCsv;
      const secondsLabel =
        Number.isFinite(secondsFromUsd)
          ? formatSeconds(secondsFromUsd)
          : secondsLabelRaw || formatSeconds(secondsFromCsv);
      const sortKey = Number.isFinite(usdValue) ? usdValue : seconds;

      return {
        id: Number.isFinite(idParsed) ? idParsed : rowIndex + 1,
        label,
        rub: rubRaw,
        usd: usdRaw,
        usdValue,
        seconds,
        secondsLabel,
        sortKey,
      };
    })
    .filter((item) => item.label && item.usd && item.rub && Number.isFinite(item.sortKey))
    .sort((a, b) => a.sortKey - b.sortKey);
};

export const MILESTONES = parseMilestones(csvText);
