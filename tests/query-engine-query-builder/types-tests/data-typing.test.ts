import { QQBuilder } from "../../../lib/cjs";
import { TestModel } from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("QQBuilder data", () => {
  it("should set data with right type", () => {
    const query = new QQBuilder<TestModel, Partial<TestModel>>()
      .data({ id: "2" })
      .build();

    const dataTyped: Partial<TestModel> | undefined = query.data;
    expect(dataTyped?.id).toEqual("2");
  });
});
