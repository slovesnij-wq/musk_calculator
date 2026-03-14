import csvText from "./milestones.csv?raw";

export const RATE_USD_PER_SECOND = 9677.82;

const SECONDS_FORMATTER = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatAmount = (value, raw) => {
  if (!Number.isFinite(value)) return raw || "";
  const hasFraction = raw && /[.,]\d/.test(raw);
  const formatter = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: hasFraction ? 2 : 0,
    minimumFractionDigits: hasFraction ? 2 : 0,
  });
  return formatter.format(value).replace(/\u00a0/g, " ");
};

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
    // Use the last separator as decimal and strip the other one as thousands.
    const lastComma = compact.lastIndexOf(",");
    const lastDot = compact.lastIndexOf(".");
    const decimal = lastComma > lastDot ? "," : ".";
    const thousands = decimal === "," ? "." : ",";
    normalized = compact.split(thousands).join("").replace(decimal, ".");
  } else if (hasComma) {
    // "1,234,567" => thousands, "1,23" => decimal.
    normalized = /^\d{1,3}(,\d{3})+$/.test(compact)
      ? compact.replace(/,/g, "")
      : compact.replace(/,/g, ".");
  } else if (hasDot) {
    // "1.234.567" => thousands, "1.23" => decimal.
    normalized = /^\d{1,3}(\.\d{3})+$/.test(compact)
      ? compact.replace(/\./g, "")
      : compact;
  }

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

  return rows
    .map((row, rowIndex) => {
      const idRaw = row[idIndex] ?? "";
      const idParsed = Number.parseInt(idRaw, 10);
      const label = (row[subjectIndex] ?? "").trim();
      const rubRaw = (row[rubIndex] ?? "").trim();
      const usdRaw = (row[usdIndex] ?? "").trim();
      const usdValue = parseAmount(usdRaw);
      const secondsFromUsd =
        Number.isFinite(usdValue) && RATE_USD_PER_SECOND > 0
          ? usdValue / RATE_USD_PER_SECOND
          : null;
      const triggerAtSeconds = secondsFromUsd;
      const secondsLabel = formatSeconds(secondsFromUsd);
      const sortKey = triggerAtSeconds;
      const parsedId = Number.isFinite(idParsed) ? idParsed : rowIndex + 1;
      const triggerKey = Number.isFinite(triggerAtSeconds)
        ? `sec:${triggerAtSeconds}`
        : Number.isFinite(usdValue)
          ? `usd:${usdValue}`
          : `row:${rowIndex}`;
      const eventId = `${parsedId}:${rowIndex}:${triggerKey}`;

      return {
        id: parsedId,
        eventId,
        label,
        rub: formatAmount(parseAmount(rubRaw), rubRaw),
        usd: formatAmount(usdValue, usdRaw),
        usdValue,
        seconds: triggerAtSeconds,
        triggerAtSeconds,
        secondsLabel,
        sortKey,
      };
    })
    .filter((item) => item.label && item.usd && item.rub && Number.isFinite(item.sortKey))
    .sort((a, b) => a.sortKey - b.sortKey);
};

export const MILESTONES = parseMilestones(csvText);
