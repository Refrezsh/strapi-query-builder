import { RQBuilder } from "../../../lib/cjs";
import { TestModel } from "../../entity-service-query-builder/types-tests/fields-typing.test";

describe("Service specific types", () => {
  it("should set live publication state", () => {
    const query = new RQBuilder<TestModel>().publicationState("live").build();
    // @ts-expect-error
    const typedQuery: { publicationState: "live" } = query;

    expect(typedQuery.publicationState).toEqual("live");
  });

  it("should set preivew publication state", () => {
    const query = new RQBuilder<TestModel>()
      .publicationState("preview")
      .build();
    // @ts-expect-error
    const typedQuery: { publicationState: "preview" } = query;

    expect(typedQuery.publicationState).toEqual("preview");
  });

  it("should set any locale", () => {
    const query = new RQBuilder<TestModel>().locale("ua").build();
    // @ts-expect-error
    const typedQuery: { locale: "ua" } = query;

    expect(typedQuery.locale).toEqual("ua");
  });
});
