import { TestModel } from "./fields-typing.test";
import { SQBuilder } from "../../../lib/cjs";

describe("SQBuilder data", () => {
  it("should set data with right type", () => {
    const query = new SQBuilder<TestModel, Partial<TestModel>>()
      .data({ id: "2" })
      .build();

    const dataTyped: Partial<TestModel> = query.data;
    expect(dataTyped.id).toEqual("2");
  });
});
