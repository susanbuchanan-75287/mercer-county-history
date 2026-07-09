const { createCollection } = require("../shared/collection-store");
const { makeHandler } = require("../shared/handler");

const photos = createCollection({
  table: "photos",
  pk: "photo",
  idFrom: "title",
  fields: {
    title: { type: "string", max: 120 },
    url: { type: "string", max: 400 },
    alt: { type: "string", max: 200 },
    page: { type: "string", max: 24, enum: ["home", "museums", "programs", "research", "contact"], default: "home" },
    caption: { type: "string", max: 240 },
    order: { type: "number", default: 500 }
  },
  seed: [
    { title: "Society headquarters, 908 Harrison Street", url: "img/mchs/society-building.jpg", alt: "The Mercer County Historical Society building", page: "home", caption: "Our home at 908 Harrison Street, Princeton.", order: 10 },
    { title: "1911 Mercer County map", url: "img/mchs/county-map.jpg", alt: "Antique 1911 map of Mercer County", page: "research", caption: "An antique 1911 map from our archives.", order: 20 },
    { title: "West Virginia Day flyer", url: "img/mchs/wvday-flyer.jpg", alt: "West Virginia Day Celebration flyer", page: "programs", caption: "Our annual West Virginia Day Celebration.", order: 30 }
  ]
});

module.exports = makeHandler({ collection: photos, required: ["title", "url"], key: "photos" });
