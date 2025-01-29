import { RQBuilder } from "../../../lib/cjs";
import {
  NestedModel,
  TestModel,
} from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("Join functions", () => {
  it("should join fields", () => {
    const secondBuilder = new RQBuilder<TestModel>().fields([
      "options",
      "name",
    ] as const);

    const query = new RQBuilder<TestModel>()
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
    const secondBuilder = new RQBuilder<TestModel>().sortAsc("nested.id");

    const query = new RQBuilder<TestModel>()
      .sortAsc("name")
      .joinSort(secondBuilder)
      .build();

    // @ts-expect-error
    const typedQuery: { sort: ["name:asc", "nested.id:asc"] } = query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.sort[0]).toEqual("name:asc");
    expect(typedQuery.sort[1]).toEqual("nested.id:asc");
  });

  it("should join filters without merging root logical", () => {
    const secondBuilder = new RQBuilder<TestModel>()
      .not()
      .or()
      .filterRelation("nested", () =>
        new RQBuilder<NestedModel>().not().or().eq("id", "1")
      );

    const query = new RQBuilder<TestModel>()
      .eq("description", "value")
      .joinFilters(secondBuilder)
      .build();

    // @ts-expect-error
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
    const secondBuilder = new RQBuilder<TestModel>()
      .not()
      .or()
      .filterRelation("nested", () =>
        new RQBuilder<NestedModel>().not().or().eq("id", "1")
      );

    const query = new RQBuilder<TestModel>()
      .eq("description", "value")
      .joinFilters(secondBuilder, true, true)
      .build();

    // @ts-expect-error
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
    const secondBuilder = new RQBuilder<TestModel>().populateDynamic(
      "nestedList",
      "component.1",
      () => new RQBuilder<NestedModel>().field("name")
    );

    const query = new RQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new RQBuilder<NestedModel>().field("id")
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

  it("should join populate with populateAll override", () => {
    const secondBuilder = new RQBuilder<TestModel>().populateAll();

    const query = new RQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new RQBuilder<NestedModel>().field("id")
      )
      .joinPopulate(secondBuilder)
      .build();

    const typedQuery: {
      populate: "*";
    } = query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.populate).toEqual("*");
  });

  it("should join pagination on query", () => {
    const secondQuery = new RQBuilder<TestModel>().page(1).pageSize(26);
    const query = new RQBuilder<TestModel>()
      .field("id")
      .joinPagination(secondQuery)
      .build();

    // @ts-expect-error
    const typedQuery: {
      fields: ["id"];
      pagination: { page: 1; pageSize: 26 };
    } = query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.fields[0]).toEqual("id");
    expect(typedQuery.pagination.page).toBe(1);
    expect(typedQuery.pagination.pageSize).toBe(26);
  });

  it("should join and override pagination on query", () => {
    const secondQuery = new RQBuilder<TestModel>().start(1).limit(26);
    const query = new RQBuilder<TestModel>()
      .field("id")
      .page(1)
      .pageSize(40)
      .joinPagination(secondQuery)
      .build();

    // @ts-expect-error
    const typedQuery: { fields: ["id"]; pagination: { start: 1; limit: 26 } } =
      query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.fields[0]).toEqual("id");
    expect(typedQuery.pagination.start).toBe(1);
    expect(typedQuery.pagination.limit).toBe(26);
  });

  it("should join all", () => {
    const joinQuery = new RQBuilder<TestModel>()
      .field("id")
      .sortAsc("id")
      .eq("id", "1")
      .filterRelation("nested", () =>
        new RQBuilder<NestedModel>().eq("name", "value")
      )
      .populate("nested")
      .page(2)
      .pageSize(26);

    const query = new RQBuilder<TestModel>()
      .field("description")
      .sortAsc("options")
      .eq("notNestedEnumeration", "test")
      .filterDeep(() =>
        new RQBuilder<TestModel>().or().eq("name", "test").eq("name", "test2")
      )
      .populateRelation("nestedList", () =>
        new RQBuilder<NestedModel>().field("name")
      )
      .joinQuery(joinQuery)
      .build();

    // @ts-expect-error
    const typedQuery: {
      fields: ["description", "id"];
      sort: ["options:asc", "id:asc"];
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
        nested: { populate: "*" };
      };
      pagination: { page: 2; pageSize: 26 };
    } = query;

    expect(typedQuery).toBeDefined();
    expect(typedQuery.fields[0]).toEqual("description");
    expect(typedQuery.fields[1]).toEqual("id");

    expect(typedQuery.sort[0]).toEqual("options:asc");
    expect(typedQuery.sort[1]).toEqual("id:asc");

    expect(typedQuery.filters.$and[0].notNestedEnumeration.$eq).toEqual("test");
    expect(typedQuery.filters.$and[1].$or[0].name.$eq).toEqual("test");
    expect(typedQuery.filters.$and[1].$or[1].name.$eq).toEqual("test2");
    expect(typedQuery.filters.$and[2].id.$eq).toEqual("1");
    expect(typedQuery.filters.$and[3].nested.$and[0].name.$eq).toEqual("value");

    expect(typedQuery.populate.nestedList.fields[0]).toEqual("name");
    expect(typedQuery.populate.nested.populate).toEqual("*");
    expect(typedQuery.pagination.page).toBe(2);
    expect(typedQuery.pagination.pageSize).toBe(26);
  });
});
