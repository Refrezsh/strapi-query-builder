import { SQBuilder } from "../../../lib/cjs";
import { TestModel } from "./fields-typing.test";
import { PublicationStates } from "../../../lib/cjs/query-types-util";

describe("SQBuilder service specific", () => {
  it("should set live publication state", () => {
    const query = new SQBuilder<TestModel>().publicationState("live").build();
    const typedQuery: { publicationState: PublicationStates | undefined } =
      query;

    expect(typedQuery.publicationState).toEqual("live");
  });

  it("should set preivew publication state", () => {
    const query = new SQBuilder<TestModel>()
      .publicationState("preview")
      .build();
    const typedQuery: { publicationState: PublicationStates | undefined } =
      query;

    expect(typedQuery.publicationState).toEqual("preview");
  });

  it("should set any locale", () => {
    const query = new SQBuilder<TestModel>().locale("ua").build();
    const typedQuery: { locale: string | undefined } = query;

    expect(typedQuery.locale).toEqual("ua");
  });
});
