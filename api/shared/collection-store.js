/* Generic Azure Table Storage collection helper.
   Every managed resource (photos, videos, buttons, volunteers, shifts, events)
   is a "collection": rows in one table sharing a partition key. A collection is
   declared with a field schema so we get validation, coercion and seed-fallback
   for free without repeating the boilerplate in every resource.

   Reads the connection string from app setting DATA_STORAGE (falls back to
   MEDIA_STORAGE, EVENTS_STORAGE, then AzureWebJobsStorage). When none is
   configured the API serves the seed rows so the site still works read-only. */
const { TableClient } = require("@azure/data-tables");

function getConnString() {
  return (
    process.env.DATA_STORAGE ||
    process.env.MEDIA_STORAGE ||
    process.env.EVENTS_STORAGE ||
    process.env.AzureWebJobsStorage ||
    ""
  );
}

function isConfigured() {
  const c = getConnString();
  return !!c && !/UseDevelopmentStorage=true/i.test(c) && c.indexOf("AccountKey=") !== -1;
}

function coerce(field, value) {
  const t = field.type || "string";
  if (t === "number") {
    const n = Number(value);
    return Number.isFinite(n) ? n : (field.default != null ? field.default : 0);
  }
  if (t === "bool") {
    return value === true || value === "true" || value === 1 || value === "1";
  }
  // string
  let s = value == null ? (field.default != null ? String(field.default) : "") : String(value);
  s = s.trim();
  if (field.enum && field.enum.length && !field.enum.includes(s)) {
    s = field.default != null ? String(field.default) : field.enum[0];
  }
  if (field.max) s = s.slice(0, field.max);
  return s;
}

function slugify(s) {
  return (
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "item"
  );
}

/* Create a collection accessor.
   spec = { table, pk, fields: { name: {type,max,enum,default}, ... },
            seed: [ {..}, ... ], idFrom: "title" } */
function createCollection(spec) {
  const { table, pk, fields, seed = [], idFrom = "title" } = spec;
  const fieldNames = Object.keys(fields);

  function client() {
    return TableClient.fromConnectionString(getConnString(), table, { allowInsecureConnection: false });
  }

  function toEntity(obj) {
    const e = { partitionKey: pk, rowKey: String(obj.id) };
    for (const name of fieldNames) e[name] = coerce(fields[name], obj[name]);
    return e;
  }

  function fromEntity(e) {
    const obj = { id: e.rowKey };
    for (const name of fieldNames) {
      const f = fields[name];
      if (f.type === "number") obj[name] = Number.isFinite(e[name]) ? e[name] : (f.default != null ? f.default : 0);
      else if (f.type === "bool") obj[name] = !!e[name];
      else obj[name] = e[name] != null ? e[name] : (f.default != null ? String(f.default) : "");
    }
    return obj;
  }

  function sortRows(rows) {
    if (fieldNames.includes("order")) rows.sort((a, b) => (a.order || 0) - (b.order || 0));
    else if (fieldNames.includes("createdAt")) rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return rows;
  }

  async function ensureSeeded(c) {
    if (!seed.length) return;
    const iter = c.listEntities({ queryOptions: { filter: `PartitionKey eq '${pk}'` } });
    const first = await iter.next();
    if (!first.done) return;
    for (const row of seed) {
      await c.upsertEntity(toEntity(withId(row)), "Replace");
    }
  }

  function withId(obj) {
    if (obj.id && String(obj.id).trim()) return obj;
    const base = slugify(obj[idFrom]);
    return Object.assign({}, obj, { id: base + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5) });
  }

  async function list() {
    if (!isConfigured()) {
      return { rows: sortRows(seed.map(withId).map((r) => fromEntity(toEntity(r)))), configured: false };
    }
    const c = client();
    await c.createTable().catch(() => {});
    await ensureSeeded(c);
    const out = [];
    for await (const e of c.listEntities({ queryOptions: { filter: `PartitionKey eq '${pk}'` } })) out.push(fromEntity(e));
    return { rows: sortRows(out), configured: true };
  }

  async function upsert(obj) {
    const c = client();
    await c.createTable().catch(() => {});
    const withid = withId(obj);
    await c.upsertEntity(toEntity(withid), "Replace");
    return fromEntity(toEntity(withid));
  }

  async function remove(id) {
    const c = client();
    await c.deleteEntity(pk, String(id));
  }

  return { list, upsert, remove, isConfigured, fields, fieldNames };
}

module.exports = { createCollection, isConfigured, slugify };
