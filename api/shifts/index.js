const { createCollection } = require("../shared/collection-store");
const { makeHandler } = require("../shared/handler");

/* Open-hours volunteer shifts for the Historical Society. */
const shifts = createCollection({
  table: "shifts",
  pk: "shift",
  idFrom: "role",
  fields: {
    role: { type: "string", max: 120 },
    date: { type: "string", max: 40 },
    time: { type: "string", max: 60 },
    needed: { type: "number", default: 2 },
    note: { type: "string", max: 240 },
    order: { type: "number", default: 500 }
  },
  seed: [
    { role: "Archives assistant", date: "By appointment", time: "Weekday mornings", needed: 2, note: "Help catalog and preserve documents and photographs.", order: 10 },
    { role: "Front desk / greeter", date: "Open hours", time: "By schedule", needed: 2, note: "Welcome researchers and visitors to 908 Harrison Street.", order: 20 },
    { role: "Walking-tour guide", date: "Seasonal", time: "Saturday mornings", needed: 2, note: "Lead downtown Princeton history walks.", order: 30 }
  ]
});

module.exports = makeHandler({ collection: shifts, required: ["role", "date"], key: "shifts" });
