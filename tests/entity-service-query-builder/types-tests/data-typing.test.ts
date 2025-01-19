import EQBuilder from "../../../src/experimental";
import { TestModel } from "./fields-typing.test";

describe("Data types", () => {
  it("should set data with right type", () => {
    const query = new EQBuilder<TestModel, Partial<TestModel>>()
      .data({ id: "2" })
      .build();

    const dataTyped: Partial<TestModel> = query.data;
    expect(dataTyped.id).toEqual("2");
  });
});
