import { compileStrapiQuery, SQBuilder } from "../../lib/cjs";

describe("Query compiler tests", () => {
  it("should serialize keys with special symbols", () => {
    const query = new SQBuilder().eq("some_key-key", 1);
    const compiled = compileStrapiQuery(query);
    expect(compiled.query).toEqual(
      '{filters:{$and:[{"some_key-key":{"$eq":1}}]}}'
    );
  });

  it("should serialize fields with 'as const'", () => {
    const query = new SQBuilder().field("test1").fields(["test2", "test3"]);
    const compiled = compileStrapiQuery(query);

    expect(compiled.query).toEqual(
      '{fields:["test1","test2","test3"] as ["test1","test2","test3"]}'
    );
    expect(compiled.constants).toEqual("");
  });

  it("should produce constants for same fields on any level with any order", () => {
    const query = new SQBuilder()
      .field("test1")
      .field("test2")
      .populateRelation("nestedRelation", () =>
        new SQBuilder()
          .field("test1")
          .field("test2")
          .populateRelation("deepNestedRelation", () =>
            new SQBuilder().field("test2").field("test1")
          )
      )
      .populateDynamic("dynamicZone", "comp1", () =>
        new SQBuilder().field("test1").field("test2")
      )
      .populateDynamic("dynamicZone", "comp2", () =>
        new SQBuilder().field("test2").field("test1")
      )
      .populateDynamic("dynamicZone", "comp2", () =>
        new SQBuilder().field("test1")
      );

    const compiled = compileStrapiQuery(query);

    expect(compiled.query).toEqual(
      '{fields:list1,populate:{nestedRelation:{fields:list1,populate:{deepNestedRelation:{fields:list1}}},dynamicZone:{on:{comp1:{fields:list1},comp2:{fields:["test1"] as ["test1"]}}}}}'
    );
    expect(compiled.constants).toEqual(
      'const list1 = ["test1","test2"] as ["test1","test2"];'
    );
  });

  it("should produce different constants for different lists", () => {
    const query = new SQBuilder()
      .field("test1")
      .field("test2")
      .populateRelation("nestedRelation", () =>
        new SQBuilder()
          .field("test1")
          .field("test2")
          .field("test3")
          .populateRelation("deepNestedRelation", () =>
            new SQBuilder()
              .field("test2")
              .field("test1")
              .populateRelation("deepNestedRelation", () =>
                new SQBuilder().field("test3").field("test2").field("test1")
              )
          )
      );

    const compiled = compileStrapiQuery(query);

    expect(compiled.query).toEqual(
      "{fields:list1,populate:{nestedRelation:{fields:list2,populate:{deepNestedRelation:{fields:list1,populate:{deepNestedRelation:{fields:list2}}}}}}}"
    );
    expect(compiled.constants).toEqual(
      'const list1 = ["test1","test2"] as ["test1","test2"];const list2 = ["test1","test2","test3"] as ["test1","test2","test3"];'
    );
  });

  it("should serialize sort with 'as const'", () => {
    const query = new SQBuilder()
      .sortAsc("test1")
      .sortsDesc(["test2", "test3"]);
    const compiled = compileStrapiQuery(query);

    expect(compiled.query).toEqual(
      '{sort:[{"test1":"asc"},{"test2":"desc"},{"test3":"desc"}] as [{"test1":"asc"},{"test2":"desc"},{"test3":"desc"}]}'
    );
  });

  it("should serialize sort with 'as const' with nested", () => {
    const query = new SQBuilder()
      .sortAsc("test1")
      .sortsDesc(["test2", "test.subKey"]);
    const compiled = compileStrapiQuery(query);

    expect(compiled.query).toEqual(
      '{sort:[{"test1":"asc"},{"test2":"desc"},{"test":{"subKey":"desc"}}] as [{"test1":"asc"},{"test2":"desc"},{"test":{"subKey":"desc"}}]}'
    );
  });

  it("should produce constants for same sorts on any level with exact order", () => {
    const query = new SQBuilder()
      .sortAsc("test1")
      .sortDesc("test2")
      .populateRelation("nestedRelation", () =>
        new SQBuilder()
          .sortAsc("test1")
          .sortDesc("test2")
          .populateRelation("deepNestedRelation", () =>
            new SQBuilder().sortAsc("test2").sortDesc("test1")
          )
      )
      .populateDynamic("dynamicZone", "comp1", () =>
        new SQBuilder().sortAsc("test1").sortDesc("test2")
      )
      .populateDynamic("dynamicZone", "comp2", () =>
        new SQBuilder().sortAsc("test2").sortDesc("test1")
      )
      .populateDynamic("dynamicZone", "comp2", () =>
        new SQBuilder().sortAsc("test1")
      );

    const compiled = compileStrapiQuery(query);

    expect(compiled.query).toEqual(
      '{sort:list1,populate:{nestedRelation:{sort:list1,populate:{deepNestedRelation:{sort:[{"test2":"asc"},{"test1":"desc"}] as [{"test2":"asc"},{"test1":"desc"}]}}},dynamicZone:{on:{comp1:{sort:list1},comp2:{sort:[{"test1":"asc"}] as [{"test1":"asc"}]}}}}}'
    );
    expect(compiled.constants).toEqual(
      'const list1 = [{"test1":"asc"},{"test2":"desc"}] as [{"test1":"asc"},{"test2":"desc"}];'
    );
  });

  it("should serialize filters", () => {
    const query = new SQBuilder().eq("attribute", "value");
    const compiled = compileStrapiQuery(query);

    expect(compiled.query).toEqual(
      '{filters:{$and:[{"attribute":{"$eq":"value"}}]}}'
    );
  });

  it("should serialize deep filter", () => {
    const query = new SQBuilder()
      .or()
      .filterDeep(() =>
        new SQBuilder().eq("attribute", "value").eq("attribute2", "value2")
      )
      .filterDeep(() =>
        new SQBuilder()
          .contains("attribute3", "value3")
          .contains("attribute4", "value4")
      );

    const compiled = compileStrapiQuery(query);

    expect(compiled.query).toEqual(
      '{filters:{$or:[{"$and":[{"attribute":{"$eq":"value"}},{"attribute2":{"$eq":"value2"}}]},{"$and":[{"attribute3":{"$contains":"value3"}},{"attribute4":{"$contains":"value4"}}]}]}}'
    );
  });

  it("should serialize populate", () => {
    const query = new SQBuilder()
      .populate("relation1")
      .populateRelation("relation2", () =>
        new SQBuilder()
          .sortAsc("test1")
          .field("test2")
          .eq("some.sub", "value3")
          .populate("relation3")
      );

    const compiled = compileStrapiQuery(query);

    expect(compiled.query).toEqual(
      '{populate:{relation1:true as true,relation2:{fields:["test2"] as ["test2"],sort:[{"test1":"asc"}] as [{"test1":"asc"}],filters:{$and:[{"some":{"sub":{"$eq":"value3"}}}]},populate:{relation3:true as true}}}}'
    );
  });

  it("should serialize publication state, locale", () => {
    const query = new SQBuilder().publicationState("preview").locale("ua");
    const compiled = compileStrapiQuery(query);

    expect(compiled.query).toEqual(
      '{publicationState:"preview" as "preview",locale:"ua" as "ua"}'
    );
  });

  it("should serialize pagination", () => {
    const query = new SQBuilder().page(1).pageSize(44);
    const compiled = compileStrapiQuery(query);

    expect(compiled.query).toEqual("{page:1 as 1,pageSize:44 as 44}");
  });

  it("should not serialize data, data can has many false-positive cases", () => {
    const query = new SQBuilder().data({ key: "value" });
    const compiled = compileStrapiQuery(query);

    expect(compiled.query).toEqual("{}");
  });
});
