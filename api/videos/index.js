const { createCollection } = require("../shared/collection-store");
const { makeHandler } = require("../shared/handler");

const videos = createCollection({
  table: "videos",
  pk: "video",
  idFrom: "title",
  fields: {
    title: { type: "string", max: 140 },
    youtube: { type: "string", max: 200 },
    category: { type: "string", max: 40, default: "history" },
    note: { type: "string", max: 240 },
    order: { type: "number", default: 500 }
  },
  seed: []
});

module.exports = makeHandler({ collection: videos, required: ["title", "youtube"], key: "videos" });
