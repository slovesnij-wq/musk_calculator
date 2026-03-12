import csvText from "./milestones.csv?raw";

export const RATE_USD_PER_SECOND = 10717;

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

const parseSeconds = (value) => {
  if (!value) return null;
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
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
      const secondsLabel = (row[secondsIndex] ?? "").trim();
      const seconds = parseSeconds(secondsLabel);

      return {
        id: Number.isFinite(idParsed) ? idParsed : rowIndex + 1,
        label: (row[subjectIndex] ?? "").trim(),
        rub: (row[rubIndex] ?? "").trim(),
        usd: (row[usdIndex] ?? "").trim(),
        seconds,
        secondsLabel,
      };
    })
    .filter((item) => item.label && item.usd && item.rub && Number.isFinite(item.seconds))
    .sort((a, b) => a.seconds - b.seconds);
};

export const MILESTONES = parseMilestones(csvText);
