import { RQBuilder } from "../../../lib/cjs";
import { TestModel } from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("RQBuilder data", () => {
  it("should set data with right type", () => {
    const query = new RQBuilder<TestModel, Partial<TestModel>>()
      .data({ id: "2" })
      .build();

    const dataTyped: Partial<TestModel> | undefined = query.data;
    expect(dataTyped?.id).toEqual("2");
  });
});
