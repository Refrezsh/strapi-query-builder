import EQBuilder from "../../../src/experimental";
import { TestModel } from "./fields-typing.test";

describe("Service specific types", () => {
  it("should set live publication state", () => {
    const query = new EQBuilder<TestModel>().publicationState("live").build();
    const typedQuery: { publicationState: "live" } = query;

    expect(typedQuery.publicationState).toEqual("live");
  });

  it("should set preivew publication state", () => {
    const query = new EQBuilder<TestModel>()
      .publicationState("preview")
      .build();
    const typedQuery: { publicationState: "preview" } = query;

    expect(typedQuery.publicationState).toEqual("preview");
  });

  it("should set any locale", () => {
    const query = new EQBuilder<TestModel>().locale("ua").build();
    const typedQuery: { locale: "ua" } = query;

    expect(typedQuery.locale).toEqual("ua");
  });
});
