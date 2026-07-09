const { createCollection } = require("../shared/collection-store");
const { makeHandler } = require("../shared/handler");

const buttons = createCollection({
  table: "buttons",
  pk: "button",
  idFrom: "label",
  fields: {
    label: { type: "string", max: 60 },
    url: { type: "string", max: 400 },
    location: { type: "string", max: 24, enum: ["home-hero", "support", "museums", "footer"], default: "home-hero" },
    style: { type: "string", max: 12, enum: ["gold", "ghost", "teal"], default: "gold" },
    newTab: { type: "bool", default: false },
    order: { type: "number", default: 500 }
  },
  seed: [
    { label: "Become a member", url: "support.html", location: "home-hero", style: "gold", order: 10 },
    { label: "Visit the museums", url: "museums.html", location: "home-hero", style: "ghost", order: 20 }
  ]
});

module.exports = makeHandler({ collection: buttons, required: ["label", "url"], key: "buttons" });
