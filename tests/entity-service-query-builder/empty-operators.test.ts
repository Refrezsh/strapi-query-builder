import { SQBuilder } from "../../lib/cjs";

const emptyObject = {};

describe("Empty operators", () => {
  it("should be empty for logical filters", () => {
    const query = new SQBuilder().or().and().not().build();
    expect(query).toEqual(emptyObject);
  });
});
