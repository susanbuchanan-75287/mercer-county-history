/* Generic HTTP handler factory for a collection resource on Azure SWA.
   Handles GET (list) + POST/PUT (upsert) + DELETE, applying an admin gate.

   options:
     collection   - createCollection(...) instance
     adminRead    - if true, GET also requires the admin role (for PII, e.g. volunteers)
     required     - array of field names required on POST/PUT
     onCreate     - optional (obj,req) => obj  hook to stamp defaults (e.g. createdAt, status)
     publicWrite  - if true, POST is allowed without admin (e.g. volunteer applications,
                    shift sign-ups). PUT/DELETE always require admin.
     key          - response key for the array (default "rows")
*/
const { isAdmin } = require("./auth");

function json(context, status, body) {
  context.res = {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body
  };
}

function makeHandler(options) {
  const {
    collection,
    adminRead = false,
    required = [],
    onCreate = null,
    publicWrite = false,
    key = "rows"
  } = options;

  return async function (context, req) {
    const method = (req.method || "GET").toUpperCase();
    try {
      if (method === "GET") {
        if (adminRead && !isAdmin(req)) {
          return json(context, 403, { error: "Admin sign-in required to view these records." });
        }
        const { rows, configured } = await collection.list();
        return json(context, 200, { [key]: rows, configured });
      }

      const admin = isAdmin(req);
      const isCreate = method === "POST" || method === "PUT";

      // PUT/DELETE always admin. POST admin unless publicWrite.
      if (method === "DELETE" && !admin) {
        return json(context, 403, { error: "Admin sign-in required." });
      }
      if (method === "PUT" && !admin) {
        return json(context, 403, { error: "Admin sign-in required." });
      }
      if (method === "POST" && !publicWrite && !admin) {
        return json(context, 403, { error: "Admin sign-in required." });
      }

      if (!collection.isConfigured()) {
        return json(context, 503, {
          error: "Storage is not configured yet. Set the DATA_STORAGE app setting to an Azure Storage connection string."
        });
      }

      if (isCreate) {
        let body = req.body || {};
        for (const r of required) {
          if (body[r] == null || String(body[r]).trim() === "") {
            return json(context, 400, { error: "Missing required field: " + r });
          }
        }
        if (onCreate) body = onCreate(body, req, admin) || body;
        const saved = await collection.upsert(body);
        return json(context, 200, { row: saved });
      }

      if (method === "DELETE") {
        const id = (context.bindingData && context.bindingData.id) || (req.query && req.query.id);
        if (!id) return json(context, 400, { error: "Missing id." });
        await collection.remove(id);
        return json(context, 200, { deleted: id });
      }

      return json(context, 405, { error: "Method not allowed." });
    } catch (err) {
      context.log.error("collection error", err && err.message);
      return json(context, 500, { error: "Server error." });
    }
  };
}

module.exports = { makeHandler, json };
