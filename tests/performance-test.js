const SQBuilder = require("../lib/cjs/index").default;

const times = 500;

let query;
const assigmentStarts = performance.now();
for (let i = 0; i < times; i++) {
  query = new SQBuilder();
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
    .filters("RetailPrice")
    .between([3, 4])
    .filters("RetailPriceWithDiscount")
    .between([1, 2])
    .filters("Slug", (b) => b.eq("slug"))
    .filterDeep("Deep", (nestedBuilder) =>
      nestedBuilder
        .or()
        .filters("RetailPrice")
        .between([3, 4])
        .filters("RetailPriceWithDiscount")
        .between([1, 2])
        .filters("Slug", (b) => b.eq("slug"))
    )
    .sortsRaw([
      { key: "RetailPriceWithDiscount", type: "asc" },
      { key: "RetailPrice", type: "asc" },
    ])
    .populate("Covers")
    .populate("Alert")
    .populate("Layout", (layoutBuilder) => {
      layoutBuilder
        .on("layout.alert", (alertBuilder) => {
          alertBuilder.fields(["type", "message"]);
        })
        .on("layout.article", (articleBuilder) => {
          articleBuilder.fields(["Article"]);
        })
        .on("layout.slider", (sliderBuilder) => {
          sliderBuilder
            .fields([
              "SliderTimeoutSeconds",
              "EnableDots",
              "Arrows",
              "AutoScroll",
              "SideImages",
            ])
            .populate("Slides", (photoBuilder) =>
              photoBuilder.fields(["Link"])
            );
        })
        .on("layout.cardlist", (serverCardBuilder) => {
          serverCardBuilder.populate("Cards", (cardBuilder) =>
            cardBuilder.fields(["Title", "Description"])
          );
        })
        .on("layout.faq", (faqBuilder) =>
          faqBuilder.fields(["Question", "Answer"])
        )
        .on("ts.goods-tab", (productTabBuilder) => {
          productTabBuilder.fields(["Label"]);
        })
        .on("layout.social-links", (socialLinksBuilder) => {
          socialLinksBuilder.populate("Links", (b) => {
            b.fields(["Link", "Alt"]);
          });
        });
    });
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
