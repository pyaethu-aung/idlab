export const EXPORT_FORMATS = ["txt", "json", "csv", "sql", "env"];

function asTxt(uuids) {
  return { content: uuids.join("\n"), mimeType: "text/plain" };
}

function asJson(uuids) {
  return {
    content: JSON.stringify(uuids, null, 2),
    mimeType: "application/json",
  };
}

function asCsv(uuids) {
  const rows = uuids.map((u, i) => `${i + 1},${u}`);
  return {
    content: ["index,uuid", ...rows].join("\n"),
    mimeType: "text/csv",
  };
}

function asSql(uuids) {
  const values = uuids.map((u) => `  ('${u}')`).join(",\n");
  return {
    content: `-- replace table/column names as needed\nINSERT INTO uuids (id) VALUES\n${values};`,
    mimeType: "text/plain",
  };
}

function asEnv(uuids) {
  const lines = uuids.map((u, i) => `UUID_${i + 1}=${u}`);
  return { content: lines.join("\n"), mimeType: "text/plain" };
}

const serializers = { txt: asTxt, json: asJson, csv: asCsv, sql: asSql, env: asEnv };

export function exportUuids(uuids, format, timestamp) {
  const serialize = serializers[format] ?? serializers.txt;
  const { content, mimeType } = serialize(uuids);
  const ext = format === "env" ? "env" : format;
  return {
    content,
    mimeType,
    filename: `uuids-${uuids.length}-${timestamp}.${ext}`,
  };
}
