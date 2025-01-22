import { SQBuilder } from "../../../lib/cjs";
import { NestedModel, TestModel } from "./fields-typing.test";

describe("Join functions", () => {
  it("should join fields", () => {
    const secondBuilder = new SQBuilder<TestModel>().fields([
      "options",
      "name",
    ] as const);

    const query = new SQBuilder<TestModel>()
      .field("id")
      .joinFields(secondBuilder)
      .build();

    const typedQuery: { fields: ["id", "options", "name"] } = query;
    expect(typedQuery);
    expect(typedQuery.fields[0]).toEqual("id");
    expect(typedQuery.fields[1]).toEqual("options");
    expect(typedQuery.fields[2]).toEqual("name");
  });

  it("should join sorts", () => {
    const secondBuilder = new SQBuilder<TestModel>().sortAsc("nested.id");

    const query = new SQBuilder<TestModel>()
      .sortAsc("name")
      .joinSort(secondBuilder)
      .build();

    const typedQuery: { sort: [{ name: "asc" }, { nested: { id: "asc" } }] } =
      query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.sort[0].name).toEqual("asc");
    expect(typedQuery.sort[1].nested.id).toEqual("asc");
  });

  it("should join filters without merging root logical", () => {
    const secondBuilder = new SQBuilder<TestModel>()
      .not()
      .or()
      .filterRelation("nested", () =>
        new SQBuilder<NestedModel>().not().or().eq("id", "1")
      );

    const query = new SQBuilder<TestModel>()
      .eq("description", "value")
      .joinFilters(secondBuilder)
      .build();

    const typedQuery: {
      filters: {
        $and: [
          { description: { $eq: "value" } },
          { nested: { $not: { $or: [{ id: { $eq: "1" } }] } } }
        ];
      };
    } = query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.filters.$and[0].description.$eq).toEqual("value");
    expect(typedQuery.filters.$and[1].nested.$not.$or[0].id.$eq).toEqual("1");
  });

  it("should join filters with merging root logical", () => {
    const secondBuilder = new SQBuilder<TestModel>()
      .not()
      .or()
      .filterRelation("nested", () =>
        new SQBuilder<NestedModel>().not().or().eq("id", "1")
      );

    const query = new SQBuilder<TestModel>()
      .eq("description", "value")
      .joinFilters(secondBuilder, true, true)
      .build();

    const typedQuery: {
      filters: {
        $not: {
          $or: [
            { description: { $eq: "value" } },
            { nested: { $not: { $or: [{ id: { $eq: "1" } }] } } }
          ];
        };
      };
    } = query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.filters.$not.$or[0].description.$eq).toEqual("value");
    expect(typedQuery.filters.$not.$or[1].nested.$not.$or[0].id.$eq).toEqual(
      "1"
    );
  });

  it("should join populate", () => {
    const secondBuilder = new SQBuilder<TestModel>().populateDynamic(
      "nestedList",
      "component.1",
      () => new SQBuilder<NestedModel>().field("name")
    );

    const query = new SQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new SQBuilder<NestedModel>().field("id")
      )
      .joinPopulate(secondBuilder)
      .build();

    const typedQuery: {
      populate: {
        nested: { fields: ["id"] };
        nestedList: { on: { "component.1": { fields: ["name"] } } };
      };
    } = query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.populate.nested.fields[0]).toEqual("id");
    expect(typedQuery.populate.nestedList.on["component.1"].fields[0]).toEqual(
      "name"
    );
  });

  it("should join pagination on query", () => {
    const secondQuery = new SQBuilder<TestModel>().page(1).pageSize(26);
    const query = new SQBuilder<TestModel>()
      .field("id")
      .joinPagination(secondQuery)
      .build();

    const typedQuery: { fields: ["id"]; page: 1; pageSize: 26 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.fields[0]).toEqual("id");
    expect(typedQuery.page).toBe(1);
    expect(typedQuery.pageSize).toBe(26);
  });

  it("should join and override pagination on query", () => {
    const secondQuery = new SQBuilder<TestModel>().start(1).limit(26);
    const query = new SQBuilder<TestModel>()
      .field("id")
      .page(1)
      .pageSize(40)
      .joinPagination(secondQuery)
      .build();

    const typedQuery: { fields: ["id"]; start: 1; limit: 26 } = query;
    expect(typedQuery).toBeDefined();
    expect(typedQuery.fields[0]).toEqual("id");
    expect(typedQuery.start).toBe(1);
    expect(typedQuery.limit).toBe(26);
  });

  it("should join all", () => {
    const joinQuery = new SQBuilder<TestModel>()
      .field("id")
      .sortAsc("id")
      .eq("id", "1")
      .filterRelation("nested", () =>
        new SQBuilder<NestedModel>().eq("name", "value")
      )
      .populate("nested");

    const query = new SQBuilder<TestModel>()
      .field("description")
      .sortAsc("options")
      .eq("notNestedEnumeration", "test")
      .filterDeep(() =>
        new SQBuilder<TestModel>().or().eq("name", "test").eq("name", "test2")
      )
      .populateRelation("nestedList", () =>
        new SQBuilder<NestedModel>().field("name")
      )
      .joinQuery(joinQuery)
      .build();

    const typedQuery: {
      fields: ["description", "id"];
      sort: [{ options: "asc" }, { id: "asc" }];
      filters: {
        $and: [
          { notNestedEnumeration: { $eq: "test" } },
          { $or: [{ name: { $eq: "test" } }, { name: { $eq: "test2" } }] },
          { id: { $eq: "1" } },
          { nested: { $and: [{ name: { $eq: "value" } }] } }
        ];
      };
      populate: {
        nestedList: {
          fields: ["name"];
        };
        nested: true;
      };
    } = query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.fields[0]).toEqual("description");
    expect(typedQuery.fields[1]).toEqual("id");

    expect(typedQuery.sort[0].options).toEqual("asc");
    expect(typedQuery.sort[1].id).toEqual("asc");

    expect(typedQuery.filters.$and[0].notNestedEnumeration.$eq).toEqual("test");
    expect(typedQuery.filters.$and[1].$or[0].name.$eq).toEqual("test");
    expect(typedQuery.filters.$and[1].$or[1].name.$eq).toEqual("test2");
    expect(typedQuery.filters.$and[2].id.$eq).toEqual("1");
    expect(typedQuery.filters.$and[3].nested.$and[0].name.$eq).toEqual("value");

    expect(typedQuery.populate.nestedList.fields[0]).toEqual("name");
    expect(typedQuery.populate.nested).toEqual(true);
  });
});
