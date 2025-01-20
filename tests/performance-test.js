const EQBuilder = require("../lib/cjs/index").EQBuilder;

const times = 500;

let query;
const assigmentStarts = performance.now();
for (let i = 0; i < times; i++) {
  query = new EQBuilder();
  query
    .fields([
      "GoodName",
      "FashionName",
      "ModelGoodID",
      "Slug",
      "WarehouseQuantity",
      "MinQuantityForOrder",
      "RetailPrice",
      "RetailPriceWithDiscount",
      "PriceDiscountPercent",
      "Closeout",
      "IsDeliverable",
    ])
    .or()
    .between("RetailPrice", [3, 4])
    .between("RetailPriceWithDiscount", [1, 2])
    .eq("Slug", "slug")
    .filterRelation("Deep", () =>
      new EQBuilder()
        .or()
        .between("RetailPrice", [3, 4])
        .between("RetailPriceWithDiscount", [1, 2])
        .eq("Slug", "slug")
    )
    .sortsAsc([
      "RetailPriceWithDiscount",
      "RetailPrice",
      "WarehouseQuantity",
      "MinQuantityForOrder",
      "RetailPrice",
      "RetailPriceWithDiscount",
      "PriceDiscountPercent",
    ])
    .populate("Covers")
    .populate("Alert")
    .populates([
      "RetailPriceWithDiscount",
      "RetailPrice",
      "WarehouseQuantity",
      "MinQuantityForOrder",
      "RetailPrice",
      "RetailPriceWithDiscount",
      "PriceDiscountPercent",
    ])
    .populateRelation("A1", () => new EQBuilder().fields(["Link"]))
    .populateRelation("A2", () => new EQBuilder().fields(["Link"]))
    .populateRelation("A3", () => new EQBuilder().fields(["Link"]))
    .populateRelation("A4", () => new EQBuilder().fields(["Link"]))
    .populateDynamic("Layout", "layout.alert", () =>
      new EQBuilder().field("type").field("message")
    )
    .populateDynamic("Layout", "layout.article", () =>
      new EQBuilder().field("Article")
    )
    .populateDynamic("Layout", "layout.slider", () =>
      new EQBuilder()
        .field("SliderTimeoutSeconds")
        .field("EnableDots")
        .field("Arrows")
        .field("AutoScroll")
        .field("SideImages")
        .populateRelation("Slides", () => new EQBuilder().fields(["Link"]))
    )
    .populateDynamic("Layout", "layout.cardlist", () =>
      new EQBuilder().field("Title").field("Description")
    )
    .populateDynamic("Layout", "layout.faq", () =>
      new EQBuilder().fields(["Question", "Answer"])
    )
    .populateDynamic("Layout", "ts.goods-tab", () =>
      new EQBuilder().fields(["Label"])
    )
    .populateDynamic("Layout", "layout.social-links", () =>
      new EQBuilder().fields(["Link", "Alt"])
    )
    .page(1, 26);
}
const assigmentEnds = performance.now();

const buildStarts = performance.now();
for (let i = 0; i < times; i++) {
  query.build();
}
const buildEnds = performance.now();

const meanAssigmentTime = assigmentEnds - assigmentStarts;
const meanBuildTime = buildEnds - buildStarts;
const assignAndBuild = meanAssigmentTime + meanBuildTime;

console.log(
  `Query assign: ${meanAssigmentTime}ms for ${times}times. Av: ${
    meanAssigmentTime / times
  }`
);
console.log(
  `Average query build: ${meanBuildTime}ms for ${times}times. Av: ${
    meanBuildTime / times
  }`
);
console.log(
  `Average query performance: ${assignAndBuild}ms for ${times}. Av: ${
    assignAndBuild / times
  }`
);
