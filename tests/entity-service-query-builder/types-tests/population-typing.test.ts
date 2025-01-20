import { EQBuilder } from "../../../lib/cjs";
import { NestedModel, TestModel } from "./fields-typing.test";

describe("population types", () => {
  it("should create right populateRelation type", () => {
    const population = new EQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new EQBuilder<NestedModel>().eq("id", "value").field("id")
      )
      .populateRelation("nestedList", () =>
        new EQBuilder<NestedModel>().eq("name", "value2").field("name")
      )
      .build();

    expect(population).toBeDefined();

    const populateWithType: {
      populate: {
        nested: {
          fields: ["id"];
          filters: { $and: [{ id: { $eq: "value" } }] };
        };
        nestedList: {
          fields: ["name"];
          filters: { $and: [{ name: { $eq: "value2" } }] };
        };
      };
    } = population;

    expect(populateWithType.populate.nested).toBeDefined();
    expect(populateWithType.populate.nested.fields[0]).toBe("id");
    expect(populateWithType.populate.nested.filters.$and[0].id.$eq).toBe(
      "value"
    );

    expect(populateWithType.populate.nestedList).toBeDefined();
    expect(populateWithType.populate.nestedList.fields[0]).toBe("name");
    expect(populateWithType.populate.nestedList.filters.$and[0].name.$eq).toBe(
      "value2"
    );
  });

  it("should override prev populates wen populate all", () => {
    const population = new EQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new EQBuilder<NestedModel>().eq("id", "value").field("id")
      )
      .populateRelation("nestedList", () =>
        new EQBuilder<NestedModel>().eq("name", "value2").field("name")
      )
      .populateAll()
      .build();

    const populateWithType: { populate: "*" } = population;
    expect(populateWithType).toBeDefined();
    expect(populateWithType.populate).toBe("*");
  });

  it("should add populate all for key", () => {
    const populate = new EQBuilder<TestModel>()
      .populate("nested")
      .populate("nestedList")
      .build();
    const populateWithType: { populate: { nested: true; nestedList: true } } =
      populate;

    expect(populateWithType).toBeDefined();
    expect(populateWithType.populate.nested).toBe(true);
    expect(populateWithType.populate.nestedList).toBe(true);
  });

  it("should add populate all for key list", () => {
    const populate = new EQBuilder<TestModel>()
      .populates(["nested", "nestedList"])
      .build();

    const populateWithType: { populate: { nested: true; nestedList: true } } =
      populate;

    expect(populateWithType).toBeDefined();
    expect(populateWithType.populate.nested).toBe(true);
    expect(populateWithType.populate.nestedList).toBe(true);
  });

  it("should merge same keys", () => {
    const populate = new EQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new EQBuilder<NestedModel>().eq("id", "value").field("id")
      )
      .populateRelation("nested", () =>
        new EQBuilder<NestedModel>().notEq("name", "value2")
      )
      .build();

    const populateWithType: {
      populate: {
        nested: { filters: { $and: [{ name: { $not: { $eq: "value2" } } }] } };
      };
    } = populate;

    expect(populateWithType).toBeDefined();
    expect(populateWithType.populate.nested.filters.$and[0].name.$not.$eq).toBe(
      "value2"
    );
  });

  it("should create right populateDynamic type", () => {
    const dynamicZone = new EQBuilder<TestModel>()
      .populateDynamic("nested", "component.1", () =>
        new EQBuilder<NestedModel>().eq("id", "value")
      )
      .populateDynamic("nested", "component.2", () =>
        new EQBuilder<NestedModel>().notEq("id", "value1")
      )
      .populateDynamic("nested", "component.2", () =>
        new EQBuilder<NestedModel>().notEq("id", "value3")
      )
      .build();

    const typedTest: {
      populate: {
        nested: {
          on: {
            "component.1": { filters: { $and: [{ id: { $eq: "value" } }] } };
            "component.2": {
              filters: { $and: [{ id: { $not: { $eq: "value3" } } }] };
            };
          };
        };
      };
    } = dynamicZone;

    expect(typedTest).toBeDefined();
    expect(
      typedTest.populate.nested.on["component.1"].filters.$and[0].id.$eq
    ).toBe("value");
    expect(
      typedTest.populate.nested.on["component.2"].filters.$and[0].id.$not.$eq
    ).toBe("value3");
  });
});
