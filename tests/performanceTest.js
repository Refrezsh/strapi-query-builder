const SQBuilder = require("../lib/cjs/index").default

const times = 100;
let queryAssigmentSum = 0;
let queryBuildingSum = 0;

for (let i = 0; i < times; i++) {
  const assigmentStarts = process.hrtime();

  // Create huge QUERY
  const query = new SQBuilder();
  // Yah some queries can be really large
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
    .filters("Deep")
    .with((nestedBuilder) =>
      nestedBuilder
        .or()
        .filters("RetailPrice")
        .between([3, 4])
        .filters("RetailPriceWithDiscount")
        .between([1, 2])
        .filters("Slug", (b) => b.eq("slug"))
    )
    .sort([
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

  queryAssigmentSum += process.hrtime(assigmentStarts)[1] / 1000000;

  const buildStarts = process.hrtime();
  const builtQuery = query.build();
  queryBuildingSum += process.hrtime(buildStarts)[1] / 1000000;
}

const meanAssigmentTime = queryAssigmentSum / times;
const meanBuildTime = queryBuildingSum / times;
console.log(`Average query assign: ${meanAssigmentTime}ms`);
console.log(`Average query build: ${meanBuildTime}ms`);
console.log(
  `Average query performance: ${meanAssigmentTime + meanBuildTime}ms`
);
