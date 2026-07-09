const { createCollection } = require("../shared/collection-store");
const { makeHandler } = require("../shared/handler");

/* Volunteer applications (screening). GET is admin-only (personal data). */
const volunteers = createCollection({
  table: "volunteers",
  pk: "volunteer",
  idFrom: "name",
  fields: {
    name: { type: "string", max: 120 },
    email: { type: "string", max: 160 },
    phone: { type: "string", max: 40 },
    interest: { type: "string", max: 120 },
    availability: { type: "string", max: 200 },
    message: { type: "string", max: 800 },
    consent: { type: "bool", default: false },
    status: { type: "string", max: 12, enum: ["pending", "screening", "approved", "rejected"], default: "pending" },
    notes: { type: "string", max: 800 },
    createdAt: { type: "string", max: 30 }
  },
  seed: []
});

function onCreate(body, req, admin) {
  if (!body.createdAt) body.createdAt = new Date().toISOString();
  if (!admin) { body.status = "pending"; body.notes = ""; }
  return body;
}

module.exports = makeHandler({ collection: volunteers, required: ["name", "email"], adminRead: true, publicWrite: true, onCreate, key: "volunteers" });
