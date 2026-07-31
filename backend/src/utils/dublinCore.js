// Dublin Core (oai_dc) mapping used by the OAI-PMH endpoint so that national
// aggregators (EthERNet / NADRE) can harvest the repository.

const TYPE_TO_DC = {
  book: "Book",
  thesis: "Thesis",
  journal: "Article",
  module: "Learning Object",
  exam: "Examination Paper",
  reference: "Reference Work",
};

const LANGUAGE_TO_ISO = {
  en: "eng",
  am: "amh",
  or: "orm",
  ti: "tir",
  other: "und",
};

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function element(name, value) {
  if (value === null || value === undefined || value === "") return "";
  return `<dc:${name}>${escapeXml(value)}</dc:${name}>`;
}

// Maps a resource row to Dublin Core elements.
function toDublinCore(resource, baseUrl) {
  const elements = [
    element("title", resource.title),
    element("title", resource.title_am),
    element("creator", resource.author),
    element("subject", resource.subject),
    ...String(resource.keywords || "")
      .split(",")
      .map((k) => element("subject", k.trim())),
    element("description", resource.abstract),
    element("publisher", resource.publisher || "Wolkite University"),
    element("date", resource.publication_year),
    element("type", TYPE_TO_DC[resource.resource_type] || "Text"),
    element("format", resource.file_path ? "application/pdf" : "text"),
    element("identifier", `${baseUrl}/resources/${resource.id}`),
    element("identifier", resource.isbn ? `ISBN:${resource.isbn}` : ""),
    element("language", LANGUAGE_TO_ISO[resource.language] || "und"),
    element("relation", resource.college_name || ""),
    element("rights", "Wolkite University Library - academic use only"),
  ];
  return elements.filter(Boolean).join("");
}

module.exports = { toDublinCore, escapeXml, TYPE_TO_DC, LANGUAGE_TO_ISO };
