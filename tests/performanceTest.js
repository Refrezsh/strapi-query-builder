"use strict";
exports.__esModule = true;
var sq_builder_1 = require("../src/sq-builder");
var times = 100;
var queryAssigmentSum = 0;
var queryBuildingSum = 0;
for (var i = 0; i < times; i++) {
    var assigmentStarts = process.hrtime();
    // Create huge QUERY
    var query = new sq_builder_1.SQBuilder();
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
        .filters("Slug", function (b) { return b.eq("slug"); })
        .filters("Deep")["with"](function (nestedBuilder) {
        return nestedBuilder
            .or()
            .filters("RetailPrice")
            .between([3, 4])
            .filters("RetailPriceWithDiscount")
            .between([1, 2])
            .filters("Slug", function (b) { return b.eq("slug"); });
    })
        .sort([
        { key: "RetailPriceWithDiscount", type: "asc" },
        { key: "RetailPrice", type: "asc" },
    ])
        .populate("Covers")
        .populate("Alert")
        .populate("Layout", function (layoutBuilder) {
        layoutBuilder
            .on("layout.alert", function (alertBuilder) {
            alertBuilder.fields(["type", "message"]);
        })
            .on("layout.article", function (articleBuilder) {
            articleBuilder.fields(["Article"]);
        })
            .on("layout.slider", function (sliderBuilder) {
            sliderBuilder
                .fields([
                "SliderTimeoutSeconds",
                "EnableDots",
                "Arrows",
                "AutoScroll",
                "SideImages",
            ])
                .populate("Slides", function (photoBuilder) {
                return photoBuilder.fields(["Link"]);
            });
        })
            .on("layout.cardlist", function (serverCardBuilder) {
            serverCardBuilder.populate("Cards", function (cardBuilder) {
                return cardBuilder.fields(["Title", "Description"]);
            });
        })
            .on("layout.faq", function (faqBuilder) {
            return faqBuilder.fields(["Question", "Answer"]);
        })
            .on("ts.goods-tab", function (productTabBuilder) {
            productTabBuilder.fields(["Label"]);
        })
            .on("layout.social-links", function (socialLinksBuilder) {
            socialLinksBuilder.populate("Links", function (b) {
                b.fields(["Link", "Alt"]);
            });
        });
    });
    queryAssigmentSum += process.hrtime(assigmentStarts)[1] / 1000000;
    var buildStarts = process.hrtime();
    var builtQuery = query.build();
    queryBuildingSum += process.hrtime(buildStarts)[1] / 1000000;
}
var meanAssigmentTime = queryAssigmentSum / times;
var meanBuildTime = queryBuildingSum / times;
console.log("Average query assign: ".concat(meanAssigmentTime, "ms"));
console.log("Average query build: ".concat(meanBuildTime, "ms"));
console.log("Average query performance: ".concat(meanAssigmentTime + meanBuildTime, "ms"));
