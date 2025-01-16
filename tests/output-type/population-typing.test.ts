import EQBuilder from "../../src/experimental";
import { NestedModel, TestModel } from "./fields-typing.test";

describe("population types", () => {
  it("should create right type", () => {
    const population = new EQBuilder<TestModel>()
      .populateRelation("nested", () =>
        new EQBuilder<NestedModel>().eq("id", "value")
      )
      .build();

    console.log(JSON.stringify(population, null, 2));

    const dynamicZone = new EQBuilder<TestModel>()
      .populateDynamic("nested", "component.1", () =>
        new EQBuilder<NestedModel>().eq("id", "value")
      )
      .populateDynamic("nested", "component.2", () =>
        new EQBuilder<NestedModel>().eq("id", "value")
      )
      .build();

    console.log(JSON.stringify(dynamicZone, null, 2));
  });
});
