const times = 500;

const getQueryCompiled = () => {
const list1 = ["Link"];
return {fields:["Closeout","FashionName","GoodName","IsDeliverable","MinQuantityForOrder","ModelGoodID","PriceDiscountPercent","RetailPrice","RetailPriceWithDiscount","Slug","WarehouseQuantity"],sort:[{"RetailPriceWithDiscount":"asc"},{"RetailPrice":"asc"},{"WarehouseQuantity":"asc"},{"MinQuantityForOrder":"asc"},{"PriceDiscountPercent":"asc"}],filters:{$or:[{"RetailPrice":{"$between":[3,4]}},{"RetailPriceWithDiscount":{"$between":[1,2]}},{"Slug":{"$eq":"slug"}},{"Deep":{"$or":[{"RetailPrice":{"$between":[3,4]}},{"RetailPriceWithDiscount":{"$between":[1,2]}},{"Slug":{"$eq":"slug"}}]}}]},populate:{Covers:true,Alert:true,RetailPriceWithDiscount:true,RetailPrice:true,WarehouseQuantity:true,MinQuantityForOrder:true,PriceDiscountPercent:true,A1:{fields:list1},A2:{fields:list1},A3:{fields:list1},A4:{fields:list1},Layout:{on:{"layout.alert":{fields:["message","type"]},"layout.article":{fields:["Article"]},"layout.slider":{fields:["Arrows","AutoScroll","EnableDots","SideImages","SliderTimeoutSeconds"],populate:{Slides:{fields:list1}}},"layout.cardlist":{fields:["Description","Title"]},"layout.faq":{fields:["Answer","Question"]},"ts.goods-tab":{fields:["Label"]},"layout.social-links":{fields:["Alt","Link"]}}}},page:1,pageSize:26};
}

const buildStarts = performance.now();
for (let i = 0; i < times; i++) {
  getQueryCompiled();
}
const buildEnds = performance.now();

const meanBuildTime = buildEnds - buildStarts;

console.log(
  `Average compiled query performance: ${meanBuildTime}ms for ${times}times. Av: ${
    meanBuildTime / times
  }`
);
