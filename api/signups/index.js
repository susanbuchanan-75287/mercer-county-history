const { createCollection } = require("../shared/collection-store");
const { makeHandler } = require("../shared/handler");

/* Shift sign-ups. GET is admin-only (personal data). */
const signups = createCollection({
  table: "signups",
  pk: "signup",
  idFrom: "name",
  fields: {
    name: { type: "string", max: 120 },
    email: { type: "string", max: 160 },
    phone: { type: "string", max: 40 },
    shiftId: { type: "string", max: 80 },
    shiftLabel: { type: "string", max: 200 },
    createdAt: { type: "string", max: 30 }
  },
  seed: []
});

function onCreate(body) { if (!body.createdAt) body.createdAt = new Date().toISOString(); return body; }

module.exports = makeHandler({ collection: signups, required: ["name", "email", "shiftId"], adminRead: true, publicWrite: true, onCreate, key: "signups" });
