// Minimal OAI-PMH 2.0 provider exposing the repository as oai_dc records so
// national aggregators can harvest Wolkite University's collection.
const express = require("express");
const { query, queryOne } = require("../config/db");
const { asyncHandler } = require("../middleware/errorHandler");
const { toDublinCore, escapeXml } = require("../utils/dublinCore");
const env = require("../config/env");

const router = express.Router();

const SELECT_RECORDS = `
  SELECT r.*, c.name_en AS college_name, c.code AS college_code
    FROM resources r
    LEFT JOIN colleges c ON c.id = r.college_id
   WHERE r.is_deleted = 0`;

const utc = (value) =>
  new Date(String(value).replace(" ", "T")).toISOString().replace(/\.\d{3}Z$/, "Z");

const identifierFor = (id) => `oai:wku.edu.et:resource/${id}`;

function envelope(verb, params, body) {
  const attrs = Object.entries(params)
    .filter(([key, value]) => key !== "verb" && value)
    .map(([key, value]) => `${key}="${escapeXml(value)}"`)
    .join(" ");
  return `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
  <responseDate>${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")}</responseDate>
  <request ${verb ? `verb="${escapeXml(verb)}" ` : ""}${attrs}>${escapeXml(env.oai.baseUrl)}</request>
  ${body}
</OAI-PMH>`;
}

const errorResponse = (code, message) =>
  `<error code="${code}">${escapeXml(message)}</error>`;

const recordXml = (row) => `<record>
    <header>
      <identifier>${identifierFor(row.id)}</identifier>
      <datestamp>${utc(row.updated_at || row.created_at)}</datestamp>
      <setSpec>type:${row.resource_type}</setSpec>
      ${row.college_code ? `<setSpec>college:${escapeXml(row.college_code)}</setSpec>` : ""}
    </header>
    <metadata>
      <oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"
                 xmlns:dc="http://purl.org/dc/elements/1.1/"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/ http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
        ${toDublinCore(row, env.oai.baseUrl.replace(/\/oai$/, ""))}
      </oai_dc:dc>
    </metadata>
  </record>`;

function setFilter(set) {
  if (!set) return { clause: "", params: [] };
  const [kind, value] = String(set).split(":");
  if (kind === "type") return { clause: " AND r.resource_type = ?", params: [value] };
  if (kind === "college") return { clause: " AND c.code = ?", params: [value] };
  return null;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { verb, identifier, metadataPrefix, set, from, until } = req.query;
    res.type("application/xml");

    const send = (body) => res.send(envelope(verb, req.query, body));

    if (metadataPrefix && metadataPrefix !== "oai_dc") {
      return send(
        errorResponse("cannotDisseminateFormat", "Only oai_dc is supported"),
      );
    }

    if (verb === "Identify") {
      const oldest = await queryOne(
        "SELECT MIN(created_at) AS earliest FROM resources WHERE is_deleted = 0",
      );
      return send(`<Identify>
    <repositoryName>${escapeXml(env.oai.repositoryName)}</repositoryName>
    <baseURL>${escapeXml(env.oai.baseUrl)}</baseURL>
    <protocolVersion>2.0</protocolVersion>
    <adminEmail>${escapeXml(env.oai.adminEmail)}</adminEmail>
    <earliestDatestamp>${oldest.earliest ? utc(oldest.earliest) : "1970-01-01T00:00:00Z"}</earliestDatestamp>
    <deletedRecord>persistent</deletedRecord>
    <granularity>YYYY-MM-DDThh:mm:ssZ</granularity>
  </Identify>`);
    }

    if (verb === "ListMetadataFormats") {
      return send(`<ListMetadataFormats>
    <metadataFormat>
      <metadataPrefix>oai_dc</metadataPrefix>
      <schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>
      <metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace>
    </metadataFormat>
  </ListMetadataFormats>`);
    }

    if (verb === "ListSets") {
      const types = await query(
        "SELECT DISTINCT resource_type FROM resources WHERE is_deleted = 0",
      );
      const colleges = await query("SELECT code, name_en FROM colleges");
      const sets = [
        ...types.map(
          (t) =>
            `<set><setSpec>type:${t.resource_type}</setSpec><setName>${t.resource_type}</setName></set>`,
        ),
        ...colleges.map(
          (c) =>
            `<set><setSpec>college:${escapeXml(c.code)}</setSpec><setName>${escapeXml(c.name_en)}</setName></set>`,
        ),
      ].join("");
      return send(`<ListSets>${sets}</ListSets>`);
    }

    if (verb === "GetRecord") {
      const id = Number.parseInt(String(identifier || "").split("/").pop(), 10);
      const row = Number.isNaN(id)
        ? null
        : await queryOne(`${SELECT_RECORDS} AND r.id = ?`, [id]);
      if (!row) {
        return send(errorResponse("idDoesNotExist", "Unknown identifier"));
      }
      return send(`<GetRecord>${recordXml(row)}</GetRecord>`);
    }

    if (verb === "ListRecords" || verb === "ListIdentifiers") {
      const filter = setFilter(set);
      if (!filter) return send(errorResponse("badArgument", "Unknown set"));

      let sql = SELECT_RECORDS + filter.clause;
      const params = [...filter.params];
      if (from) {
        sql += " AND r.updated_at >= ?";
        params.push(String(from).replace("T", " ").replace("Z", ""));
      }
      if (until) {
        sql += " AND r.updated_at <= ?";
        params.push(String(until).replace("T", " ").replace("Z", ""));
      }
      sql += " ORDER BY r.updated_at DESC LIMIT 100";

      const rows = await query(sql, params);
      if (rows.length === 0) {
        return send(errorResponse("noRecordsMatch", "No records match the request"));
      }
      if (verb === "ListIdentifiers") {
        const headers = rows
          .map(
            (row) => `<header>
      <identifier>${identifierFor(row.id)}</identifier>
      <datestamp>${utc(row.updated_at || row.created_at)}</datestamp>
      <setSpec>type:${row.resource_type}</setSpec>
    </header>`,
          )
          .join("");
        return send(`<ListIdentifiers>${headers}</ListIdentifiers>`);
      }
      return send(`<ListRecords>${rows.map(recordXml).join("")}</ListRecords>`);
    }

    return send(errorResponse("badVerb", "Unknown or missing verb"));
  }),
);

module.exports = { router };
