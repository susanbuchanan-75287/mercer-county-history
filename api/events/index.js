const { createCollection } = require("../shared/collection-store");
const { makeHandler } = require("../shared/handler");

/* Historical Society events & programs. Staff manage from the admin portal. */
const events = createCollection({
  table: "events",
  pk: "event",
  idFrom: "title",
  fields: {
    title: { type: "string", max: 140 },
    desc: { type: "string", max: 400 },
    cat: { type: "string", max: 20, enum: ["lecture", "workshop", "tour", "celebration", "family"], default: "lecture" },
    dateBig: { type: "string", max: 8, default: "—" },
    dateSmall: { type: "string", max: 12 },
    location: { type: "string", max: 140 },
    link: { type: "string", max: 300 },
    order: { type: "number", default: 500 }
  },
  seed: [
    { title: "West Virginia Day Celebration", desc: "Our signature annual celebration of West Virginia's birthday with speakers, exhibits and refreshments at 908 Harrison Street.", cat: "celebration", dateBig: "Jun 20", dateSmall: "annual", location: "908 Harrison St", order: 10 },
    { title: "Civil War in Mercer County — Lecture", desc: "An evening talk on Mercer County's role and stories from the Civil War era.", cat: "lecture", dateBig: "Fall", dateSmall: "evening", location: "Society HQ", order: 20 },
    { title: "Early Mercer County Industries", desc: "A look at the coal, rail and timber industries that built the county.", cat: "lecture", dateBig: "Fall", dateSmall: "evening", location: "Society HQ", order: 30 },
    { title: "Caring for Family Photos & Documents", desc: "A hands-on workshop on preserving your family's photographs, letters and records.", cat: "workshop", dateBig: "TBD", dateSmall: "workshop", location: "Society HQ", order: 40 },
    { title: "Downtown Princeton Walking Tour", desc: "A guided walking tour of historic downtown Princeton and Mercer Street.", cat: "tour", dateBig: "Seasonal", dateSmall: "Sat AM", location: "Mercer Street", order: 50 }
  ]
});

module.exports = makeHandler({ collection: events, required: ["title"], key: "events" });
